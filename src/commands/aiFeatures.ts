import * as vscode from "vscode";
import * as path from "path";
import { getDeepSeekClient } from "../clients/deepseek-client";

export async function analyzeCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  const client = await getDeepSeekClient();
  if (!client) return;
  const code = editor.document.getText();
  const fileName = path.basename(editor.document.fileName);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "🤖 DeepSeek is analyzing your code...",
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 50 });
      const analysis = await client.analyzeCode(code, fileName);
      const panel = vscode.window.createWebviewPanel(
        "codeAnalysis",
        `📊 Code Analysis - ${fileName}`,
        vscode.ViewColumn.Beside,
        { enableScripts: true },
      );
      panel.webview.html = `<h1>🤖 DeepSeek Code Analysis</h1><div>${analysis.replace(/\n/g, "<br>")}</div>`;
      progress.report({ increment: 100 });
    },
  );
}

export async function generateDocs() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  const client = await getDeepSeekClient();
  if (!client) return;
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  const codeToDoc = selectedText || editor.document.getText();
  const componentName = await vscode.window.showInputBox({
    prompt: "Component/Function name",
    placeHolder: "UserProfile, useAuth, formatDate",
  });
  if (!componentName) return;

  const documentation = await client.generateDocumentation(
    codeToDoc,
    componentName,
  );
  await editor.edit((editBuilder) => {
    if (selection.isEmpty) {
      editBuilder.insert(selection.active, `\n${documentation}\n`);
    } else {
      editBuilder.replace(selection, documentation);
    }
  });
  vscode.window.showInformationMessage(
    `✅ Documentation generated for ${componentName}!`,
  );
}

export async function findBugs() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  const client = await getDeepSeekClient();
  if (!client) return;
  const code = editor.document.getText();
  const bugs = await client.findBugs(code);
  const panel = vscode.window.createWebviewPanel(
    "bugFinder",
    "🐛 Bug Report",
    vscode.ViewColumn.Beside,
    { enableScripts: true },
  );
  panel.webview.html = `<h1>🐛 DeepSeek Bug Report</h1><div>${bugs.replace(/\n/g, "<br>")}</div>`;
}

export async function explainCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  const client = await getDeepSeekClient();
  if (!client) return;
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  if (!selectedText) {
    vscode.window.showErrorMessage("Please select code to explain first.");
    return;
  }
  const explanation = await client.explainCode(selectedText);
  const panel = vscode.window.createWebviewPanel(
    "codeExplanation",
    "💡 Code Explanation",
    vscode.ViewColumn.Beside,
    { enableScripts: true },
  );
  panel.webview.html = `<h1>💡 DeepSeek Code Explanation</h1><pre>${selectedText.replace(/</g, "&lt;")}</pre><div>${explanation.replace(/\n/g, "<br>")}</div>`;
}

export async function refactorCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  const client = await getDeepSeekClient();
  if (!client) return;
  const patterns = [
    "React Hooks (useState, useEffect)",
    "Custom Hooks",
    "Higher-Order Components",
    "Render Props",
    "Compound Components",
    "Context API",
    "Reducer Pattern (useReducer)",
  ];
  const pattern = await vscode.window.showQuickPick(patterns, {
    placeHolder: "Select refactoring pattern",
  });
  if (!pattern) return;

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  const codeToRefactor = selectedText || editor.document.getText();
  const refactored = await client.refactorCode(codeToRefactor, pattern);

  if (selection.isEmpty) {
    const fullRange = new vscode.Range(
      editor.document.positionAt(0),
      editor.document.positionAt(editor.document.getText().length),
    );
    await editor.edit((editBuilder) =>
      editBuilder.replace(fullRange, refactored),
    );
  } else {
    await editor.edit((editBuilder) =>
      editBuilder.replace(selection, refactored),
    );
  }
  vscode.window.showInformationMessage(`✅ Code refactored to ${pattern}!`);
}

export async function openAIChat(extensionPath: string) {
  const { AIChatPanel } = await import("../panels/chat-panel");
  AIChatPanel.createOrShow(extensionPath);
}
