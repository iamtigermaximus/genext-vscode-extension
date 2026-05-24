import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, detectRouterType } from "../helpers/fileHelpers";
import {
  getTypeScriptType,
  getZodType,
  parsePrismaSchemaAdvanced,
} from "../helpers/prismaHelpers";
import { PrismaModel, ModelQuickPickItem } from "../types";

// ==================== PRISMA SCHEMA GENERATOR ====================
export async function generatePrismaSchemaHandler(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const prismaDir = path.join(targetDir, "prisma");
    await fs.ensureDir(prismaDir);

    const schemaType = await vscode.window.showQuickPick(
      ["📚 Learning Platform", "🛒 E-Commerce", "📝 Blog", "🔧 Custom"],
      { placeHolder: "Select schema template" },
    );

    const baseTemplate = `// ============================================
// 🚀 PRISMA SCHEMA - Replace 🔴 placeholders
// 🔴 Update database provider and URL
// ============================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"     // 🔴 Change to: mysql, sqlite, mongodb
  url      = env("DATABASE_URL")
}

`;

    let schemaContent = baseTemplate;

    if (schemaType === "📚 Learning Platform") {
      schemaContent += getLearningPlatformSchema();
    } else if (schemaType === "🛒 E-Commerce") {
      schemaContent += getEcommerceSchema();
    } else {
      schemaContent += getCustomSchema();
    }

    await fs.writeFile(path.join(prismaDir, "schema.prisma"), schemaContent);

    const envPath = path.join(targetDir, ".env");
    if (!(await fs.pathExists(envPath))) {
      await fs.writeFile(
        envPath,
        `DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"\n`,
      );
    }

    const libDir = path.join(targetDir, "src", "lib");
    await fs.ensureDir(libDir);

    const prismaTsPath = path.join(libDir, "prisma.ts");
    const prismaTsContent = `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma`;

    await fs.writeFile(prismaTsPath, prismaTsContent);

    const action = await vscode.window.showInformationMessage(
      `✅ Generated:\n- prisma/schema.prisma\n- src/lib/prisma.ts\n- .env\n\nNext steps:`,
      "Install Prisma",
      "Run Generate",
      "Open Schema",
    );

    if (action === "Install Prisma") {
      const terminal = vscode.window.createTerminal("Install Prisma");
      terminal.show();
      terminal.sendText("npm install prisma --save-dev");
      terminal.sendText("npm install @prisma/client");
    } else if (action === "Run Generate") {
      const terminal = vscode.window.createTerminal("Prisma Generate");
      terminal.show();
      terminal.sendText("npx prisma generate");
    } else if (action === "Open Schema") {
      const doc = await vscode.workspace.openTextDocument(
        path.join(prismaDir, "schema.prisma"),
      );
      await vscode.window.showTextDocument(doc);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating Prisma files: ${error}`);
  }
}

function getLearningPlatformSchema(): string {
  return `// ============================================
// 📚 LEARNING PLATFORM MODELS
// ============================================

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("student")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  price       Float?
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Enrollment {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  courseId   String
  course     Course   @relation(fields: [courseId], references: [id])
  progress   Float    @default(0)
  enrolledAt DateTime @default(now())
}`;
}

function getEcommerceSchema(): string {
  return `// ============================================
// 🛒 E-COMMERCE MODELS
// ============================================

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  address   String?
  createdAt DateTime @default(now())
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String   @db.Text
  price       Float
  stock       Int      @default(0)
  images      String[]
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Order {
  id          String   @id @default(cuid())
  orderNumber String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  status      String   @default("pending")
  total       Float
  createdAt   DateTime @default(now())
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}`;
}

function getCustomSchema(): string {
  return `// ============================================
// 📝 YOUR MODELS GO HERE
// ============================================

// Example model:
model Example {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
}

// ==================== PRISMA SCHEMA SCANNER & ROUTE GENERATOR ====================
export async function generateRoutesFromPrisma(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    const possiblePaths = [
      path.join(targetDir, "prisma", "schema.prisma"),
      path.join(targetDir, "schema.prisma"),
    ];

    let schemaPath: string | undefined;
    for (const p of possiblePaths) {
      if (await fs.pathExists(p)) {
        schemaPath = p;
        break;
      }
    }

    if (!schemaPath) {
      const generate = await vscode.window.showWarningMessage(
        "No prisma/schema.prisma found. Generate one first?",
        "Generate Schema",
        "Cancel",
      );
      if (generate === "Generate Schema") {
        await generatePrismaSchemaHandler(uri);
        const newPath = path.join(targetDir, "prisma", "schema.prisma");
        if (await fs.pathExists(newPath)) {
          schemaPath = newPath;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    const schemaContent = await fs.readFile(schemaPath!, "utf-8");
    const models = parsePrismaSchemaAdvanced(schemaContent);

    if (models.length === 0) {
      vscode.window.showErrorMessage("No models found in schema.prisma");
      return;
    }

    const modelItems: ModelQuickPickItem[] = models.map((m) => ({
      label: `$(database) ${m.name}`,
      description: `${m.fields.length} fields, ${m.relations.length} relations`,
      detail:
        m.fields
          .slice(0, 3)
          .map((f) => `${f.name}: ${f.type}`)
          .join(", ") + (m.fields.length > 3 ? "..." : ""),
      picked: true,
      model: m,
    }));

    const selectedItems = await vscode.window.showQuickPick(modelItems, {
      canPickMany: true,
      placeHolder: "Select models to generate API routes for",
    });

    if (!selectedItems || selectedItems.length === 0) return;

    function isModelQuickPickItem(item: any): item is ModelQuickPickItem {
      return item && typeof item === "object" && "model" in item;
    }

    const selectedModels = selectedItems
      .filter(isModelQuickPickItem)
      .map((item) => item.model);

    if (selectedModels.length === 0) {
      vscode.window.showErrorMessage("No valid models selected");
      return;
    }

    const routeOptions = await vscode.window.showQuickPick(
      [
        {
          label: "🚀 Full CRUD (GET, POST, PUT, DELETE)",
          value: "full",
          description: "Complete REST API",
        },
        {
          label: "📖 Read-only (GET only)",
          value: "readonly",
          description: "Only fetch endpoints",
        },
        {
          label: "✏️ Custom selection",
          value: "custom",
          description: "Choose specific methods",
        },
      ],
      { placeHolder: "Select route types to generate" },
    );

    if (!routeOptions) return;

    let methods: string[] = [];
    if (routeOptions.value === "full") {
      methods = ["GET", "POST", "PUT", "DELETE"];
    } else if (routeOptions.value === "readonly") {
      methods = ["GET"];
    } else if (routeOptions.value === "custom") {
      const selectedMethods = await vscode.window.showQuickPick(
        [
          { label: "GET", picked: true, description: "Fetch data" },
          { label: "POST", picked: true, description: "Create data" },
          { label: "PUT", picked: true, description: "Update data" },
          { label: "DELETE", picked: true, description: "Delete data" },
        ],
        { canPickMany: true, placeHolder: "Select HTTP methods" },
      );
      if (selectedMethods) {
        methods = selectedMethods.map((m) => m.label);
      }
    }

    const additionalFeatures = await vscode.window.showQuickPick(
      [
        {
          label: "🔐 Add Authentication",
          picked: true,
          description: "Protect routes with NextAuth",
        },
        {
          label: "📊 Add Pagination",
          picked: true,
          description: "Include pagination metadata",
        },
        {
          label: "🔍 Add Filtering",
          picked: false,
          description: "Enable field filtering",
        },
        {
          label: "📝 Add Validation",
          picked: true,
          description: "Add Zod validation",
        },
        {
          label: "🔄 Include Relations",
          picked: true,
          description: "Include related models",
        },
      ],
      { canPickMany: true, placeHolder: "Select additional features" },
    );

    const routerType = await detectRouterType(targetDir);
    const apiBaseDir =
      routerType === "app"
        ? path.join(targetDir, "src", "app", "api")
        : path.join(targetDir, "src", "pages", "api");

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Generating API routes from Prisma schema...",
        cancellable: false,
      },
      async (progress) => {
        for (const selectedModel of selectedModels) {
          progress.report({
            message: `Generating routes for ${selectedModel.name}...`,
            increment: 100 / selectedModels.length,
          });

          await generateAdvancedCRUDRoutes(
            selectedModel,
            apiBaseDir,
            routerType,
            methods,
            additionalFeatures || [],
          );
        }
      },
    );

    const generateClient = await vscode.window.showInformationMessage(
      `✅ Generated ${selectedModels.length} API route files!`,
      "Generate API Client",
      "View Routes",
      "Close",
    );

    if (generateClient === "Generate API Client") {
      await generateApiClientFromRoutes(selectedModels, targetDir);
    } else if (generateClient === "View Routes") {
      const apiDir = path.join(targetDir, "src", "app", "api");
      if (await fs.pathExists(apiDir)) {
        const uriFolder = vscode.Uri.file(apiDir);
        await vscode.commands.executeCommand("revealInExplorer", uriFolder);
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating routes: ${error}`);
    console.error(error);
  }
}

async function generateAdvancedCRUDRoutes(
  model: PrismaModel,
  apiBaseDir: string,
  routerType: string,
  methods: string[],
  features: any[],
) {
  const modelName = model.name;
  const modelVar = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const routeDir = path.join(apiBaseDir, modelVar.toLowerCase());

  const idField = model.fields.find((f) => f.isId || f.name === "id") || {
    name: "id",
    type: "String",
  };
  const idType = idField.type === "Int" ? "number" : "string";
  const hasAuth = features.some((f) => f.label === "🔐 Add Authentication");
  const hasValidation = features.some((f) => f.label === "📝 Add Validation");
  const hasRelations = features.some((f) => f.label === "🔄 Include Relations");
  const hasPagination = features.some((f) => f.label === "📊 Add Pagination");
  const hasFiltering = features.some((f) => f.label === "🔍 Add Filtering");

  const createFields = model.fields.filter((f) => !f.isId && !f.isRelation);
  const updateFields = model.fields.filter((f) => !f.isRelation);

  const tsInterfaceFields = model.fields
    .map((f) => {
      let tsType = getTypeScriptType(f.type, f.isArray, f.isRequired);
      return `  ${f.name}: ${tsType};`;
    })
    .join("\n");

  let routeCode = `// ============================================
// 🚀 AUTO-GENERATED API ROUTE FOR ${modelName}
// Generated by GeNext from Prisma schema
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
${
  hasAuth
    ? `import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
`
    : ""
}
${
  hasValidation
    ? `import { z } from 'zod';
`
    : ""
}
// ============================================
// Type Definitions
// ============================================

export interface ${modelName} {
${tsInterfaceFields}
}

`;

  if (hasValidation) {
    routeCode += `// ============================================
// Validation Schemas
// ============================================

const create${modelName}Schema = z.object({
${createFields.map((f) => `  ${f.name}: ${getZodType(f.type, f.isRequired)},`).join("\n")}
});

const update${modelName}Schema = create${modelName}Schema.partial();

`;
  }

  if (methods.includes("GET")) {
    routeCode += `// ============================================
// GET - Fetch ${modelName}(s)
// ============================================

export async function GET(request: NextRequest) {
  try {
    ${
      hasAuth
        ? `const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    `
        : ""
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const ${modelVar} = await prisma.${modelVar}.findUnique({
        where: { ${idField.name}: ${idType === "number" ? `parseInt(id)` : "id"} },
        ${
          hasRelations
            ? `include: {
${model.relations.map((r) => `          ${r.name}: true,`).join("\n")}
        },`
            : ""
        }
      });
      
      if (!${modelVar}) {
        return NextResponse.json({ error: '${modelName} not found' }, { status: 404 });
      }
      
      return NextResponse.json(${modelVar});
    }
    
    const where: Record<string, unknown> = {};
    ${
      hasFiltering
        ? createFields
            .map(
              (f) => `
    if (searchParams.get('${f.name}')) {
      where.${f.name} = ${f.type === "String" ? `searchParams.get('${f.name}')` : `parseInt(searchParams.get('${f.name}')!)`};
    }`,
            )
            .join("\n")
        : ""
    }
    
    ${
      hasPagination
        ? `const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const [${modelVar}s, total] = await Promise.all([
      prisma.${modelVar}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        ${
          hasRelations
            ? `include: {
${model.relations.map((r) => `          ${r.name}: true,`).join("\n")}
        },`
            : ""
        }
      }),
      prisma.${modelVar}.count({ where })
    ]);
    
    return NextResponse.json({
      data: ${modelVar}s,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 }
    });`
        : `
    const ${modelVar}s = await prisma.${modelVar}.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ${
        hasRelations
          ? `include: {
${model.relations.map((r) => `        ${r.name}: true,`).join("\n")}
      },`
          : ""
      }
    });
    
    return NextResponse.json(${modelVar}s);`
    }
    
  } catch (error) {
    console.error('Error fetching ${modelVar}s:', error);
    return NextResponse.json({ error: 'Failed to fetch ${modelVar}s' }, { status: 500 });
  }
}

`;
  }

  if (methods.includes("POST")) {
    routeCode += `// ============================================
// POST - Create ${modelName}
// ============================================

export async function POST(request: NextRequest) {
  try {
    ${
      hasAuth
        ? `const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    `
        : ""
    }
    const body = await request.json();
    
    ${
      hasValidation
        ? `const validationResult = create${modelName}Schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    const validatedData = validationResult.data;
    `
        : "const validatedData = body;"
    }
    
    const new${modelName} = await prisma.${modelVar}.create({
      data: {
${createFields.map((f) => `        ${f.name}: validatedData.${f.name},`).join("\n")}
      },
      ${
        hasRelations
          ? `include: {
${model.relations.map((r) => `        ${r.name}: true,`).join("\n")}
      },`
          : ""
      }
    });
    
    return NextResponse.json(new${modelName}, { status: 201 });
  } catch (error) {
    console.error('Error creating ${modelVar}:', error);
    return NextResponse.json({ error: 'Failed to create ${modelVar}' }, { status: 500 });
  }
}

`;
  }

  if (methods.includes("PUT")) {
    routeCode += `// ============================================
// PUT - Update ${modelName}
// ============================================

export async function PUT(request: NextRequest) {
  try {
    ${
      hasAuth
        ? `const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    `
        : ""
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    
    ${
      hasValidation
        ? `const validationResult = update${modelName}Schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    const validatedData = validationResult.data;
    `
        : "const validatedData = body;"
    }
    
    const existing = await prisma.${modelVar}.findUnique({
      where: { ${idField.name}: ${idType === "number" ? `parseInt(id)` : "id"} }
    });
    
    if (!existing) {
      return NextResponse.json({ error: '${modelName} not found' }, { status: 404 });
    }
    
    const updated${modelName} = await prisma.${modelVar}.update({
      where: { ${idField.name}: ${idType === "number" ? `parseInt(id)` : "id"} },
      data: {
${updateFields.map((f) => `        ${f.name}: validatedData.${f.name} ?? existing.${f.name},`).join("\n")}
      },
      ${
        hasRelations
          ? `include: {
${model.relations.map((r) => `        ${r.name}: true,`).join("\n")}
      },`
          : ""
      }
    });
    
    return NextResponse.json(updated${modelName});
  } catch (error) {
    console.error('Error updating ${modelVar}:', error);
    return NextResponse.json({ error: 'Failed to update ${modelVar}' }, { status: 500 });
  }
}

`;
  }

  if (methods.includes("DELETE")) {
    routeCode += `// ============================================
// DELETE - Remove ${modelName}
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    ${
      hasAuth
        ? `const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    `
        : ""
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const existing = await prisma.${modelVar}.findUnique({
      where: { ${idField.name}: ${idType === "number" ? `parseInt(id)` : "id"} }
    });
    
    if (!existing) {
      return NextResponse.json({ error: '${modelName} not found' }, { status: 404 });
    }
    
    await prisma.${modelVar}.delete({
      where: { ${idField.name}: ${idType === "number" ? `parseInt(id)` : "id"} }
    });
    
    return NextResponse.json({ message: '${modelName} deleted successfully', deletedId: id });
  } catch (error) {
    console.error('Error deleting ${modelVar}:', error);
    return NextResponse.json({ error: 'Failed to delete ${modelVar}' }, { status: 500 });
  }
}

`;
  }

  let filePath: string;
  if (routerType === "app") {
    filePath = path.join(routeDir, "route.ts");
  } else {
    filePath = path.join(apiBaseDir, `${modelVar}.ts`);
  }

  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, routeCode);
}

async function generateApiClientFromRoutes(
  models: PrismaModel[],
  targetDir: string,
) {
  const clientDir = path.join(targetDir, "src", "lib", "api");
  await fs.ensureDir(clientDir);

  const clientCode = `// ============================================
// 🚀 AUTO-GENERATED API CLIENT
// Generated by GeNext
// ============================================

${models
  .map(
    (model) => `
export interface ${model.name} {
  id: string;
  createdAt: string;
  updatedAt: string;
${model.fields
  .filter((f) => !f.isId)
  .map(
    (f) =>
      `  ${f.name}: ${getTypeScriptType(f.type, f.isArray, f.isRequired)};`,
  )
  .join("\n")}
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const ${model.name.toLowerCase()}Api = {
  async getAll(params?: { page?: number; limit?: number; [key: string]: any }) {
    const searchParams = new URLSearchParams(params as any);
    const response = await fetch(\`/api/${model.name.toLowerCase()}?\${searchParams}\`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json() as Promise<PaginatedResponse<${model.name}>>;
  },
  
  async getById(id: string | number) {
    const response = await fetch(\`/api/${model.name.toLowerCase()}?id=\${id}\`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json() as Promise<${model.name}>;
  },
  
  async create(data: Omit<${model.name}, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(\`/api/${model.name.toLowerCase()}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create');
    return response.json() as Promise<${model.name}>;
  },
  
  async update(id: string | number, data: Partial<${model.name}>) {
    const response = await fetch(\`/api/${model.name.toLowerCase()}?id=\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update');
    return response.json() as Promise<${model.name}>;
  },
  
  async delete(id: string | number) {
    const response = await fetch(\`/api/${model.name.toLowerCase()}?id=\${id}\`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete');
    return response.json();
  },
};
`,
  )
  .join("\n")}

export const createApiHooks = () => {
  return {
${models
  .map(
    (model) => `
    use${model.name}s: (params?: any) => ['${model.name.toLowerCase()}s', params],
    use${model.name}: (id: string | number) => ['${model.name.toLowerCase()}', id],`,
  )
  .join("\n")}
  };
};
`;

  await fs.writeFile(path.join(clientDir, "client.ts"), clientCode);
  vscode.window.showInformationMessage(
    `✅ API client generated at src/lib/api/client.ts`,
  );
}
