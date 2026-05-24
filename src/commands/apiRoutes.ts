import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, detectRouterType } from "../helpers/fileHelpers";

// ==================== API ROUTE GENERATOR ====================
export async function createApiRouteHandler(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const routerType = await detectRouterType(targetDir);
    let apiDir =
      routerType === "app"
        ? path.join(targetDir, "src", "app", "api")
        : path.join(targetDir, "src", "pages", "api");

    if (!(await fs.pathExists(apiDir))) await fs.ensureDir(apiDir);

    const routeName = await vscode.window.showInputBox({
      prompt: "Route name",
      placeHolder: "users",
    });
    if (!routeName) return;

    const methods = await vscode.window.showQuickPick(
      ["GET", "POST", "PUT", "DELETE"],
      { canPickMany: true, placeHolder: "Select HTTP methods" },
    );
    if (!methods || methods.length === 0) return;

    const modelName =
      routeName.charAt(0).toUpperCase() +
      routeName.slice(1).replace(/[\[\]]/g, "");
    const singular = routeName.endsWith("s")
      ? routeName.slice(0, -1)
      : routeName;
    const prismaModel = singular.toLowerCase();

    let code = `// ============================================\n// 🚨 API ROUTE - Replace 🔴 placeholders\n// 🔴 Replace "${prismaModel}" with your actual Prisma model\n// ============================================\n\nimport { NextRequest, NextResponse } from 'next/server';\nimport { prisma } from '@/lib/prisma';\n\n`;

    if (methods.includes("GET")) {
      code += `export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // 🔴🔴🔴 REPLACE "${prismaModel}" with your actual Prisma model name
    const [data, total] = await Promise.all([
      prisma.${prismaModel}.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.${prismaModel}.count()
    ]);
    return NextResponse.json({ success: true, data, pagination: { page, limit, total } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}\n`;
    }

    if (methods.includes("POST")) {
      code += `\nexport async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 🔴🔴🔴 REPLACE with your actual Prisma create
    const newItem = await prisma.${prismaModel}.create({ data: body });
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}\n`;
    }

    if (methods.includes("PUT")) {
      code += `\nexport async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const body = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    // 🔴🔴🔴 REPLACE with your actual Prisma update
    const updated = await prisma.${prismaModel}.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}\n`;
    }

    if (methods.includes("DELETE")) {
      code += `\nexport async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    // 🔴🔴🔴 REPLACE with your actual Prisma delete
    await prisma.${prismaModel}.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}\n`;
    }

    let filePath: string;
    if (routerType === "app") {
      const routePath = routeName.includes("/")
        ? path.join(...routeName.split("/"))
        : routeName;
      filePath = path.join(apiDir, routePath, "route.ts");
    } else {
      const fileName = routeName.includes("/")
        ? path.join(...routeName.split("/"))
        : routeName;
      filePath = path.join(apiDir, `${fileName}.ts`);
    }

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, code);
    vscode.window.showInformationMessage(
      `✅ API Route ${routeName} created! Replace 🔴 placeholders.`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// ==================== DYNAMIC ROUTE GENERATOR ====================
export async function createDynamicRouteFile(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const paramName = await vscode.window.showInputBox({
      prompt: "Parameter name",
      placeHolder: "id",
      value: "id",
    });
    if (!paramName) return;

    const routerType = await detectRouterType(targetDir);

    if (routerType === "app") {
      const code = `import { notFound } from 'next/navigation';\n\ninterface PageProps { params: { ${paramName}: string }; }\n\nexport default async function DynamicPage({ params }: PageProps) {\n  const data = await fetchData(params.${paramName});\n  if (!data) notFound();\n  return <div><h1>Dynamic Page: {params.${paramName}}</h1><pre>{JSON.stringify(data, null, 2)}</pre></div>;\n}\n\nasync function fetchData(id: string) { const res = await fetch(\`https://api.example.com/items/\${id}\`); return res.json(); }`;
      const routePath = path.join(
        targetDir,
        "src",
        "app",
        `[${paramName}]`,
        "page.tsx",
      );
      await fs.ensureDir(path.dirname(routePath));
      await fs.writeFile(routePath, code);
    } else {
      const code = `import { useRouter } from 'next/router';\nimport type { GetServerSideProps } from 'next';\n\ninterface PageProps { data: any; ${paramName}: string; }\n\nconst DynamicPage: React.FC<PageProps> = ({ data, ${paramName} }) => {\n  const router = useRouter();\n  if (router.isFallback) return <div>Loading...</div>;\n  return <div><h1>Dynamic Page: {${paramName}}</h1><pre>{JSON.stringify(data, null, 2)}</pre></div>;\n};\n\nexport const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {\n  const { ${paramName} } = context.params as { ${paramName}: string };\n  const response = await fetch(\`https://api.example.com/items/\${${paramName}}\`);\n  const data = await response.json();\n  return { props: { data, ${paramName} } };\n};\n\nexport default DynamicPage;`;
      const routePath = path.join(
        targetDir,
        "src",
        "pages",
        `[${paramName}].tsx`,
      );
      await fs.writeFile(routePath, code);
    }
    vscode.window.showInformationMessage(`✅ Dynamic route created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// ==================== AZURE FUNCTIONS GENERATOR ====================
export async function createAzureFunctionHandler(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const functionName = await vscode.window.showInputBox({
      prompt: "Azure Function name",
      placeHolder: "ProcessOrder",
    });
    if (!functionName) return;

    const functionsDir = path.join(targetDir, "azure-functions", functionName);
    await fs.ensureDir(functionsDir);

    const code = `// ============================================\n// ☁️ AZURE FUNCTION - Replace 🔴 placeholders\n// 🔴 Add your business logic where indicated\n// ============================================\n\nimport { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";\n\nexport async function ${functionName}Handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {\n  context.log(\`Processing \${context.invocationId}\`);\n  try {\n    // 🔴🔴🔴 Add your business logic here\n    // Example: const body = await request.json();\n    // Example: const result = await processData(body);\n    \n    return { status: 200, jsonBody: { success: true, message: 'Success', timestamp: new Date().toISOString() } };\n  } catch (error) {\n    return { status: 500, jsonBody: { error: 'Internal server error' } };\n  }\n}\n\napp.http('${functionName}', { methods: ['GET', 'POST', 'PUT', 'DELETE'], authLevel: 'function', handler: ${functionName}Handler });`;

    await fs.writeFile(path.join(functionsDir, "index.ts"), code);
    vscode.window.showInformationMessage(
      `✅ Azure Function ${functionName} created! Replace 🔴 placeholders.`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
