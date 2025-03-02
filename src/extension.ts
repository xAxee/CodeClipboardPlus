import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as minimatch from "minimatch";

let debugChannel: vscode.OutputChannel;

function isExcluded(
  filePath: string,
  excludePatterns: string[],
  gitignorePatterns: string[],
  workspaceRoot: string
): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return true;
    }

    let relativePath = path
      .relative(workspaceRoot, filePath)
      .replace(/\\/g, "/");
    const isDirectory = fs.statSync(filePath).isDirectory();
    const relativePathForMatching = isDirectory
      ? relativePath.endsWith("/")
        ? relativePath
        : `${relativePath}/`
      : relativePath;

    const parts = relativePath.split("/");
    if (isDirectory) {
      parts.pop();
    }
    let currentPath = "";
    for (const part of parts) {
      currentPath += (currentPath ? "/" : "") + part;
      const currentPathForMatching = currentPath + "/";
      for (const pattern of excludePatterns) {
        const normalizedPattern = pattern.trim();
        if (
          minimatch.default(currentPathForMatching, normalizedPattern, {
            dot: true,
            matchBase: !normalizedPattern.includes("/"),
            nocase: process.platform === "win32",
          })
        ) {
          debugChannel.appendLine(
            `Excluded by excludePatterns (${normalizedPattern}): ${currentPathForMatching}`
          );
          return true;
        }
      }
    }
    if (!isDirectory) {
      for (const pattern of excludePatterns) {
        const normalizedPattern = pattern.trim();
        if (
          minimatch.default(relativePath, normalizedPattern, {
            dot: true,
            matchBase: !normalizedPattern.includes("/"),
            nocase: process.platform === "win32",
          })
        ) {
          debugChannel.appendLine(
            `Excluded by excludePatterns (${normalizedPattern}): ${relativePath}`
          );
          return true;
        }
      }
    }
    if (gitignorePatterns.length > 0) {
      for (const pattern of gitignorePatterns) {
        if (!pattern || pattern.trim() === "") continue;
        let normalizedPattern = pattern.trim();
        const isNegated = normalizedPattern.startsWith("!");
        if (isNegated) {
          normalizedPattern = normalizedPattern.substring(1);
        }
        if (normalizedPattern.startsWith("/")) {
          normalizedPattern = normalizedPattern.substring(1);
        }
        const isMatch = minimatch.default(
          relativePathForMatching,
          normalizedPattern,
          {
            dot: true,
            matchBase: !normalizedPattern.includes("/"),
            nocase: process.platform === "win32",
          }
        );
        if (isMatch) {
          debugChannel.appendLine(
            `Matched gitignore pattern (${pattern}): ${relativePathForMatching}`
          );
          return !isNegated;
        }
      }
    }

    return false;
  } catch (error) {
    debugChannel.appendLine(
      `Error checking exclusion for path ${filePath}:` + error
    );
    return true;
  }
}
async function getFilesRecursively(
  directory: string,
  workspaceRoot: string,
  excludePatterns: string[],
  gitignorePatterns: string[]
): Promise<string[]> {
  let files: string[] = [];
  if (
    isExcluded(directory, excludePatterns, gitignorePatterns, workspaceRoot)
  ) {
    debugChannel.appendLine(`Skipping excluded directory: ${directory}`);
    return files;
  }
  const items = await fs.promises.readdir(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    if (
      isExcluded(fullPath, excludePatterns, gitignorePatterns, workspaceRoot)
    ) {
      debugChannel.appendLine(`Skipping excluded item: ${fullPath}`);
      continue;
    }
    const stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(
        await getFilesRecursively(
          fullPath,
          workspaceRoot,
          excludePatterns,
          gitignorePatterns
        )
      );
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function copyFilesContent(
  allUris: vscode.Uri[],
  includeStructure: boolean
) {
  const config = vscode.workspace.getConfiguration("codeclipboardplus");
  const filesLimit = config.get<number>("Limit.filesLimit", 100);
  const excludePatterns = config.get<string[]>("Exclude.Paths", []);
  const respectGitIgnore = config.get<boolean>(
    "Exclude.respectGitIgnore",
    true
  );
  let gitignorePatterns: string[] = [];
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
  debugChannel.appendLine("Exclusion patterns: " + excludePatterns);
  debugChannel.appendLine("Respecting .gitignore: " + respectGitIgnore);

  if (respectGitIgnore && workspaceRoot) {
    const gitignorePath = path.join(workspaceRoot, ".gitignore");
    try {
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
        gitignorePatterns = gitignoreContent
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#"));

        debugChannel.appendLine(
          "Patterns from .gitignore: " + gitignorePatterns
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage("Error reading .gitignore");
      debugChannel.appendLine("Error reading .gitignore: " + error);
    }
  }

  let processedFiles = 0;
  let fileContents: string[] = [];
  let projectStructure: string[] = includeStructure
    ? ["### PROJECT STRUCTURE START ###"]
    : [];
  const fileStructureEntries: string[] = [];

  try {
    for (const fileUri of allUris) {
      if (processedFiles >= filesLimit) break;
      try {
        if (!fs.existsSync(fileUri.fsPath)) {
          debugChannel.appendLine(`File not found: ${fileUri.fsPath}`);
          continue;
        }

        if (
          isExcluded(
            fileUri.fsPath,
            excludePatterns,
            gitignorePatterns,
            workspaceRoot
          )
        ) {
          debugChannel.appendLine(`Skipping excluded item: ${fileUri.fsPath}`);
          continue;
        }

        const stat = fs.statSync(fileUri.fsPath);
        if (stat.isDirectory()) {
          const folderFiles = await getFilesRecursively(
            fileUri.fsPath,
            workspaceRoot,
            excludePatterns,
            gitignorePatterns
          );
          for (const file of folderFiles) {
            if (processedFiles >= filesLimit) {
              vscode.window.showWarningMessage(
                `Limit of ${filesLimit} files reached. Not all files were copied.`
              );
              break;
            }
            const relativePath = vscode.workspace.asRelativePath(file);

            if (includeStructure) {
              fileStructureEntries.push(`- [FILE] ${relativePath}`);
            }

            try {
              const content = fs.readFileSync(file, "utf8");
              fileContents.push(
                `### FILE START: ${relativePath} ###\n${content}\n### FILE END: ${relativePath} ###`
              );
              processedFiles++;
            } catch (error) {
              debugChannel.appendLine(
                `Error reading: ${relativePath} ${error}`
              );
              vscode.window.showErrorMessage(`Error reading: ${relativePath}`);
            }
          }
          continue;
        }

        const relativePath = vscode.workspace.asRelativePath(fileUri);
        if (includeStructure) {
          fileStructureEntries.push(`- [FILE] ${relativePath}`);
        }

        try {
          const content = fs.readFileSync(fileUri.fsPath, "utf8");
          fileContents.push(
            `### FILE START: ${relativePath} ###\n${content}\n### FILE END: ${relativePath} ###`
          );
          processedFiles++;
        } catch (error) {
          debugChannel.appendLine(`Error reading: ${relativePath} ${error}`);
          vscode.window.showErrorMessage(`Error reading: ${relativePath}`);
        }
      } catch (fileError) {
        debugChannel.appendLine(
          `Error processing file ${fileUri.fsPath}: ${fileError}`
        );
      }
    }

    if (includeStructure) {
      projectStructure = projectStructure.concat(fileStructureEntries);
      projectStructure.push("### PROJECT STRUCTURE END ###");
    }

    const finalContent = [
      ...(includeStructure ? projectStructure : []),
      ...fileContents,
    ].join("\n\n");

    vscode.env.clipboard.writeText(finalContent);
    vscode.window.showInformationMessage(`Copied ${processedFiles} files!`);
  } catch (error) {
    debugChannel.appendLine("Error copying file contents:" + error);
    vscode.window.showErrorMessage("Failed to copy file contents");
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Output channel subscription
  debugChannel = vscode.window.createOutputChannel("CodeClipboardPlus");
  debugChannel.appendLine("Starting CodeClipboardPlus");
  // Command 'copyFilesContentWithStructure' subscription
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codeclipboardplus.copyFilesContentWithStructure",
      async (_, allUris) => {
        if (!allUris?.length) {
          return vscode.window.showErrorMessage("No files selected");
        }
        await copyFilesContent(allUris, true);
      }
    )
  );
  // Command 'copyFilesContentRaw' subscription
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codeclipboardplus.copyFilesContentRaw",
      async (_, allUris) => {
        if (!allUris?.length) {
          return vscode.window.showErrorMessage("No files selected");
        }
        await copyFilesContent(allUris, false);
      }
    )
  );
}

export function deactivate() {}
