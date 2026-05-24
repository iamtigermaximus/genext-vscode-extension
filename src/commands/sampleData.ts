import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../helpers/fileHelpers";

export async function generateSampleJsonHandler(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    const sampleType = await vscode.window.showQuickPick(
      [
        "👤 Users Data",
        "📦 Products Data",
        "📝 Posts Data",
        "✅ Todos Data",
        "🌐 API Response (Success)",
        "⚠️ API Response (Error)",
        "📊 Paginated Response",
        "🎨 UI Mock Data",
        "🔧 All Sample Files",
      ],
      { placeHolder: "Select sample data type" },
    );

    if (!sampleType) return;

    const samplesDir = path.join(targetDir, "samples");
    await fs.ensureDir(samplesDir);

    let content = "";
    let fileName = "";

    if (sampleType === "👤 Users Data") {
      fileName = "users.json";
      content = getUsersData();
    } else if (sampleType === "📦 Products Data") {
      fileName = "products.json";
      content = getProductsData();
    } else if (sampleType === "📝 Posts Data") {
      fileName = "posts.json";
      content = getPostsData();
    } else if (sampleType === "✅ Todos Data") {
      fileName = "todos.json";
      content = getTodosData();
    } else if (sampleType === "🌐 API Response (Success)") {
      fileName = "api-success.json";
      content = getApiSuccessData();
    } else if (sampleType === "⚠️ API Response (Error)") {
      fileName = "api-error.json";
      content = getApiErrorData();
    } else if (sampleType === "📊 Paginated Response") {
      fileName = "api-paginated.json";
      content = getPaginatedData();
    } else if (sampleType === "🎨 UI Mock Data") {
      fileName = "mock-data.json";
      content = getMockData();
    } else {
      // Generate all sample files
      await fs.writeFile(path.join(samplesDir, "users.json"), getUsersData());
      await fs.writeFile(
        path.join(samplesDir, "products.json"),
        getProductsData(),
      );
      await fs.writeFile(path.join(samplesDir, "posts.json"), getPostsData());
      await fs.writeFile(
        path.join(samplesDir, "api-success.json"),
        getApiSuccessData(),
      );
      await fs.writeFile(
        path.join(samplesDir, "api-error.json"),
        getApiErrorData(),
      );
      vscode.window.showInformationMessage(
        `✅ All sample JSON files created in samples/ folder!`,
      );
      return;
    }

    const filePath = path.join(samplesDir, fileName);
    await fs.writeFile(filePath, content);
    await openFile(filePath);
    vscode.window.showInformationMessage(
      `✅ Sample JSON file created: samples/${fileName}`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

function getUsersData(): string {
  return `{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin", "status": "active", "age": 32, "city": "New York", "createdAt": "2024-01-15T10:00:00Z" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "editor", "status": "active", "age": 28, "city": "Los Angeles", "createdAt": "2024-01-20T14:30:00Z" },
    { "id": 3, "name": "Bob Johnson", "email": "bob@example.com", "role": "viewer", "status": "inactive", "age": 45, "city": "Chicago", "createdAt": "2024-02-01T09:15:00Z" }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}`;
}

function getProductsData(): string {
  return `{
  "products": [
    { "id": 1, "name": "Laptop Pro", "description": "High-performance laptop", "price": 1299.99, "category": "Electronics", "stock": 25, "rating": 4.8 },
    { "id": 2, "name": "Wireless Mouse", "description": "Ergonomic wireless mouse", "price": 49.99, "category": "Accessories", "stock": 150, "rating": 4.5 },
    { "id": 3, "name": "Mechanical Keyboard", "description": "RGB mechanical keyboard", "price": 89.99, "category": "Accessories", "stock": 75, "rating": 4.7 }
  ]
}`;
}

function getPostsData(): string {
  return `{
  "posts": [
    { "id": 1, "title": "Getting Started with Next.js", "content": "Next.js is a React framework...", "author": "John Doe", "likes": 245, "published": true, "createdAt": "2024-03-10T08:00:00Z" },
    { "id": 2, "title": "TypeScript Best Practices", "content": "Learn how to use TypeScript effectively...", "author": "Jane Smith", "likes": 189, "published": true, "createdAt": "2024-03-12T10:30:00Z" }
  ]
}`;
}

function getTodosData(): string {
  return `{
  "todos": [
    { "id": 1, "task": "Complete project documentation", "completed": false, "priority": "high", "dueDate": "2024-03-25" },
    { "id": 2, "task": "Review pull requests", "completed": true, "priority": "medium", "dueDate": "2024-03-20" },
    { "id": 3, "task": "Buy groceries", "completed": false, "priority": "low", "dueDate": "2024-03-22" }
  ]
}`;
}

function getApiSuccessData(): string {
  return `{
  "success": true,
  "message": "Operation completed successfully",
  "data": { "id": 123, "name": "Sample Item", "createdAt": "2024-03-20T10:00:00Z" },
  "timestamp": "2024-03-20T10:00:00Z"
}`;
}

function getApiErrorData(): string {
  return `{
  "success": false,
  "message": "Operation failed",
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid input data" },
  "timestamp": "2024-03-20T10:00:00Z"
}`;
}

function getPaginatedData(): string {
  return `{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" },
    { "id": 3, "name": "Item 3" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3, "nextPage": 2, "prevPage": null }
}`;
}

function getMockData(): string {
  return `{
  "chartData": [
    { "month": "Jan", "sales": 4000, "revenue": 2400 },
    { "month": "Feb", "sales": 3000, "revenue": 1398 },
    { "month": "Mar", "sales": 5000, "revenue": 3800 }
  ],
  "notifications": [
    { "id": 1, "message": "New user registered", "type": "info", "read": false }
  ]
}`;
}
