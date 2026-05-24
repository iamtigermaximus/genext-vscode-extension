import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../../helpers/fileHelpers";

export async function createContextProvider(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const contextName = await vscode.window.showInputBox({
      prompt: "Context name",
      placeHolder: "User",
      value: "User",
    });
    if (!contextName) return;
    const code = `"use client";\n\nimport React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${contextName}ContextType { data: any; setData: (data: any) => void; }\n\nconst ${contextName}Context = createContext<${contextName}ContextType | undefined>(undefined);\n\nexport const ${contextName}Provider = ({ children }: { children: ReactNode }) => {\n  const [data, setData] = useState<any>(null);\n  return <${contextName}Context.Provider value={{ data, setData }}>{children}</${contextName}Context.Provider>;\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within ${contextName}Provider');\n  return context;\n};`;
    const contextDir = path.join(targetDir, "src", "context");
    await fs.ensureDir(contextDir);
    const filePath = path.join(contextDir, `${contextName}Context.tsx`);
    await fs.writeFile(filePath, code);
    await openFile(filePath);
    vscode.window.showInformationMessage(`✅ Context provider created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
