import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../../helpers/fileHelpers";
import { validateComponentName } from "../../helpers/validationHelpers";

export async function createReactComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name (PascalCase)",
      placeHolder: "UserProfile",
      validateInput: validateComponentName,
    });
    if (!componentName) return;

    const hasProps = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Accept props?",
    });
    const hasState = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Need state?",
    });
    const hasEffects = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Need useEffect?",
    });
    const styling = await vscode.window.showQuickPick(
      ["Tailwind CSS", "Styled Components", "CSS Modules", "None"],
      { placeHolder: "Styling?" },
    );

    let componentCode = `"use client";\n\n`;
    const imports = [
      `import React${hasState === "Yes" || hasEffects === "Yes" ? ", { useState, useEffect }" : ""} from 'react';`,
    ];
    if (styling === "Styled Components")
      imports.push("import styled from 'styled-components';");

    const propsInterface =
      hasProps === "Yes"
        ? `\ninterface ${componentName}Props {\n  className?: string;\n  children?: React.ReactNode;\n}\n`
        : "";
    const propsParam =
      hasProps === "Yes"
        ? `({ className, children }: ${componentName}Props)`
        : "()";
    const stateCode =
      hasState === "Yes"
        ? `\n  const [loading, setLoading] = useState(false);\n  const [data, setData] = useState<any>(null);`
        : "";
    const effectCode =
      hasEffects === "Yes"
        ? `\n  useEffect(() => {\n    console.log('${componentName} mounted');\n    return () => console.log('${componentName} unmounted');\n  }, []);`
        : "";

    componentCode += `${imports.join("\n")}${propsInterface}\nconst ${componentName} = ${propsParam} => {${stateCode}${effectCode}\n  return (\n    <div className="${styling === "Tailwind CSS" ? "container mx-auto p-4" : "container"}">\n      <h1>${componentName} Component</h1>\n      ${hasProps === "Yes" ? "{children}" : ""}\n    </div>\n  );\n};\n\nexport default ${componentName};`;

    if (styling === "Styled Components") {
      componentCode = `"use client";\n\n${imports.join("\n")}\nconst Container = styled.div\`\n  padding: 20px;\n  background: #f5f5f5;\n  border-radius: 8px;\n\`;\n${propsInterface}\nconst ${componentName} = ${propsParam} => {${stateCode}${effectCode}\n  return (\n    <Container>\n      <h1>${componentName} Component</h1>\n      {children}\n    </Container>\n  );\n};\n\nexport default ${componentName};`;
    }

    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    const filePath = path.join(componentsDir, `${componentName}.tsx`);
    await fs.writeFile(filePath, componentCode);
    await openFile(filePath);
    vscode.window.showInformationMessage(
      `✅ Component ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
