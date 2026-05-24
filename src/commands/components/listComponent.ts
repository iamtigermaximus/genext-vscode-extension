import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../../helpers/fileHelpers";
import { validateComponentName } from "../../helpers/validationHelpers";

export async function createListComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "List component name (PascalCase)",
      placeHolder: "ProductGrid",
      validateInput: validateComponentName,
    });
    if (!componentName) return;

    const listType = await vscode.window.showQuickPick(
      ["📊 Grid Layout", "📋 Basic List", "🔄 Carousel/Slider", "📑 Accordion"],
      { placeHolder: "Select list type" },
    );

    const itemInterface = await vscode.window.showInputBox({
      prompt: "Item interface name (PascalCase)",
      placeHolder: "Product",
      value: "Item",
    });

    const baseItemInterface = itemInterface || "Item";

    let code = `"use client";

import React from "react";

export interface ${baseItemInterface} {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  [key: string]: unknown;
}

interface ${componentName}Props<T extends ${baseItemInterface}> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string | number;
}

const ${componentName} = <T extends ${baseItemInterface}>({
  items,
  renderItem,
  className = "",
  emptyMessage = "No items to display",
  keyExtractor = (item, index) => item.id ?? index,
}: ${componentName}Props<T>) => {
  if (!items || items.length === 0) {
    return (
      <div className={\`text-center text-gray-500 p-8 \${className}\`}>
        {emptyMessage}
      </div>
    );
  }

`;

    if (listType === "🔄 Carousel/Slider") {
      code += `  const [currentIndex, setCurrentIndex] = React.useState(0);
  const next = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <div className="carousel relative">
      <div className="carousel-container overflow-hidden">
        <div 
          className="carousel-track flex transition-transform duration-300" 
          style={{ transform: \`translateX(-\${currentIndex * 100}%)\` }}
        >
          {items.map((item, index) => (
            <div key={keyExtractor(item, index)} className="carousel-slide min-w-full">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={prev} 
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
        aria-label="Previous"
      >
        ◀
      </button>
      <button 
        onClick={next} 
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
        aria-label="Next"
      >
        ▶
      </button>
    </div>
  );
};`;
    } else if (listType === "📊 Grid Layout") {
      code += `  return (
    <div className={\`grid gap-4 \${className}\`}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};`;
    } else if (listType === "📑 Accordion") {
      code += `  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="accordion-list">
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)} className="accordion-item border rounded mb-2">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="accordion-header w-full text-left p-4 font-semibold bg-gray-50 hover:bg-gray-100 transition"
          >
            {item.title || item.name || \`Item \${index + 1}\`}
          </button>
          {openIndex === index && (
            <div className="accordion-content p-4">
              {renderItem(item, index)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};`;
    } else {
      code += `  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)} className="p-3 border-b hover:bg-gray-50 transition">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};`;
    }

    code += `\n\nexport default ${componentName};`;

    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    const filePath = path.join(componentsDir, `${componentName}.tsx`);
    await fs.writeFile(filePath, code);
    await openFile(filePath);
    vscode.window.showInformationMessage(
      `✅ List component ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
