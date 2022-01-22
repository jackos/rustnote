import { commands, Uri, ViewColumn, window, workspace } from 'vscode';
import { tmpdir } from 'os';
import { sep } from 'path';

export const previewMain = async () => {
	let path = tmpdir() + sep + 'rustnote';
	let main = path + sep + 'src' + sep + 'main.rs';
	workspace.updateWorkspaceFolders(workspace.workspaceFolders ? workspace.workspaceFolders.length : 0, null, { uri: Uri.parse(path) });
	commands.executeCommand("vscode.open", "file:///tmp/rustnote/src/main.rs");
	workspace.openTextDocument(main).then(doc => {
		window.showTextDocument(doc, ViewColumn.Beside);
	});
	commands.executeCommand("rust-analyzer.reload");
};
