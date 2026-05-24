import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import {
  getTargetDirectory,
  detectRouterType,
  openFile,
} from "../helpers/fileHelpers";
import {
  getTypeScriptType,
  parsePrismaSchemaAdvanced,
} from "../helpers/prismaHelpers";

export async function generateInterfaceFromData(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    const inputMethod = await vscode.window.showQuickPick(
      [
        {
          label: "📋 Paste JSON Data",
          description: "Generate interface from JSON example",
          value: "json",
        },
        {
          label: "✏️ Enter Fields Manually",
          description: "Add fields one by one",
          value: "manual",
        },
        {
          label: "🔍 From Prisma Schema",
          description: "Generate from existing model",
          value: "prisma",
        },
      ],
      { placeHolder: "How do you want to create the interface?" },
    );

    if (!inputMethod) return;

    let interfaceName: string = "";
    let fields: { name: string; type: string; required: boolean }[] = [];

    if (inputMethod.value === "json") {
      const jsonInput = await vscode.window.showInputBox({
        prompt: "Paste your JSON data or example",
        placeHolder: '{"id": 1, "name": "John", "amount": 25000}',
      });
      if (!jsonInput) return;

      try {
        const data = JSON.parse(jsonInput);
        fields = inferTypesFromData(data);
      } catch (error) {
        vscode.window.showErrorMessage("Invalid JSON");
        return;
      }

      const nameInput = await vscode.window.showInputBox({
        prompt: "Interface name",
        placeHolder: "MyData",
      });
      if (!nameInput) return;
      interfaceName = nameInput;
    } else if (inputMethod.value === "manual") {
      const nameInput = await vscode.window.showInputBox({
        prompt: "Interface name",
        placeHolder: "MyInterface",
      });
      if (!nameInput) return;
      interfaceName = nameInput;

      let addingFields = true;
      while (addingFields) {
        const fieldName = await vscode.window.showInputBox({
          prompt: "Field name",
          placeHolder: "fieldName",
        });
        if (!fieldName) break;

        const fieldType = await vscode.window.showQuickPick(
          ["string", "number", "boolean", "Date", "string[]"],
          { placeHolder: "Select type" },
        );
        if (!fieldType) continue;

        fields.push({ name: fieldName, type: fieldType, required: true });

        const addMore = await vscode.window.showQuickPick(["Yes", "No"], {
          placeHolder: "Add another field?",
        });
        if (addMore !== "Yes") addingFields = false;
      }
    } else if (inputMethod.value === "prisma") {
      const schemaPath = path.join(targetDir, "prisma", "schema.prisma");
      if (!(await fs.pathExists(schemaPath))) {
        vscode.window.showErrorMessage("No prisma/schema.prisma found");
        return;
      }

      const schemaContent = await fs.readFile(schemaPath, "utf-8");
      const models = parsePrismaSchemaAdvanced(schemaContent);

      const selectedModel = await vscode.window.showQuickPick(
        models.map((m) => ({
          label: m.name,
          description: `${m.fields.length} fields`,
        })),
        { placeHolder: "Select model" },
      );
      if (!selectedModel) return;

      const model = models.find((m) => m.name === selectedModel.label);
      if (model) {
        interfaceName = model.name;
        fields = model.fields.map((f) => ({
          name: f.name,
          type: getTypeScriptType(f.type, f.isArray, f.isRequired),
          required: f.isRequired,
        }));
      }
    }

    const interfaceCode = generateInterfaceCode(interfaceName, fields);
    const typesDir = path.join(targetDir, "src", "types");
    await fs.ensureDir(typesDir);
    const filePath = path.join(typesDir, `${interfaceName}.ts`);
    await fs.writeFile(filePath, interfaceCode);
    await openFile(filePath);
    vscode.window.showInformationMessage(
      `✅ Interface ${interfaceName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

function inferTypesFromData(
  data: any,
): { name: string; type: string; required: boolean }[] {
  const fields: { name: string; type: string; required: boolean }[] = [];
  for (const [key, value] of Object.entries(data)) {
    let type = "any";
    if (value === null) type = "null";
    else if (typeof value === "string") type = "string";
    else if (typeof value === "number") type = "number";
    else if (typeof value === "boolean") type = "boolean";
    else if (Array.isArray(value)) type = "any[]";
    else if (typeof value === "object") type = "Record<string, any>";
    fields.push({ name: key, type, required: true });
  }
  return fields;
}

function generateInterfaceCode(
  name: string,
  fields: { name: string; type: string; required: boolean }[],
): string {
  const lines = [`export interface ${name} {`];
  for (const field of fields) {
    lines.push(`  ${field.name}${field.required ? "" : "?"}: ${field.type};`);
  }
  lines.push(`}`);
  return lines.join("\n");
}
