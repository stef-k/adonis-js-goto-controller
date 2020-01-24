// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace, languages, Hover, ExtensionContext } from 'vscode';
import { LinkProvider } from './link';
import * as util from './util';

const REG = /(['"])[^'"]*\1/;

export function activate(context: ExtensionContext) {
	console.log('Adonis JS goto controller activated')
	let hover = languages.registerHoverProvider('javascript', {
			provideHover(document, position, token) {
					let linkRange = document.getWordRangeAtPosition(position, REG);
					if (linkRange) {
							let filePath = util.getFilePath(document.getText(linkRange), document);
							let workspaceFolder = workspace.getWorkspaceFolder(document.uri);
							if (filePath != null) {
									return new Hover(workspaceFolder.name + filePath.replace(workspaceFolder.uri.fsPath, ''));
							}
					}
					return;
			}
	});
	let link = languages.registerDocumentLinkProvider('javascript', new LinkProvider());
	context.subscriptions.push(hover);
	context.subscriptions.push(link);
}

export function deactivate() {
	//
}
