import {Component, OnInit} from '@angular/core';
import {VscodeService} from "./core/services/vscode.service";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface PsiNode {
  name: string;
  children?: PsiNode[];
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

  constructor(private vscodeService: VscodeService) {
  }

  ngOnInit(): void {
    this.dataSource.data = [];
    this.vscodeService.addListener("psi", result => {
      this.dataSource.data = result
    })
  }

  hasChild = (_: number, node: PsiNode) => !!node.children && node.children.length > 0;
}
