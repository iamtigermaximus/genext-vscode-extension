import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory } from "../helpers/fileHelpers";

export async function createTestFile(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name to test",
      placeHolder: "UserProfile",
    });
    if (!componentName) return;

    const code = `// 🔴 TEST FILE - Replace with your actual test data\n\nimport { render, screen } from '@testing-library/react';\nimport ${componentName} from './${componentName}';\n\ndescribe('${componentName}', () => {\n  it('renders correctly', () => {\n    render(<${componentName} />);\n    expect(screen.getByText(/${componentName}/i)).toBeInTheDocument();\n  });\n});`;

    const componentsDir = path.join(targetDir, "__tests__");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(
      path.join(componentsDir, `${componentName}.test.tsx`),
      code,
    );
    vscode.window.showInformationMessage(
      `✅ Test file created! Replace 🔴 placeholder with actual test data.`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

export async function createStorybookFile(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name for story",
      placeHolder: "Button",
    });
    if (!componentName) return;

    const code = `import type { Meta, StoryObj } from '@storybook/react';\nimport ${componentName} from './${componentName}';\n\nconst meta: Meta<typeof ${componentName}> = {\n  title: '${componentName}',\n  component: ${componentName},\n  tags: ['autodocs'],\n};\n\nexport default meta;\ntype Story = StoryObj<typeof ${componentName}>;\n\nexport const Default: Story = {};`;

    const componentsDir = path.join(targetDir, "src", "components");
    await fs.writeFile(
      path.join(componentsDir, `${componentName}.stories.tsx`),
      code,
    );
    vscode.window.showInformationMessage(`✅ Storybook file created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
