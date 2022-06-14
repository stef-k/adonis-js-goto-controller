'use strict';

import { 
  workspace, 
  Position, 
  Range, 
  CancellationToken, 
  DocumentLink, 
  DocumentLinkProvider, 
  TextDocument, 
  Uri, 
  ProviderResult, 
  window 
} from 'vscode';
import * as util from './util'

export class LinkProvider implements DocumentLinkProvider {
    /**
   * provideDocumentLinks
   */
  public provideDocumentLinks(document: TextDocument, token: CancellationToken): ProviderResult<DocumentLink[]> {
    let documentLinks = [];
    let index = 0;
    let reg = /(['"])[^'"]*\1/g;
    while (index < document.lineCount) {
      let line = document.lineAt(index);
      let result = line.text.match(reg);
      if (result !== null) {
        for (let item of result) {
          let splitted = item.replace(/\"|\'/g, '').split('.');
          if (splitted.length !== 2) {
            //Search for the Controller keyword in the string name
            if (splitted[0].includes('Controller')) {
              //In this case, because there is no method definition in routes
              //we send it to the index method by default
              splitted[1] = 'index';
            } else {
              continue;
            }
          }

          let filePath = util.getFilePath(splitted[0], document);


          if (filePath !== null) {
            let start = new Position(line.lineNumber, line.text.indexOf(item) + 1);
            let end = start.translate(0, item.length - 2);
            let documentLink = new util.AdonisJSControllerLink(new Range(start, end), filePath, splitted[0], splitted[1]);
            documentLinks.push(documentLink);
          }
        }
      }
      index++;
    }
    return documentLinks;
  }

  /**
   * resolveDocumentLink
   */
  public resolveDocumentLink(link: util.AdonisJSControllerLink, token: CancellationToken): ProviderResult<DocumentLink> {
    let lineNum = util.getLineNumber(link.funcName, link.filePath);
    let path = link.filePath;
    if (lineNum !== -1) {
      path += "#" + lineNum;
    } else {
      const showNoMethodMessage = workspace.getConfiguration('adonis_js_goto_controller').showNoMethodMessage;
      if (showNoMethodMessage) window.showWarningMessage(`The method ${link.funcName} does not exist in the ${link.controllerName}`);
    }

    link.target = Uri.parse("file:" + path);
    return link;
  }
}
