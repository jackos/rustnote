import { commands, Uri } from 'vscode';
import { workspace } from 'vscode';
import { getBasePath } from '../config';

export const searchNotes = async () => {
  const basePath = getBasePath();
  workspace.updateWorkspaceFolders(workspace.workspaceFolders ? workspace.workspaceFolders.length : 0, null, { uri: Uri.parse(basePath) });
  commands.executeCommand("workbench.action.findInFiles");
};
