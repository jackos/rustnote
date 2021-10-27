import * as net from "net"
import { TextEncoder } from 'util'
import { execSync } from 'child_process'
import {
    NotebookCellExecution, NotebookDocument, NotebookCell, NotebookController,
    NotebookCellOutput, NotebookCellOutputItem, ShellExecution, Task, window, tasks, TaskScope, TaskPanelKind,
} from 'vscode'
import { existsSync } from 'fs'

const presentationOptions = {
    panel: TaskPanelKind.Shared,
    showReuseMessage: false,
    clear: false,
    close: true,
    focus: true,
}

// Installs rustkernel, launches the kernel in a task, sends code to be executed, and retrieves output
export class Kernel {
    output = window.createOutputChannel('Rustkernel');
    installed = false;
    retries = 10;
    RUSTPATH = "";

    async executeCells(doc: NotebookDocument, cells: NotebookCell[], ctrl: NotebookController): Promise<void> {
        this.launch()
        for (const cell of cells) {
            const exec = ctrl.createNotebookCellExecution(cell)
            // Used for the cell timer counter
            exec.start((new Date).getTime())
            exec.clearOutput()

            const dat = exec.cell.index + "\0"
                + +exec.cell.document.uri.fragment.substring(3) + "\0"
                + doc.uri.fsPath + "\0"
                + exec.cell.document.getText()

            const utf8 = Buffer.from(dat)

            let client = new net.Socket()
            client.connect(8787, "127.0.0.1", () => {
                client.write(utf8)
            })
            client.on('data', async (data) => {
                let sp = data.toString().split("\0")
                let success = sp[0] ? true : false
                let body = sp[1]
                this.output.appendLine(body.trim())
                var u8 = new TextEncoder().encode(body.trim())
                const x = new NotebookCellOutputItem(u8, "text/plain")
                await exec.appendOutput([new NotebookCellOutput([x])])
                exec.end(success, (new Date).getTime())
            })
        }
    }

    async install() {
        try {
            this.RUSTPATH = execSync("which rustkernel").toString().trim()

            window.showInformationMessage("Checking latest version of rustkernel")
            const installRustkernel = new Task(
                { type: 'shell' },
                TaskScope.Workspace,
                "rustkernel-get",
                "rustkernel-get",
                new ShellExecution("cargo install rustkernel"),
            )
            installRustkernel.presentationOptions = presentationOptions

            tasks.executeTask(installRustkernel)
            this.launch()
        } catch (err) {
            window.showErrorMessage(`Rust not installed correctly [Follow instructions here](https://www.rust-lang.org/tools/install)\n${err}`)
        }
    }

    async launch() {
        const rustkernelPath = this.RUSTPATH
        const fileExists = existsSync(rustkernelPath)
        const fileExistsWindows = existsSync(rustkernelPath + ".exe")
        if (!fileExists && !fileExistsWindows) {
            window.showWarningMessage(`Please wait for rustkernel to finish installing`)
        } else {
            const rustkernelTask = new Task(
                { type: 'shell' },
                TaskScope.Workspace,
                'rustkernel',
                'rustkernel',
                new ShellExecution(rustkernelPath)
            )
            rustkernelTask.presentationOptions = presentationOptions

            // Check if task already running
            let launchTask = true
            const runningTasks = tasks.taskExecutions
            if (tasks) {
                for (const task of runningTasks) {
                    if (task.task.name === "rustkernel") {
                        launchTask = false
                    }
                }
            }
            if (launchTask) {
                tasks.executeTask(rustkernelTask)
            }
        }
    }
}
