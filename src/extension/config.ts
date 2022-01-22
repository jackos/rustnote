import { workspace } from 'vscode';
import { homedir } from 'os';
import { join } from 'path';

const configuration = () => workspace.getConfiguration('rustnote');

export const indexFile = () => configuration().get<string>('baseRootFile') || 'index.md';

export const getBasePath = () => configuration().get<string>('basePath')
  || join(homedir(), 'rustnote');

export const getOpenBasePathAsWorkspace = () => configuration().get<boolean>('openBasePathAsWorkspace', false);

export const getRootFile = () => join(getBasePath(), indexFile());

export const getTargetRootFile = () => configuration().get<string>('targetRootFile');

export const getTargetPath = () => configuration().get<string>('targetPath');
