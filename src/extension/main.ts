import { parseMarkdown, writeCellsToMarkdown, RawNotebookCell } from './markdownParser';
import { registerLanguageProvider } from './languageProvider';
import { searchNotes } from './commands/search';
import { runMdbook } from './commands/mdbook';
import { Kernel } from './kernel';
import {
	window, notebooks, commands, workspace, ExtensionContext,
	CancellationToken, NotebookSerializer, NotebookData, NotebookCellData
} from 'vscode';
import { installKernel, runKernel } from './commands/rustkernel';
import { openMain } from './commands/openMain';

const kernel = new Kernel();

export async function activate(context: ExtensionContext) {
	context.subscriptions.push(registerLanguageProvider());
	const controller = notebooks.createNotebookController('rust-kernel', 'rustnote', 'Rust Kernel');
	controller.supportedLanguages = ['rust'];
	controller.executeHandler = (cells, doc, ctrl) => kernel.executeCells(doc, cells, ctrl);
	context.subscriptions.push(commands.registerCommand('rustnote.kernel.restart', () => {
		window.showInformationMessage('Restarting kernel');
	}));
	context.subscriptions.push(commands.registerCommand('rustnote.search', searchNotes));
	context.subscriptions.push(commands.registerCommand('rustnote.preview', runMdbook));
	context.subscriptions.push(commands.registerCommand('rustnote.openMain', openMain));


	const notebookSettings = {
		transientOutputs: false,
		transientCellMetadata: {
			inputCollapsed: true,
			outputCollapsed: true,
		}
	};

	context.subscriptions.push(workspace.registerNotebookSerializer('rustnote', new MarkdownProvider(), notebookSettings));

	// Skip checking if already installed on first run, to keep kernel updated
	await installKernel(true);
	runKernel();
}

class MarkdownProvider implements NotebookSerializer {
	deserializeNotebook(data: Uint8Array, _token: CancellationToken): NotebookData | Thenable<NotebookData> {
		const content = Buffer.from(data)
			.toString('utf8');

		const cellRawData = parseMarkdown(content);
		const cells = cellRawData.map(rawToNotebookCellData);

		return {
			cells
		};
	}

	serializeNotebook(data: NotebookData, _token: CancellationToken): Uint8Array | Thenable<Uint8Array> {
		const stringOutput = writeCellsToMarkdown(data.cells);
		return Buffer.from(stringOutput);
	}
}

export function rawToNotebookCellData(data: RawNotebookCell): NotebookCellData {
	return <NotebookCellData>{
		kind: data.kind,
		languageId: data.language,
		metadata: { leadingWhitespace: data.leadingWhitespace, trailingWhitespace: data.trailingWhitespace, indentation: data.indentation },
		outputs: data.outputs || [],
		value: data.content,
	};
}