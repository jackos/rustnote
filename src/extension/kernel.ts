import { Socket } from "net"
import { TextEncoder } from 'util'
import {
    NotebookDocument, NotebookCell, NotebookController, tasks,
    NotebookCellOutput, NotebookCellOutputItem, ShellExecution, Task, window, TaskScope, TaskPanelKind,
} from 'vscode'


// Installs rustkernel, launches the kernel in a task, sends code to be executed, and retrieves output
export class Kernel {
    output = window.createOutputChannel('Rustkernel');
    async executeCells(doc: NotebookDocument, cells: NotebookCell[], ctrl: NotebookController): Promise<void> {
        // this.launch()
        for (const cell of cells) {
            const exec = ctrl.createNotebookCellExecution(cell)
            // Used for the cell timer counter
            exec.start((new Date).getTime())
            exec.clearOutput()

            let x = exec.token

            x.onCancellationRequested(() => exec.end(false, (new Date).getTime()))
            const dat = exec.cell.index + "\0"
                + +exec.cell.document.uri.fragment.substring(3) + "\0"
                + doc.uri.fsPath + "\0"
                + exec.cell.document.getText()

            const utf8 = Buffer.from(dat)

            let client = new Socket()
            client.connect(8787, "127.0.0.1", () => {
                client.write(utf8)
            })
            client.on('error', async (data) => {
                const connRefused = "connect ECONNREFUSED"
                if (data.message.substring(0, connRefused.length - 1)) {
                    window.showInformationMessage(`Relaunching Rustkernel, try again when running`)
                    this.launch()
                    exec.end(false, (new Date).getTime())
                } else {
                    window.showErrorMessage(`Unhandled error: ${data.message}`)
                    exec.end(false, (new Date).getTime())
                }
            })
            client.on('data', async (data) => {
                let sp = data.toString().split("\0")
                let success = +sp[0] ? false : true
                let body = sp[1]
                this.output.appendLine(body.trim())
                var u8 = new TextEncoder().encode(body.trim())
                const x = new NotebookCellOutputItem(u8, "text/plain")
                await exec.appendOutput([new NotebookCellOutput([x])])
                exec.end(success, (new Date).getTime())
            })
        }
    }

    async launch() {
        const rustkernelTask = new Task(
            { type: 'shell' },
            TaskScope.Workspace,
            'rustkernel',
            'rustkernel',
            new ShellExecution("cargo install rustkernel && rustkernel")
        )
        rustkernelTask.presentationOptions = {
            panel: TaskPanelKind.Shared,
            showReuseMessage: false,
            clear: false,
            close: true,
            focus: true,
        }
        // Check if task already running, don't run it if not
        let launchTask = true
        const runningTasks = tasks.taskExecutions
        for (const task of runningTasks) {
            if (task.task.name === "rustkernel") {
                launchTask = false
            }
        }
        if (launchTask) {
            tasks.executeTask(rustkernelTask)
        }
    }
}