import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {VscodeService} from "./core/services/vscode.service";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTree, MatTreeNestedDataSource} from "@angular/material/tree";


interface PsiNode {
  name: string;
  id?: string;
  attr?: PsiAttr;
  children?: PsiNode[];
}

interface Range {
  start: number;
  end: number;
}

interface PsiAttr {
  range: Range;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'PsiViewer';
  treeControl = new NestedTreeControl<PsiNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<PsiNode>();
  selectPosition?: number = undefined;
  idGenerator = 0;
  selectId?: string;

  constructor(private vscodeService: VscodeService,
              private elementRef: ElementRef,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.dataSource.data = [];
    this.vscodeService.addListener("psi", result => {
      this.idGenerator = 0;
      this.makeId(result);
      this.dataSource.data = result
      this.select()
    })
    this.vscodeService.addListener("psi_select", position => {
      this.select(position);
    })
  }

  hasChild = (_: number, node: PsiNode) => !!node.children && node.children.length > 0;

  makeId(nodes: PsiNode[]) {
    for (const node of nodes) {
      node.id = `lua${this.idGenerator}`;
      this.idGenerator++;
      if (node.children) {
        this.makeId(node.children);
      }
    }
  }

  select(position?: number) {
    if (position !== undefined) {
      this.selectPosition = position;
    }
    const data = this.dataSource.data;
    if (data[0]) {
      this.extendPoint(data[0]);
    }
  }

  extendPoint(node: PsiNode) {
    const position = this.selectPosition;
    const attr = node.attr;
    if (attr !== undefined && position !== undefined) {
      if (attr.range.start <= position && attr.range.end >= position) {
        this.treeControl.expand(node);
        if (node.children) {
          for (const child of node.children) {
            this.extendPoint(child);
          }
        } else {
          this.selectId = node.id;
          setTimeout(() => this.highlight(node), 500);
        }
      }
    }
  }

  highlight(psi: PsiNode) {
    const treeNode = this.elementRef.nativeElement.querySelector(`#${psi.id}`)
    if (treeNode) {
      treeNode.scrollIntoView({behavior: 'smooth'});
    }
  }
}
