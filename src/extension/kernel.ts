import { Socket } from "net"
import { tmpdir } from "os"
import { TextEncoder } from 'util'
import { existsSync, mkdirSync, writeFile, writeFileSync } from "fs"
import { execFileSync, spawn, spawnSync, SpawnSyncReturns } from "child_process"
import { executeGo } from "./languages/go"
import { executeRust } from "./languages/rust"
import {
    NotebookDocument, NotebookCell, NotebookController, tasks,
    NotebookCellOutput, NotebookCellOutputItem, ShellExecution, Task, window, TaskScope, TaskPanelKind, workspace,
} from 'vscode'
import { sep } from "path"


// Installs rustkernel, launches the kernel in a task, sends code to be executed, and retrieves output
export class Kernel {
    output = window.createOutputChannel('Hackdown');
    async executeCells(doc: NotebookDocument, cells: NotebookCell[], ctrl: NotebookController): Promise<void> {
        // this.launch()
        for (const cell of cells) {
            const exec = ctrl.createNotebookCellExecution(cell)
            // Used for the cell timer counter
            exec.start((new Date).getTime())
            exec.clearOutput()

            let x = exec.token
            x.onCancellationRequested(() => exec.end(false, (new Date).getTime()))

            let dest = ""
            if (workspace.workspaceFolders) {
                dest = workspace.workspaceFolders[0].uri.path + sep + '.hackdown'
            } else {
                dest = tmpdir()
                window.showWarningMessage(`Temporary files will be saved to: ${dest}`)
            }
            const source = doc.uri.fsPath

            const language = cell.document.languageId
            const index = exec.cell.index
            const fragment = +exec.cell.document.uri.fragment.substring(3)
            const program = exec.cell.document.getText()

            // Output
            this.output.appendLine(`index: ${index}\nfragment: ${fragment}\nsource: ${source}\ndest: ${dest}\nlanguage: ${language}`)
            this.output.appendLine(program)
            let cmd: SpawnSyncReturns<Buffer>
            if (language === "go") {
                cmd = executeGo(dest, program)
            } else if (language === "rust") {
                cmd = executeRust(dest, program)
            } else {
                exec.end(false, (new Date).getTime())
                throw "Language not recognized"
            }
            if (cmd.stdout.length > 0) {
                const output = new NotebookCellOutputItem(cmd.stdout, "text/plain")
                exec.appendOutput([new NotebookCellOutput([output])])
                exec.end(true, (new Date).getTime())
            } else {
                const output = new NotebookCellOutputItem(cmd.stderr, "text/plain")
                exec.appendOutput([new NotebookCellOutput([output])])
                exec.end(false, (new Date).getTime())
            }
        }
    }
}