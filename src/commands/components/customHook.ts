import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../../helpers/fileHelpers";
import { validateHookName } from "../../helpers/validationHelpers";

export async function createCustomHook(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const hookName = await vscode.window.showInputBox({
      prompt: "Hook name (useXxx)",
      placeHolder: "useAuth",
      validateInput: validateHookName,
    });
    if (!hookName) return;
    const hasState = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Need state?",
    });
    const code = `import { ${hasState === "Yes" ? "useState, useCallback" : "useCallback"} } from 'react';\n\nconst ${hookName} = () => {\n${hasState === "Yes" ? `  const [data, setData] = useState<any>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<Error | null>(null);\n` : ""}\n  const doSomething = useCallback(() => {\n    console.log('${hookName} called');\n  }, []);\n\n  return { ${hasState === "Yes" ? "data, loading, error," : ""} doSomething };\n};\n\nexport default ${hookName};`;
    const hooksDir = path.join(targetDir, "src", "hooks");
    await fs.ensureDir(hooksDir);
    const filePath = path.join(hooksDir, `${hookName}.ts`);
    await fs.writeFile(filePath, code);
    await openFile(filePath);
    vscode.window.showInformationMessage(`✅ Hook ${hookName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
