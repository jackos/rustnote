import { lookpath } from "lookpath";
import { ShellExecution, Task, TaskPanelKind, tasks, TaskScope, window } from "vscode";
import { getBasePath } from '../config';
import { exec } from 'child_process';


export let runMdbook = async () => {
	await installMdbook();
	previewMdbook();
};

let path = getBasePath();
// Starts up the kernel in a task if not already running
let previewMdbook = async () => {
	const previewMdbook = new Task(
		{ type: 'shell' },
		TaskScope.Workspace,
		'Preview mdBook',
		'Preview mdBook',
		new ShellExecution(`mdbook serve ${path} -p 8789 -o`)
	);
	previewMdbook.presentationOptions = {
		panel: TaskPanelKind.Shared,
		showReuseMessage: false,
		clear: false,
		close: true,
		focus: false,
	};
	let launchTask = true;
	const runningTasks = tasks.taskExecutions;
	for (const task of runningTasks) {
		// window.showWarningMessage(`${task.task.name}`);
		if (task.task.name === "Preview Mdbook") {
			launchTask = false;
		}
	}
	if (launchTask) {
		tasks.executeTask(previewMdbook);
		var url = 'http://localhost';
		var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
		exec(start + ' ' + url);
	}
};

// Checks if the kernel is installed, if not it starts a new task and installs
// via `cargo install`
let installMdbook = async () => {
	const installTask = new Task(
		{ type: 'shell' },
		TaskScope.Workspace,
		'Install mdBook',
		'Install mdBook',
		new ShellExecution("cargo install mdbook")
	);
	installTask.presentationOptions = {
		panel: TaskPanelKind.Shared,
		showReuseMessage: false,
		clear: false,
		close: true,
		focus: false,
	};
	let rustKernelPath = await lookpath("mdbook");
	return new Promise<void>(async resolve => {
		if (rustKernelPath === undefined) {
			window.showInformationMessage(`Installing mdbook...`);
			let e = await tasks.executeTask(installTask);
			tasks.onDidEndTask(ended => {
				if (ended.execution === e.task.execution) {
					resolve();
				}
			});
		} else {
			resolve();
		}
	});
};