import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

async function getFilesRecursively(directory: string): Promise<string[]> {
  let files: string[] = [];
  for (const item of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(await getFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function copyFilesContent(allUris: vscode.Uri[], includeStructure: boolean) {
  let fileContents: string[] = [];
  let projectStructure: string[] = includeStructure ? ["### PROJECT STRUCTURE START ###"] : [];
  
  for (const fileUri of allUris) {
    const relativePath = vscode.workspace.asRelativePath(fileUri.fsPath);
    
    if (fs.statSync(fileUri.fsPath).isDirectory()) {
      const folderFiles = await getFilesRecursively(fileUri.fsPath);
      for (const file of folderFiles) {
        const relativeFilePath = vscode.workspace.asRelativePath(file);
        if (includeStructure) {
          projectStructure.push(`- [FILE] ${relativeFilePath}`);
        }
        try {
          const content = fs.readFileSync(file, 'utf8');
          fileContents.push(
            includeStructure ? `### FILE START: ${relativeFilePath} ###\n${content}\n### FILE END: ${relativeFilePath} ###` : `\n${content}\n`
          );
        } catch (error) {
          vscode.window.showErrorMessage(`Error reading file: ${relativeFilePath}`);
        }
      }
      continue;
    }

    if (includeStructure) {
      projectStructure.push(`- [FILE] ${relativePath}`);
    }
    try {
      const content = fs.readFileSync(fileUri.fsPath, 'utf8');
      fileContents.push(
        `### FILE START: ${relativePath} ###\n${content}\n### FILE END: ${relativePath} ###`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Error reading file: ${relativePath}`);
    }
  }

  if (includeStructure) {
    projectStructure.push("### PROJECT STRUCTURE END ###");
  }
  const finalContent = `${projectStructure.join('\n')}\n\n${fileContents.join('\n\n')}`;

  vscode.env.clipboard.writeText(finalContent);
  vscode.window.showInformationMessage("Files content copied to clipboard!");
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.copyFilesContentWithStructure', async (uri, allUris) => {
      if (!allUris) {
        vscode.window.showErrorMessage("No files selected.");
        return;
      }
      await copyFilesContent(allUris, true);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.copyFilesContentRaw', async (uri, allUris) => {
      if (!allUris) {
        vscode.window.showErrorMessage("No files selected.");
        return;
      }
      await copyFilesContent(allUris, false);
    })
  );
}

export function deactivate() {}