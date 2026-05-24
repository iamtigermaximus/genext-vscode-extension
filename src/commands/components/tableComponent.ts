import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory } from "../../helpers/fileHelpers";

export async function createTableComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const tableName = await vscode.window.showInputBox({
      prompt: "Table name",
      placeHolder: "DataTable",
    });
    if (!tableName) return;
    const code = `"use client";\n\nimport React, { useState } from 'react';\n\ninterface Column<T = any> { key: keyof T; header: string; }\n\ninterface ${tableName}Props<T = any> { data: T[]; columns: Column<T>[]; onRowClick?: (row: T) => void; }\n\nconst ${tableName} = <T extends any>({ data, columns, onRowClick }: ${tableName}Props<T>) => {\n  const [sortField, setSortField] = useState<keyof T | null>(null);\n  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');\n\n  const sortedData = [...data];\n  if (sortField) {\n    sortedData.sort((a, b) => {\n      const aVal = a[sortField];\n      const bVal = b[sortField];\n      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;\n      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;\n      return 0;\n    });\n  }\n\n  const handleSort = (field: keyof T) => {\n    if (sortField === field) { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }\n    else { setSortField(field); setSortOrder('asc'); }\n  };\n\n  return (\n    <div className="overflow-x-auto">\n      <table className="min-w-full border-collapse border">\n        <thead><tr className="bg-gray-100">{columns.map(col => (<th key={String(col.key)} onClick={() => handleSort(col.key)} className="border p-2 text-left cursor-pointer hover:bg-gray-200">{col.header} {sortField === col.key && (sortOrder === 'asc' ? '↑' : '↓')}</th>))}</tr></thead>\n        <tbody>{sortedData.map((row, idx) => (<tr key={idx} onClick={() => onRowClick?.(row)} className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}>{columns.map(col => (<td key={String(col.key)} className="border p-2">{String(row[col.key])}</td>))}</tr>))}</tbody>\n      </table>\n    </div>\n  );\n};\n\nexport default ${tableName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    const filePath = path.join(componentsDir, `${tableName}.tsx`);
    await fs.writeFile(filePath, code);
    vscode.window.showInformationMessage(`✅ Table component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
