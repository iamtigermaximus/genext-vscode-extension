import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../../helpers/fileHelpers";

export async function createDataFetcherComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name",
      placeHolder: "UserData",
    });
    if (!componentName) return;
    const code = `"use client";\n\nimport React, { useState, useEffect } from 'react';\n\ninterface ${componentName}Props { id?: string | number; }\n\nconst ${componentName}: React.FC<${componentName}Props> = ({ id }) => {\n  const [data, setData] = useState<any>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<Error | null>(null);\n\n  useEffect(() => {\n    const fetchData = async () => {\n      setLoading(true);\n      try {\n        const url = id ? \`/api/data/\${id}\` : '/api/data';\n        const response = await fetch(url);\n        const result = await response.json();\n        setData(result);\n      } catch (err) { setError(err as Error); } finally { setLoading(false); }\n    };\n    fetchData();\n  }, [id]);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error.message}</div>;\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n};\n\nexport default ${componentName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    const filePath = path.join(componentsDir, `${componentName}.tsx`);
    await fs.writeFile(filePath, code);
    await openFile(filePath);
    vscode.window.showInformationMessage(
      `✅ Data fetcher ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
