import fetch from 'node-fetch'
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

const sendCodeCell = async (exec: NotebookCellExecution, doc: NotebookDocument): Promise<string | void> => {
    const data = {
        index: exec.cell.index,
        filename: doc.uri.fsPath,
        fragment: +exec.cell.document.uri.fragment.substring(3),
        contents: exec.cell.document.getText(),
        executing: true
    }
    return await fetch("http://127.0.0.1:8787", {
        method: 'POST',
        body: JSON.stringify(data),
        timeout: 5000
    })
        .then(res => res.text())
        .catch(_ => {
            window.showWarningMessage(`Please wait for rustkernel to start`)
        })
}

// Installs rustkernel, launches the kernel in a task, sends code to be executed, and retrieves output
export class Kernel {
    output = window.createOutputChannel('Go Notebook Kernel');
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
            let success = false
            let res = await sendCodeCell(exec, doc)
            // window.showInformationMessage(`${res}`)
            if (res || res === "") {
                if (res.substring(0, 12) === "exit status ") {
                    res = res.split("\n").slice(1).join("\n")
                } else {
                    success = true
                }
                this.output.appendLine(res.trim())
                var u8 = new TextEncoder().encode(res.trim())
                const x = new NotebookCellOutputItem(u8, "text/plain")
                await exec.appendOutput([new NotebookCellOutput([x])])
            }
            exec.end(success, (new Date).getTime())
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
