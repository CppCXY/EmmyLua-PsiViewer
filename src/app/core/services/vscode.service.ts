import {Injectable} from '@angular/core';

declare function acquireVsCodeApi(): any;

@Injectable({
  providedIn: 'root'
})
export class VscodeService {

  vscode: any;
  handles = new Map<string, (params: any) => void>()

  constructor() {
    // this.vscode = acquireVsCodeApi();
    this.vscodeInit();
  }

  get isVscode(): boolean {
    return this.vscode !== undefined;
  }

  addListener(type: string, handle: (params: any) => void) {
    this.handles.set(type, handle);
  }

  postMessage(type: string, message: any) {
    this.vscode?.postMessage({
      type,
      message
    })
  }

  vscodeInit() {
    // Handle the message inside the webview
    window.addEventListener('message', event => {
      const message = event.data; // The JSON data our extension sent
      if (this.handles.has(message.type)) {
        const handle = this.handles.get(message.type as string);
        if (handle) {
          handle(message.value);
        }
      }
    });
  }
}
