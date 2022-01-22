import * as vscode from 'vscode';

const selector: vscode.DocumentSelector = { language: "rust" };
export class KeywordCompletionItemProvider implements vscode.CompletionItemProvider {
	static readonly triggerCharacters = [];

	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const result: vscode.CompletionItem[] = [];

		let autocompleteMethod: Boolean = position.line === 0 ? true : false;

		if (autocompleteMethod) {
			result.push({
				label: "println",
				insertText: `println!()`,
				detail: 'Macro for printing text',
				kind: vscode.CompletionItemKind.Method
			});
		}

		if (position.line !== 0) {
			result.push({
				label: "println",
				insertText: `println!`,
				detail: 'Macro to print output to stdout',
				kind: vscode.CompletionItemKind.Field
			});
		}

		result.push({
			label: "https://cool.com",
			kind: vscode.CompletionItemKind.Keyword
		});

		["const", "let"].forEach(str => {
			result.push({
				label: str,
				insertText: `${str} `,
				kind: vscode.CompletionItemKind.Keyword
			});
		});

		return result;
	}
}

export class HeaderCompletionItemProvider implements vscode.CompletionItemProvider {
	static readonly triggerCharacters = [':'];

	provideCompletionItems(_document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const result: vscode.CompletionItem[] = [];

		if (position.line === 0) { return result; }

		result.push({
			label: "sweet",
			detail: 'HTTP MIME type',
			kind: vscode.CompletionItemKind.EnumMember
		});

		return result;
	}
}

export class CacheVariableCompletionItemProvider implements vscode.CompletionItemProvider {
	static readonly triggerCharacters = ['$'];

	provideCompletionItems(_document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const result: vscode.CompletionItem[] = [];

		result.push({
			label: "wicki",
			kind: vscode.CompletionItemKind.Variable
		});

		return result;
	}
}

export class VariableCompletionItemProvider implements vscode.CompletionItemProvider {
	static readonly triggerCharacters = ['.'];

	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const result: vscode.CompletionItem[] = [];

		let text = document.lineAt(position.line).text.substring(0, position.character);
		let startingIndex = Math.max(text.lastIndexOf(' '), text.lastIndexOf('='), text.lastIndexOf('/')) + 1;
		let varName = text.substring(startingIndex).trim();

		if (!varName.startsWith('$')) { return result; }

		varName = varName.substr(1, varName.length - 2);


		result.push({
			label: "sick",
			kind: vscode.CompletionItemKind.Variable
		});
		return result;
	}
}


export function registerLanguageProvider(): vscode.Disposable {
	const disposables: vscode.Disposable[] = [];

	// TODO add hover provider or definition provider
	disposables.push(vscode.languages.registerCompletionItemProvider(selector, new KeywordCompletionItemProvider(), ...KeywordCompletionItemProvider.triggerCharacters));
	disposables.push(vscode.languages.registerCompletionItemProvider(selector, new HeaderCompletionItemProvider(), ...HeaderCompletionItemProvider.triggerCharacters));
	disposables.push(vscode.languages.registerCompletionItemProvider(selector, new CacheVariableCompletionItemProvider(), ...CacheVariableCompletionItemProvider.triggerCharacters));
	disposables.push(vscode.languages.registerCompletionItemProvider(selector, new VariableCompletionItemProvider(), ...VariableCompletionItemProvider.triggerCharacters));
	return vscode.Disposable.from(...disposables);
}