import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../../helpers/fileHelpers";
import { validateComponentName } from "../../helpers/validationHelpers";

export async function createFilterComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Filter component name (PascalCase)",
      placeHolder: "ProductFilter",
      validateInput: validateComponentName,
    });
    if (!componentName) return;
    const code = `"use client";\n\nimport React, { useState, useMemo, useCallback } from 'react';\n\ninterface FilterOptions { search: string; category: string; minPrice: number; maxPrice: number; }\n\ninterface ${componentName}Props<T = any> { data: T[]; onFilterChange?: (filteredData: T[]) => void; className?: string; }\n\nconst ${componentName} = <T extends any>({ data, onFilterChange, className }: ${componentName}Props<T>) => {\n  const [filters, setFilters] = useState<FilterOptions>({ search: '', category: '', minPrice: 0, maxPrice: 1000 });\n  const filteredData = useMemo(() => {\n    let result = [...data];\n    if (filters.search) result = result.filter(item => item.name?.toLowerCase().includes(filters.search.toLowerCase()));\n    if (filters.category) result = result.filter(item => item.category === filters.category);\n    result = result.filter(item => item.price >= filters.minPrice && item.price <= filters.maxPrice);\n    return result;\n  }, [data, filters]);\n  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFilters(prev => ({ ...prev, search: e.target.value })); }, []);\n  return (\n    <div className={\`filter-component \${className || ''}\`}>\n      <div className="filters-section p-4 bg-gray-50 rounded-lg">\n        <input type="text" placeholder="🔍 Search..." value={filters.search} onChange={handleSearchChange} className="w-full px-3 py-2 border rounded-md" />\n      </div>\n      <div className="results-section mt-4">\n        {filteredData.map((item, index) => (<div key={index} className="p-4 border rounded-lg mb-2"><pre>{JSON.stringify(item, null, 2)}</pre></div>))}\n      </div>\n    </div>\n  );\n};\n\nexport default ${componentName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    const filePath = path.join(componentsDir, `${componentName}.tsx`);
    await fs.writeFile(filePath, code);
    await openFile(filePath);
    vscode.window.showInformationMessage(
      `✅ Filter component ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
