import { Socket } from "net";
import { TextEncoder } from 'util';
import { tmpdir } from 'os';
import { getBasePath } from './config';
import { NotebookDocument, NotebookCell, NotebookController, NotebookCellOutput, NotebookCellOutputItem, window } from 'vscode';
import { installKernel, runKernel } from "./commands/rustkernel";

// Installs rustkernel, launches the kernel in a task, sends code to be executed, and retrieves output
export class Kernel {
    async executeCells(doc: NotebookDocument, cells: NotebookCell[], ctrl: NotebookController): Promise<void> {
        for (const cell of cells) {

            const exec = ctrl.createNotebookCellExecution(cell);
            // Used for the cell timer counter
            exec.start((new Date).getTime());
            exec.clearOutput();

            let x = exec.token;

            x.onCancellationRequested(() => exec.end(false, (new Date).getTime()));
            // filePath = workspace.workspaceFolders[0].uri.path + '/.rustnote';
            let filePath = getBasePath();

            const dat = exec.cell.index + "\0"
                + +exec.cell.document.uri.fragment.substring(3) + "\0"
                + doc.uri.fsPath + "\0"
                + tmpdir + "/rustnote\0"
                + exec.cell.document.getText();

            const utf8 = Buffer.from(dat);

            let client = new Socket();
            client.connect(8787, "127.0.0.1", () => {
                client.write(utf8);
            });
            client.on('error', async (data) => {
                const connRefused = "connect ECONNREFUSED";
                // If it fails to connect, start task and try again
                if (data.message.substring(0, connRefused.length - 1)) {
                    window.showInformationMessage(`Relaunching Rustkernel, try again when running`);
                    await installKernel();
                    await runKernel();
                    client.connect(8787, "127.0.0.1", () => {
                        client.write(utf8);
                    });
                } else {
                    window.showErrorMessage(`Unhandled error: ${data.message}`);
                    exec.end(false, (new Date).getTime());
                }
            });
            client.on('data', async (data) => {
                let sp = data.toString().split("\0");
                let success = +sp[0] ? false : true;
                let body = sp[1];
                var u8 = new TextEncoder().encode(body.trim());
                const x = new NotebookCellOutputItem(u8, "text/plain");
                await exec.appendOutput([new NotebookCellOutput([x])]);
                exec.end(success, (new Date).getTime());
            });
        }
    }
}

