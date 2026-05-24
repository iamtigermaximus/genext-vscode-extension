import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory } from "../../helpers/fileHelpers";

export async function createModalComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const modalName = await vscode.window.showInputBox({
      prompt: "Modal name",
      placeHolder: "ConfirmModal",
    });
    if (!modalName) return;
    const code = `"use client";\n\nimport React, { useEffect } from 'react';\n\ninterface ${modalName}Props { isOpen: boolean; onClose: () => void; title?: string; children?: React.ReactNode; }\n\nconst ${modalName}: React.FC<${modalName}Props> = ({ isOpen, onClose, title, children }) => {\n  useEffect(() => {\n    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };\n    if (isOpen) document.addEventListener('keydown', handleEscape);\n    return () => document.removeEventListener('keydown', handleEscape);\n  }, [isOpen, onClose]);\n  if (!isOpen) return null;\n  return (\n    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">\n      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">\n        <div className="flex justify-between items-center p-4 border-b">\n          <h2 className="text-xl font-semibold">{title}</h2>\n          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>\n        </div>\n        <div className="p-4">{children}</div>\n        <div className="flex justify-end gap-2 p-4 border-t">\n          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>\n          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Confirm</button>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default ${modalName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    const filePath = path.join(componentsDir, `${modalName}.tsx`);
    await fs.writeFile(filePath, code);
    vscode.window.showInformationMessage(`✅ Modal component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
