import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.removeUnusedStyles', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const text = document.getText();

			const styleRegex = /styles\.(\w+)/g;
			const matches = text.match(styleRegex) || [];

			const definedStylesRegex = /StyleSheet\.create\(\{([\s\S]*?)\}\);/;
			const definedStylesMatch = text.match(definedStylesRegex);

			if (definedStylesMatch) {
				const definedStylesBlock = definedStylesMatch[1];
				const definedStyleNames = definedStylesBlock.match(/(\w+):\s+\{/g) || [];

				let newStylesBlock = definedStylesBlock;

				definedStyleNames.forEach(style => {
					const styleName = style.replace(/:\s+\{/, '').trim();
					if (!matches.includes(`styles.${styleName}` as never)) {
						const stylePattern = new RegExp(`${styleName}:\\s*\\{[^\\}]*\\},?`, 'g');
						newStylesBlock = newStylesBlock.replace(stylePattern, '');
					}
				});

				// Yeni stilleri eski stillerin yerine koy
				const newText = text.replace(definedStylesBlock, newStylesBlock);

				const edit = new vscode.WorkspaceEdit();
				const start = new vscode.Position(0, 0);
				const end = new vscode.Position(document.lineCount, 0);
				edit.replace(document.uri, new vscode.Range(start, end), newText);

				return vscode.workspace.applyEdit(edit).then(success => {
					if (success) {
						vscode.window.showInformationMessage('Unused styles removed successfully.');
					} else {
						vscode.window.showErrorMessage('Failed to remove unused styles.');
					}
				});
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
