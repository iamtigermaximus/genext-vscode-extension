import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../../helpers/fileHelpers";
import { validateUtilityName } from "../../helpers/validationHelpers";

export async function createUtilityFunction(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const utilName = await vscode.window.showInputBox({
      prompt: "Utility name (camelCase)",
      placeHolder: "formatDate",
      validateInput: validateUtilityName,
    });
    if (!utilName) return;
    const isAsync = await vscode.window.showQuickPick(["No", "Yes"], {
      placeHolder: "Async function?",
    });
    const code = `export const ${utilName} = ${isAsync === "Yes" ? "async (input: any): Promise<any> =>" : "(input: any): any =>"} {\n  ${isAsync === "Yes" ? "try {\n    const result = await Promise.resolve(input);\n    return result;\n  } catch (error) {\n    console.error(error);\n    throw error;\n  }" : "return input;"}\n};`;
    const utilsDir = path.join(targetDir, "src", "utils");
    await fs.ensureDir(utilsDir);
    const filePath = path.join(utilsDir, `${utilName}.ts`);
    await fs.writeFile(filePath, code);
    await openFile(filePath);
    vscode.window.showInformationMessage(`✅ Utility ${utilName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
