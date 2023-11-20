// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import fs from 'fs';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = 'No Version';
  statusBarItem.show();

  // statusBarItem.tooltip
  context.subscriptions.push(statusBarItem);

  const packageJsonPath = getPackageUri();

  if (!packageJsonPath) {
    return;
  }

  const version = await getPackageVersion(packageJsonPath);

  displayPackageVersion(statusBarItem, version);

  fs.watch(packageJsonPath.fsPath, { encoding: 'utf-8' }, async (evenType, fileName) => {
    const version = await getPackageVersion(packageJsonPath);

    displayPackageVersion(statusBarItem, version);
  });
}

async function displayPackageVersion(statusBarItem: vscode.StatusBarItem, version: string) {
  if (!version) {
    return;
  }

  let displayVersion = version.trim();

  if (!displayVersion.startsWith('v')) {
    displayVersion = `v${version}`;
  }

  statusBarItem.text = displayVersion;
}

async function getPackageVersion(packageJsonPath: vscode.Uri) {
  try {
    const byteArray = await vscode.workspace.fs.readFile(packageJsonPath);
    const content = new TextDecoder().decode(byteArray);

    const packageJson = JSON.parse(content);

    return packageJson?.version;
  } catch (error) {
    return '';
  }
}

function getPackageUri() {
  const workspace = vscode.workspace.workspaceFolders?.[0].uri;
  if (!workspace) {
    return '';
  }

  const packageJsonPath = vscode.Uri.joinPath(workspace, 'package.json');

  return packageJsonPath;
}

// This method is called when your extension is deactivated
export function deactivate() {}

