'use strict';

import { workspace, TextDocument, DocumentLink, Range, Uri } from 'vscode';
import * as fs from 'fs';
// @ts-ignore
import * as readLine from 'n-readlines';

export class AdonisJSControllerLink extends DocumentLink {
  filePath: string;
  funcName: string;
  controllerName: string;
  constructor(range: Range, path: string, controllerName: string, funcName: string) {
    // @ts-ignore
    super(range, null);
    this.filePath = path;
    this.controllerName = controllerName;
    this.funcName = funcName;
  }
}

/**
 * Finds the controler's filepath
 * @param text
 * @param document
 */
export function getFilePath(text: string, document: TextDocument) {
  let pathCtrl = '/app/Controllers'; // initial pathController value in package.json
  pathCtrl = workspace.getConfiguration('adonis_js_goto_controller').pathController; // default settings or user settings
  // @ts-ignore
  let filePath = workspace.getWorkspaceFolder(document.uri).uri.fsPath + pathCtrl;
  // split the method (if not a resource controller) from the controller name
  // check first for js extension
  let controllerFileName = text.replace(/\./g, '/').replace(/\"|\'/g, '') + '.js';

  if (controllerFileName.includes('\\')) {
    controllerFileName = controllerFileName.replace(/\\/g, '\/');
  }

  let targetPath = filePath + '/' + controllerFileName;

  if (fs.existsSync(targetPath)) {
    return targetPath;
  }
  let dirItems = fs.readdirSync(filePath);
  for (let item of dirItems) {
    targetPath = filePath + '/' + item + '/' + controllerFileName;
    if (fs.existsSync(targetPath)) {
      return targetPath;
    }
  }

    // check first for ts extension
    controllerFileName = text.replace(/\./g, '/').replace(/\"|\'/g, '') + '.ts';

    if (controllerFileName.includes('\\')) {
      controllerFileName = controllerFileName.replace(/\\/g, '\/');
    }

    targetPath = filePath + '/' + controllerFileName;

    if (fs.existsSync(targetPath)) {
      return targetPath;
    }
    dirItems = fs.readdirSync(filePath);
    for (let item of dirItems) {
      targetPath = filePath + '/' + item + '/' + controllerFileName;
      if (fs.existsSync(targetPath)) {
        return targetPath;
      }
    }
  return null;
}

export function getLineNumber(text: string, path: string) {
  let file = new readLine(path);
  let lineNum = 0;
  let line: any;
  while (line = file.next()) {
      lineNum++;
      line = line.toString();
      if (line.toLowerCase().includes(text.toLowerCase() + '(') || line.toLowerCase().includes(text.toLowerCase() + ' (')) {
          return lineNum;
      }
  }
  return -1;
}
