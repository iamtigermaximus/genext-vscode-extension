import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory } from "../../helpers/fileHelpers";

export async function createFormComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const formName = await vscode.window.showInputBox({
      prompt: "Form name",
      placeHolder: "LoginForm",
    });
    if (!formName) return;
    const code = `"use client";\n\nimport React, { useState } from 'react';\n\ninterface ${formName}Data { email: string; password: string; }\n\nconst ${formName}: React.FC = () => {\n  const [formData, setFormData] = useState<${formName}Data>({ email: '', password: '' });\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({ ...prev, [name]: value }));\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError(null);\n    try { console.log(formData); } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred'); } finally { setLoading(false); }\n  };\n\n  return (\n    <form onSubmit={handleSubmit} className="space-y-4">\n      <div><label className="block text-sm font-medium">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required /></div>\n      <div><label className="block text-sm font-medium">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required /></div>\n      {error && <div className="text-red-600 text-sm">{error}</div>}\n      <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50">\n        {loading ? 'Submitting...' : 'Submit'}\n      </button>\n    </form>\n  );\n};\n\nexport default ${formName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    const filePath = path.join(componentsDir, `${formName}.tsx`);
    await fs.writeFile(filePath, code);
    vscode.window.showInformationMessage(`✅ Form component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
