import { lookpath } from "lookpath";
import { ShellExecution, Task, TaskPanelKind, tasks, TaskScope, window } from "vscode";

// Starts up the kernel in a task if not already running
export let runKernel = async () => {
	const runTask = new Task(
		{ type: 'shell' },
		TaskScope.Workspace,
		'rustkernel',
		'rustkernel',
		new ShellExecution("rustkernel")
	);
	runTask.presentationOptions = {
		panel: TaskPanelKind.Shared,
		showReuseMessage: false,
		clear: false,
		close: true,
		focus: false,
	};

	return new Promise<void>(async resolve => {
		// Check if task already running, and don't run if it is
		const runningTasks = tasks.taskExecutions;
		for (const task of runningTasks) {
			if (task.task.name === "rustkernel") {
				resolve();
				return;
			}
		}
		await tasks.executeTask(runTask);
		resolve();
	});
};


// Checks if the kernel is installed, if not it starts a new task and installs
// via `cargo install`
export let installKernel = async (skipCheck = false) => {
	const installTask = new Task(
		{ type: 'shell' },
		TaskScope.Workspace,
		'rustkernel',
		'rustkernel',
		new ShellExecution("cargo install rustkernel")
	);
	installTask.presentationOptions = {
		panel: TaskPanelKind.Shared,
		showReuseMessage: false,
		clear: false,
		close: true,
		focus: false,
	};
	let rustKernalPath = await lookpath("rustkernel");
	return new Promise<void>(async resolve => {
		if (rustKernalPath === undefined || skipCheck) {
			window.showInformationMessage(`Installing rustkernel...`);
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