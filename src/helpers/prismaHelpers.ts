import { PrismaField, PrismaModel } from "../types";

export function getTypeScriptType(
  prismaType: string,
  isArray: boolean,
  isRequired: boolean,
): string {
  let tsType = "any";
  switch (prismaType) {
    case "String":
      tsType = "string";
      break;
    case "Int":
    case "Float":
    case "BigInt":
      tsType = "number";
      break;
    case "Boolean":
      tsType = "boolean";
      break;
    case "DateTime":
      tsType = "Date";
      break;
    case "Json":
      tsType = "Record<string, any>";
      break;
    default:
      tsType = prismaType;
  }
  if (isArray) tsType += "[]";
  if (!isRequired && !isArray) tsType += " | null";
  return tsType;
}

export function getZodType(prismaType: string, isRequired: boolean): string {
  let zodType = "z.string()";
  switch (prismaType) {
    case "String":
      zodType = "z.string()";
      break;
    case "Int":
      zodType = "z.number().int()";
      break;
    case "Float":
      zodType = "z.number()";
      break;
    case "Boolean":
      zodType = "z.boolean()";
      break;
    case "DateTime":
      zodType = "z.string().datetime()";
      break;
    case "Json":
      zodType = "z.record(z.any())";
      break;
    default:
      zodType = "z.any()";
  }
  if (!isRequired) zodType = `${zodType}.optional()`;
  return zodType;
}

export function parsePrismaSchemaAdvanced(
  schemaContent: string,
): PrismaModel[] {
  const models: PrismaModel[] = [];
  const modelRegex = /model\s+(\w+)\s+{([^}]*(?:{[^}]*}[^}]*)*)}/gs;
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    const fields: PrismaField[] = [];
    const relations: PrismaField[] = [];
    const fieldLines = modelBody.split("\n");

    for (const line of fieldLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@"))
        continue;

      const fieldMatch = trimmed.match(
        /^(\w+)\s+(\w+)(\[\])?(?:\s*[?]?)?(?:\s+@(\w+))?(?:\s+@relation\(([^)]*)\))?/,
      );
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const isArray = !!fieldMatch[3];
        const isId = fieldMatch[4] === "id";
        const relationMatch = trimmed.match(/@relation\(["']?(\w+)["']?/);
        const isRelation = !!relationMatch;
        const relationModel = isRelation ? relationMatch[1] : undefined;

        fields.push({
          name: fieldName,
          type: fieldType,
          isArray,
          isId,
          isRequired: !trimmed.includes("?") && !isArray,
          isRelation,
          relationModel,
          defaultValue: trimmed.match(/@default\((\w+)\)/)?.[1],
        });

        if (isRelation) relations.push(fields[fields.length - 1]);
      }
    }
    models.push({ name: modelName, fields, relations });
  }
  return models;
}
