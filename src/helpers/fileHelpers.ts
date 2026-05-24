import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";

export async function getTargetDirectory(uri?: vscode.Uri): Promise<string> {
  if (uri) return uri.fsPath;
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) throw new Error("No folder open");
  return folders[0].uri.fsPath;
}

export async function detectRouterType(
  projectPath: string,
): Promise<"app" | "pages"> {
  const appDir = path.join(projectPath, "src", "app");
  const pagesDir = path.join(projectPath, "src", "pages");
  if (await fs.pathExists(appDir)) return "app";
  if (await fs.pathExists(pagesDir)) return "pages";
  return "app";
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function ensureDirectory(dir: string): Promise<void> {
  await fs.ensureDir(dir);
}

export async function writeFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

export async function openFile(filePath: string): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(doc);
}
