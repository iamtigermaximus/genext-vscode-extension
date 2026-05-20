import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";
import { promisify } from "util";
import { DeepSeekClient } from "./deepseek-client";
import { AIChatPanel } from "./chat-panel";

let deepseekClient: DeepSeekClient | null = null;

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
  console.log("🚀 GeNext is now active!");

  // ==================== FILE GENERATORS (15) ====================
  const showDashboard = vscode.commands.registerCommand(
    "genext.showDashboard",
    showDashboardHandler,
  );
  const initProject = vscode.commands.registerCommand(
    "genext.initProject",
    initProjectHandler,
  );
  const createComponent = vscode.commands.registerCommand(
    "genext.createComponent",
    createReactComponent,
  );
  const createApiRoute = vscode.commands.registerCommand(
    "genext.createApiRoute",
    createApiRouteHandler,
  );
  const createHook = vscode.commands.registerCommand(
    "genext.createHook",
    createCustomHook,
  );
  const createUtility = vscode.commands.registerCommand(
    "genext.createUtility",
    createUtilityFunction,
  );
  const createFilter = vscode.commands.registerCommand(
    "genext.createFilter",
    createFilterComponent,
  );
  const createList = vscode.commands.registerCommand(
    "genext.createList",
    createListComponent,
  );
  const createDataFetcher = vscode.commands.registerCommand(
    "genext.createDataFetcher",
    createDataFetcherComponent,
  );
  const createDynamicRoute = vscode.commands.registerCommand(
    "genext.createDynamicRoute",
    createDynamicRouteFile,
  );
  const createTest = vscode.commands.registerCommand(
    "genext.createTest",
    createTestFile,
  );
  const createStorybook = vscode.commands.registerCommand(
    "genext.createStorybook",
    createStorybookFile,
  );
  const createContext = vscode.commands.registerCommand(
    "genext.createContext",
    createContextProvider,
  );
  const createForm = vscode.commands.registerCommand(
    "genext.createForm",
    createFormComponent,
  );
  const createModal = vscode.commands.registerCommand(
    "genext.createModal",
    createModalComponent,
  );
  const createTable = vscode.commands.registerCommand(
    "genext.createTable",
    createTableComponent,
  );

  // ==================== CODE SNIPPETS - ARRAY METHODS (7) ====================
  const insertMap = vscode.commands.registerCommand(
    "genext.insertMap",
    insertMapFunction,
  );
  const insertFilter = vscode.commands.registerCommand(
    "genext.insertFilter",
    insertFilterFunction,
  );
  const insertFind = vscode.commands.registerCommand(
    "genext.insertFind",
    insertFindFunction,
  );
  const insertForEach = vscode.commands.registerCommand(
    "genext.insertForEach",
    insertForEachFunction,
  );
  const insertReduce = vscode.commands.registerCommand(
    "genext.insertReduce",
    insertReduceFunction,
  );
  const insertSort = vscode.commands.registerCommand(
    "genext.insertSort",
    insertSortFunction,
  );
  const insertSome = vscode.commands.registerCommand(
    "genext.insertSome",
    insertSomeFunction,
  );

  // ==================== CODE SNIPPETS - REACT HOOKS (7) ====================
  const insertUseState = vscode.commands.registerCommand(
    "genext.insertUseState",
    insertUseStateHook,
  );
  const insertUseEffect = vscode.commands.registerCommand(
    "genext.insertUseEffect",
    insertUseEffectHook,
  );
  const insertUseCallback = vscode.commands.registerCommand(
    "genext.insertUseCallback",
    insertUseCallbackHook,
  );
  const insertUseMemo = vscode.commands.registerCommand(
    "genext.insertUseMemo",
    insertUseMemoHook,
  );
  const insertUseRef = vscode.commands.registerCommand(
    "genext.insertUseRef",
    insertUseRefHook,
  );
  const insertUseContext = vscode.commands.registerCommand(
    "genext.insertUseContext",
    insertUseContextHook,
  );
  const insertUseReducer = vscode.commands.registerCommand(
    "genext.insertUseReducer",
    insertUseReducerHook,
  );

  // ==================== CODE SNIPPETS - FORM HANDLERS (4) ====================
  const insertSubmitHandler = vscode.commands.registerCommand(
    "genext.insertSubmitHandler",
    insertSubmitHandlerFunction,
  );
  const insertChangeHandler = vscode.commands.registerCommand(
    "genext.insertChangeHandler",
    insertChangeHandlerFunction,
  );
  const insertFormValidation = vscode.commands.registerCommand(
    "genext.insertFormValidation",
    insertFormValidationFunction,
  );
  const insertResetHandler = vscode.commands.registerCommand(
    "genext.insertResetHandler",
    insertResetHandlerFunction,
  );

  // ==================== CODE SNIPPETS - DATA FETCHING (4) ====================
  const insertFetchGet = vscode.commands.registerCommand(
    "genext.insertFetchGet",
    insertFetchGetFunction,
  );
  const insertFetchPost = vscode.commands.registerCommand(
    "genext.insertFetchPost",
    insertFetchPostFunction,
  );
  const insertFetchPut = vscode.commands.registerCommand(
    "genext.insertFetchPut",
    insertFetchPutFunction,
  );
  const insertFetchDelete = vscode.commands.registerCommand(
    "genext.insertFetchDelete",
    insertFetchDeleteFunction,
  );

  // ==================== CODE SNIPPETS - ERROR HANDLING & UI (4) ====================
  const insertTryCatch = vscode.commands.registerCommand(
    "genext.insertTryCatch",
    insertTryCatchBlock,
  );
  const insertLoadingSkeleton = vscode.commands.registerCommand(
    "genext.insertLoadingSkeleton",
    insertLoadingSkeletonComponent,
  );
  const insertErrorBoundary = vscode.commands.registerCommand(
    "genext.insertErrorBoundary",
    insertErrorBoundaryComponent,
  );
  const insertConditionalRender = vscode.commands.registerCommand(
    "genext.insertConditionalRender",
    insertConditionalRenderFunction,
  );

  // ==================== AI FEATURES ====================

  const openAIChat = vscode.commands.registerCommand(
    "genext.openAIChat",
    () => {
      AIChatPanel.createOrShow(context.extensionPath);
    },
  );
  const analyzeCode = vscode.commands.registerCommand(
    "genext.analyzeCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage(
          "No active editor. Please open a file first.",
        );
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

          panel.webview.html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
          h1 { color: #0e83cd; }
          .content { background: #2d2d2d; padding: 20px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <h1>🤖 DeepSeek Code Analysis</h1>
        <div class="content">${analysis.replace(/\n/g, "<br>")}</div>
      </body>
      </html>
    `;
          progress.report({ increment: 100 });
        },
      );
    },
  );

  const generateDocs = vscode.commands.registerCommand(
    "genext.generateDocs",
    async () => {
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
    },
  );

  const findBugs = vscode.commands.registerCommand(
    "genext.findBugs",
    async () => {
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

      panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        h1 { color: #f48771; }
        .content { background: #2d2d2d; padding: 20px; border-radius: 10px; }
      </style>
    </head>
    <body>
      <h1>🐛 DeepSeek Bug Report</h1>
      <div class="content">${bugs.replace(/\n/g, "<br>")}</div>
    </body>
    </html>
  `;
    },
  );

  const explainCode = vscode.commands.registerCommand(
    "genext.explainCode",
    async () => {
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

      panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        h1 { color: #9cdcfe; }
        .content { background: #2d2d2d; padding: 20px; border-radius: 10px; }
        .selected-code { background: #1e1e1e; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>💡 DeepSeek Code Explanation</h1>
      <div class="selected-code"><strong>Selected Code:</strong><pre>${selectedText.replace(/</g, "&lt;")}</pre></div>
      <div class="content">${explanation.replace(/\n/g, "<br>")}</div>
    </body>
    </html>
  `;
    },
  );

  const refactorCode = vscode.commands.registerCommand(
    "genext.refactorCode",
    async () => {
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
    },
  );

  context.subscriptions.push(
    showDashboard,
    initProject,
    createComponent,
    createApiRoute,
    createHook,
    createUtility,
    createFilter,
    createList,
    createDataFetcher,
    createDynamicRoute,
    createTest,
    createStorybook,
    createContext,
    createForm,
    createModal,
    createTable,
    insertMap,
    insertFilter,
    insertFind,
    insertForEach,
    insertReduce,
    insertSort,
    insertSome,
    insertUseState,
    insertUseEffect,
    insertUseCallback,
    insertUseMemo,
    insertUseRef,
    insertUseContext,
    insertUseReducer,
    insertSubmitHandler,
    insertChangeHandler,
    insertFormValidation,
    insertResetHandler,
    insertFetchGet,
    insertFetchPost,
    insertFetchPut,
    insertFetchDelete,
    insertTryCatch,
    insertLoadingSkeleton,
    insertErrorBoundary,
    insertConditionalRender,
    analyzeCode,
    generateDocs,
    findBugs,
    explainCode,
    refactorCode,
    openAIChat,
  );
}

// ==================== HELPER FUNCTIONS ====================
async function getTargetDirectory(uri?: vscode.Uri): Promise<string> {
  if (uri) return uri.fsPath;
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) throw new Error("No folder open");
  return folders[0].uri.fsPath;
}

async function detectRouterType(projectPath: string): Promise<"app" | "pages"> {
  const appDir = path.join(projectPath, "src", "app");
  const pagesDir = path.join(projectPath, "src", "pages");
  if (await fs.pathExists(appDir)) return "app";
  if (await fs.pathExists(pagesDir)) return "pages";
  return "app";
}

function validateComponentName(name: string): string | null {
  if (!name) return "Name is required";
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name))
    return "Use PascalCase (e.g., UserProfile)";
  return null;
}

function validateHookName(name: string): string | null {
  if (!name) return "Name is required";
  if (!/^use[A-Z]/.test(name)) return 'Must start with "use" (e.g., useAuth)';
  return null;
}

function validateUtilityName(name: string): string | null {
  if (!name) return "Name is required";
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name))
    return "Use camelCase (e.g., formatDate)";
  return null;
}

// ==================== SHOW DASHBOARD ====================
async function showDashboardHandler() {
  const items = [
    {
      label: "🏗️ Initialize New Project",
      description: "Create complete Next.js project",
      command: "genext.initProject",
    },
    { label: "📁 ───── FILE GENERATORS ─────", description: "", command: "" },
    {
      label: "   ⚛️ React Component",
      description: "Create new component file",
      command: "genext.createComponent",
    },
    {
      label: "   🌐 API Route",
      description: "Create new API route",
      command: "genext.createApiRoute",
    },
    {
      label: "   🎣 Custom Hook",
      description: "Create new hook",
      command: "genext.createHook",
    },
    {
      label: "   🛠️ Utility Function",
      description: "Create new utility",
      command: "genext.createUtility",
    },
    {
      label: "   🔍 Filter Component",
      description: "Create search/filter UI",
      command: "genext.createFilter",
    },
    {
      label: "   📋 List Component",
      description: "Create grid/carousel/tree",
      command: "genext.createList",
    },
    {
      label: "   🌐 Data Fetcher",
      description: "Create data fetching component",
      command: "genext.createDataFetcher",
    },
    {
      label: "   🛣️ Dynamic Route",
      description: "Create dynamic route",
      command: "genext.createDynamicRoute",
    },
    {
      label: "   🧪 Test File",
      description: "Create unit test",
      command: "genext.createTest",
    },
    {
      label: "   📖 Storybook",
      description: "Create story file",
      command: "genext.createStorybook",
    },
    {
      label: "   🔗 Context Provider",
      description: "Create React Context",
      command: "genext.createContext",
    },
    {
      label: "   📝 Form Component",
      description: "Create form with validation",
      command: "genext.createForm",
    },
    {
      label: "   🪟 Modal Component",
      description: "Create modal dialog",
      command: "genext.createModal",
    },
    {
      label: "   📊 Table Component",
      description: "Create data table",
      command: "genext.createTable",
    },
    { label: "🔧 ───── CODE SNIPPETS ─────", description: "", command: "" },
    {
      label: "   🔄 Insert Map",
      description: "Add .map() loop",
      command: "genext.insertMap",
    },
    {
      label: "   🔽 Insert Filter",
      description: "Add .filter()",
      command: "genext.insertFilter",
    },
    {
      label: "   🔍 Insert Find",
      description: "Add .find()",
      command: "genext.insertFind",
    },
    {
      label: "   🔄 Insert ForEach",
      description: "Add .forEach()",
      command: "genext.insertForEach",
    },
    {
      label: "   📊 Insert Reduce",
      description: "Add .reduce()",
      command: "genext.insertReduce",
    },
    {
      label: "   📋 Insert Sort",
      description: "Add .sort()",
      command: "genext.insertSort",
    },
    {
      label: "   ✅ Insert Some/Every",
      description: "Add .some()/.every()",
      command: "genext.insertSome",
    },
    {
      label: "   📦 Insert useState",
      description: "Add useState hook",
      command: "genext.insertUseState",
    },
    {
      label: "   🔄 Insert useEffect",
      description: "Add useEffect hook",
      command: "genext.insertUseEffect",
    },
    {
      label: "   💾 Insert useCallback",
      description: "Add useCallback",
      command: "genext.insertUseCallback",
    },
    {
      label: "   🧠 Insert useMemo",
      description: "Add useMemo",
      command: "genext.insertUseMemo",
    },
    {
      label: "   🎯 Insert useRef",
      description: "Add useRef",
      command: "genext.insertUseRef",
    },
    {
      label: "   🌍 Insert useContext",
      description: "Add useContext",
      command: "genext.insertUseContext",
    },
    {
      label: "   🔧 Insert useReducer",
      description: "Add useReducer",
      command: "genext.insertUseReducer",
    },
    {
      label: "   📤 Insert Submit Handler",
      description: "Add form submit",
      command: "genext.insertSubmitHandler",
    },
    {
      label: "   ✏️ Insert Change Handler",
      description: "Add input change",
      command: "genext.insertChangeHandler",
    },
    {
      label: "   ✅ Insert Validation",
      description: "Add form validation",
      command: "genext.insertFormValidation",
    },
    {
      label: "   🔄 Insert Reset Handler",
      description: "Add form reset",
      command: "genext.insertResetHandler",
    },
    {
      label: "   📥 Insert Fetch GET",
      description: "Add GET request",
      command: "genext.insertFetchGet",
    },
    {
      label: "   📤 Insert Fetch POST",
      description: "Add POST request",
      command: "genext.insertFetchPost",
    },
    {
      label: "   📝 Insert Fetch PUT",
      description: "Add PUT request",
      command: "genext.insertFetchPut",
    },
    {
      label: "   🗑️ Insert Fetch DELETE",
      description: "Add DELETE request",
      command: "genext.insertFetchDelete",
    },
    {
      label: "   🔒 Insert Try/Catch",
      description: "Add error handling",
      command: "genext.insertTryCatch",
    },
    {
      label: "   ⏳ Insert Loading",
      description: "Add loading skeleton",
      command: "genext.insertLoadingSkeleton",
    },
    {
      label: "   ⚠️ Insert Error Boundary",
      description: "Add error display",
      command: "genext.insertErrorBoundary",
    },
    {
      label: "   🔀 Insert Conditional",
      description: "Add conditional render",
      command: "genext.insertConditionalRender",
    },
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "🎯 GeNext - What do you want to do?",
    matchOnDescription: true,
  });
  if (selected && selected.command) {
    vscode.commands.executeCommand(selected.command);
  }
}

// ==================== DEEPSEEK AI HELPER ====================
async function getDeepSeekClient(): Promise<DeepSeekClient | null> {
  const config = vscode.workspace.getConfiguration("genext");
  let apiKey = config.get<string>("deepseekApiKey");

  if (!apiKey) {
    const setKey = await vscode.window.showWarningMessage(
      "🤖 DeepSeek API key required for AI features. Configure now?",
      "Configure",
      "Cancel",
    );
    if (setKey === "Configure") {
      await vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "genext.deepseekApiKey",
      );
      apiKey = config.get<string>("deepseekApiKey");
      if (!apiKey) return null;
    } else {
      return null;
    }
  }

  if (!deepseekClient) {
    deepseekClient = new DeepSeekClient(apiKey);
  }
  return deepseekClient;
}

// ==================== PART A: FILE GENERATORS ====================

// 1. PROJECT INITIALIZER
async function initProjectHandler() {
  try {
    const projectName = await vscode.window.showInputBox({
      prompt: "Project name",
      placeHolder: "my-nextjs-app",
      validateInput: (value) => {
        if (!value) return "Project name required";
        if (!/^[a-z][a-z0-9-]*$/.test(value))
          return "Use lowercase letters, numbers, and hyphens";
        return null;
      },
    });
    if (!projectName) return;

    const defaultPath =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
    const selectedUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      defaultUri: vscode.Uri.file(defaultPath),
      openLabel: "Select Location",
    });

    const projectPath = selectedUri
      ? path.join(selectedUri[0].fsPath, projectName)
      : path.join(defaultPath, projectName);

    const router = await vscode.window.showQuickPick(
      [
        {
          label: "🚀 App Router (Next.js 13+)",
          value: "app",
          description: "Modern, recommended",
        },
        {
          label: "📄 Pages Router (Traditional)",
          value: "pages",
          description: "Classic, stable",
        },
      ],
      { placeHolder: "Select router type" },
    );
    if (!router) return;

    const styling = await vscode.window.showQuickPick(
      [
        { label: "🎨 Tailwind CSS", value: "tailwind" },
        { label: "💅 Styled Components", value: "styled-components" },
        { label: "📦 CSS Modules", value: "css-modules" },
        { label: "🚫 None", value: "none" },
      ],
      { placeHolder: "Select styling solution" },
    );
    if (!styling) return;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Creating Next.js project...",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: "Creating folders...", increment: 15 });

        if (router.value === "app") {
          await fs.ensureDir(path.join(projectPath, "src", "app"));
          await fs.ensureDir(path.join(projectPath, "src", "components"));
          await fs.ensureDir(path.join(projectPath, "src", "hooks"));
          await fs.ensureDir(path.join(projectPath, "src", "utils"));
          await fs.ensureDir(path.join(projectPath, "src", "lib"));
          await fs.ensureDir(path.join(projectPath, "src", "styles"));
          await fs.ensureDir(path.join(projectPath, "public", "images"));
        } else {
          await fs.ensureDir(path.join(projectPath, "src", "pages"));
          await fs.ensureDir(path.join(projectPath, "src", "pages", "api"));
          await fs.ensureDir(path.join(projectPath, "src", "components"));
          await fs.ensureDir(path.join(projectPath, "src", "hooks"));
          await fs.ensureDir(path.join(projectPath, "src", "utils"));
          await fs.ensureDir(path.join(projectPath, "src", "styles"));
          await fs.ensureDir(path.join(projectPath, "public", "images"));
        }

        progress.report({
          message: "Creating configuration files...",
          increment: 25,
        });

        const dependencies: Record<string, string> = {
          next: "latest",
          react: "latest",
          "react-dom": "latest",
        };
        const devDependencies: Record<string, string> = {
          "@types/node": "latest",
          "@types/react": "latest",
          "@types/react-dom": "latest",
          typescript: "latest",
        };

        if (styling.value === "tailwind") {
          devDependencies["tailwindcss"] = "latest";
          devDependencies["postcss"] = "latest";
          devDependencies["autoprefixer"] = "latest";
        }
        if (styling.value === "styled-components") {
          dependencies["styled-components"] = "latest";
          devDependencies["@types/styled-components"] = "latest";
        }

        await fs.writeFile(
          path.join(projectPath, "package.json"),
          JSON.stringify(
            {
              name: projectName,
              version: "0.1.0",
              private: true,
              scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint",
              },
              dependencies,
              devDependencies,
            },
            null,
            2,
          ),
        );

        await fs.writeFile(
          path.join(projectPath, "tsconfig.json"),
          JSON.stringify(
            {
              compilerOptions: {
                target: "ES2017",
                lib: ["dom", "dom.iterable", "esnext"],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                noEmit: true,
                esModuleInterop: true,
                module: "esnext",
                moduleResolution: "bundler",
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: "react-jsx",
                incremental: true,
                baseUrl: ".",
                paths: { "@/*": ["./src/*"] },
              },
              include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
              exclude: ["node_modules"],
            },
            null,
            2,
          ),
        );

        await fs.writeFile(
          path.join(projectPath, "next.config.js"),
          `/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true }\nmodule.exports = nextConfig`,
        );
        await fs.writeFile(
          path.join(projectPath, ".env.local.example"),
          `# Next.js\nNEXT_PUBLIC_API_URL=http://localhost:3000/api\n`,
        );
        await fs.writeFile(
          path.join(projectPath, ".gitignore"),
          `node_modules\n.next\nout\n.env*.local\n.DS_Store`,
        );

        progress.report({ message: "Creating page files...", increment: 25 });

        if (styling.value === "tailwind") {
          const cssCode = `@tailwind base;\n@tailwind components;\n@tailwind utilities;`;
          if (router.value === "app")
            await fs.writeFile(
              path.join(projectPath, "src", "app", "globals.css"),
              cssCode,
            );
          else
            await fs.writeFile(
              path.join(projectPath, "src", "styles", "globals.css"),
              cssCode,
            );

          await fs.writeFile(
            path.join(projectPath, "tailwind.config.js"),
            `module.exports = { content: ['./src/**/*.{js,ts,jsx,tsx}'], theme: { extend: {} }, plugins: [] }`,
          );
          await fs.writeFile(
            path.join(projectPath, "postcss.config.js"),
            `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`,
          );
        }

        if (router.value === "app") {
          await fs.writeFile(
            path.join(projectPath, "src", "app", "layout.tsx"),
            `export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html> }`,
          );
          await fs.writeFile(
            path.join(projectPath, "src", "app", "page.tsx"),
            `export default function Home() { return <main className="p-8"><h1 className="text-2xl">Welcome to ${projectName}</h1></main> }`,
          );
        } else {
          await fs.writeFile(
            path.join(projectPath, "src", "pages", "_app.tsx"),
            `export default function App({ Component, pageProps }) { return <Component {...pageProps} /> }`,
          );
          await fs.writeFile(
            path.join(projectPath, "src", "pages", "index.tsx"),
            `export default function Home() { return <main><h1>Welcome to ${projectName}</h1></main> }`,
          );
        }

        progress.report({ message: "Initializing Git...", increment: 15 });
        try {
          await execAsync("git init", { cwd: projectPath });
          await execAsync("git add .", { cwd: projectPath });
          await execAsync('git commit -m "Initial commit from GeNext"', {
            cwd: projectPath,
          });
        } catch (e) {}

        await vscode.commands.executeCommand(
          "vscode.openFolder",
          vscode.Uri.file(projectPath),
        );
      },
    );
    vscode.window.showInformationMessage(`✅ Project ${projectName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 2. REACT COMPONENT GENERATOR - ARROW FUNCTION
const createReactComponent = async (uri?: vscode.Uri) => {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name (PascalCase)",
      placeHolder: "UserProfile",
      validateInput: validateComponentName,
    });
    if (!componentName) return;

    const hasProps = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Accept props?",
    });
    const hasState = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Need state?",
    });
    const hasEffects = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Need useEffect?",
    });
    const styling = await vscode.window.showQuickPick(
      ["Tailwind CSS", "Styled Components", "CSS Modules", "None"],
      { placeHolder: "Styling?" },
    );

    const imports = [
      `import React${hasState === "Yes" || hasEffects === "Yes" ? ", { useState, useEffect }" : ""} from 'react';`,
    ];
    if (styling === "Styled Components")
      imports.push("import styled from 'styled-components';");

    const propsInterface =
      hasProps === "Yes"
        ? `\ninterface ${componentName}Props {\n  className?: string;\n  children?: React.ReactNode;\n}\n`
        : "";
    const propsParam =
      hasProps === "Yes"
        ? `({ className, children }: ${componentName}Props)`
        : "()";
    const stateCode =
      hasState === "Yes"
        ? `\n  const [loading, setLoading] = useState(false);\n  const [data, setData] = useState<any>(null);`
        : "";
    const effectCode =
      hasEffects === "Yes"
        ? `\n  useEffect(() => {\n    console.log('${componentName} mounted');\n    return () => console.log('${componentName} unmounted');\n  }, []);`
        : "";

    let componentCode = `${imports.join("\n")}${propsInterface}\nconst ${componentName} = ${propsParam} => {${stateCode}${effectCode}\n  return (\n    <div className="${styling === "Tailwind CSS" ? "container mx-auto p-4" : "container"}">\n      <h1>${componentName} Component</h1>\n      ${hasProps === "Yes" ? "{children}" : ""}\n    </div>\n  );\n};\n\nexport default ${componentName};`;

    if (styling === "Styled Components") {
      componentCode = `${imports.join("\n")}\nconst Container = styled.div\`\n  padding: 20px;\n  background: #f5f5f5;\n  border-radius: 8px;\n\`;\n${propsInterface}\nconst ${componentName} = ${propsParam} => {${stateCode}${effectCode}\n  return (\n    <Container>\n      <h1>${componentName} Component</h1>\n      {children}\n    </Container>\n  );\n};\n\nexport default ${componentName};`;
    }

    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(
      path.join(componentsDir, `${componentName}.tsx`),
      componentCode,
    );
    const doc = await vscode.workspace.openTextDocument(
      path.join(componentsDir, `${componentName}.tsx`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(
      `✅ Component ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
};

// 3. API ROUTE GENERATOR - ENHANCED WITH PRISMA PLACEHOLDERS
async function createApiRouteHandler(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const routerType = await detectRouterType(targetDir);

    let apiDir =
      routerType === "app"
        ? path.join(targetDir, "src", "app", "api")
        : path.join(targetDir, "src", "pages", "api");
    if (!(await fs.pathExists(apiDir))) await fs.ensureDir(apiDir);

    const routeName = await vscode.window.showInputBox({
      prompt: "Route name (e.g., users, posts, products)",
      placeHolder: "users, posts, products",
    });
    if (!routeName) return;

    const methods = await vscode.window.showQuickPick(
      ["GET", "POST", "PUT", "DELETE"],
      { canPickMany: true, placeHolder: "Select HTTP methods" },
    );
    if (!methods || methods.length === 0) return;

    // Generate enhanced Prisma-first code
    const code = generatePrismaApiRouteCode(routeName, methods);

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
      `✅ API Route ${routeName} created! Replace the 🔴 placeholders with your actual Prisma model name and fields.`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// ENHANCED: Prisma-First API Route Code Generator with clear placeholders
function generatePrismaApiRouteCode(
  routeName: string,
  methods: string[],
): string {
  const modelName =
    routeName.charAt(0).toUpperCase() +
    routeName.slice(1).replace(/[\[\]]/g, "");
  const singular = routeName.endsWith("s") ? routeName.slice(0, -1) : routeName;
  const prismaModel = singular.toLowerCase();

  return `// ============================================
// 🚨 PRISMA API ROUTE - Replace placeholders marked with 🔴
// 📝 Model: ${modelName}
// 🔴 Replace "${prismaModel}" with your actual Prisma model name
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // 🔴 Update this path to your prisma client

// ============================================
// 🌐 API HANDLERS
// ============================================

${
  methods.includes("GET")
    ? `
// GET /api/${routeName}
// 📝 Fetches ${routeName} with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // 🔴🔴🔴 REPLACE "${prismaModel}" with your actual Prisma model name 🔴🔴🔴
    // Example: if your model is "User", change to: prisma.user.findMany()
    
    const [data, total] = await Promise.all([
      prisma.${prismaModel}.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        orderBy: { createdAt: 'desc' },
        // 🔴 Add include for relations if needed:
        // include: {
        //   posts: true,
        //   profile: true
        // }
      }),
      prisma.${prismaModel}.count({
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {}
      })
    ]);
    
    return NextResponse.json({ 
      success: true, 
      data,
      pagination: { 
        page, 
        limit, 
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/${routeName}:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ${routeName}' },
      { status: 500 }
    );
  }
}
`
    : ""
}

${
  methods.includes("POST")
    ? `
// POST /api/${routeName}
// 📝 Creates a new ${singular}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔴🔴🔴 REPLACE with your actual Prisma create 🔴🔴🔴
    // Example:
    // const newItem = await prisma.${prismaModel}.create({
    //   data: {
    //     name: body.name,
    //     email: body.email,
    //     // ... other fields from your schema
    //   }
    // });
    
    // ⚠️ PLACEHOLDER - DELETE THIS and uncomment the Prisma code above
    const newItem = { id: Date.now(), ...body, createdAt: new Date(), updatedAt: new Date() };
    
    return NextResponse.json({ 
      success: true, 
      data: newItem,
      message: '${singular} created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/${routeName}:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ${singular}' },
      { status: 500 }
    );
  }
}
`
    : ""
}

${
  methods.includes("PUT")
    ? `
// PUT /api/${routeName}/[id]
// 📝 Updates an existing ${singular}
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // 🔴🔴🔴 REPLACE with your actual Prisma update 🔴🔴🔴
    // Example:
    // const updated = await prisma.${prismaModel}.update({
    //   where: { id: parseInt(id) },
    //   data: {
    //     name: body.name,
    //     email: body.email,
    //     updatedAt: new Date()
    //   }
    // });
    
    // ⚠️ PLACEHOLDER - DELETE THIS and uncomment the Prisma code above
    const updated = { id: parseInt(id), ...body, updatedAt: new Date() };
    
    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: '${singular} updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/${routeName}:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ${singular}' },
      { status: 500 }
    );
  }
}
`
    : ""
}

${
  methods.includes("DELETE")
    ? `
// DELETE /api/${routeName}/[id]
// 📝 Deletes an existing ${singular}
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // 🔴🔴🔴 REPLACE with your actual Prisma delete 🔴🔴🔴
    // Example:
    // await prisma.${prismaModel}.delete({ where: { id: parseInt(id) } });
    
    // ⚠️ PLACEHOLDER - DELETE THIS and uncomment the Prisma code above
    
    return NextResponse.json({ 
      success: true, 
      message: '${singular} deleted successfully',
      deletedId: parseInt(id)
    });
  } catch (error) {
    console.error('Error in DELETE /api/${routeName}:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ${singular}' },
      { status: 500 }
    );
  }
}
`
    : ""
}
`;
}

// 4. CUSTOM HOOK GENERATOR
async function createCustomHook(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const hookName = await vscode.window.showInputBox({
      prompt: "Hook name (useXxx)",
      placeHolder: "useAuth, useLocalStorage",
      validateInput: validateHookName,
    });
    if (!hookName) return;

    const hasState = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Need state?",
    });
    const code = `import { ${hasState === "Yes" ? "useState, useCallback" : "useCallback"} } from 'react';\n\nconst ${hookName} = () => {\n${hasState === "Yes" ? `  const [data, setData] = useState<any>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<Error | null>(null);\n` : ""}\n  const doSomething = useCallback(() => {\n    console.log('${hookName} called');\n  }, []);\n\n  return { ${hasState === "Yes" ? "data, loading, error," : ""} doSomething };\n};\n\nexport default ${hookName};`;

    const hooksDir = path.join(targetDir, "src", "hooks");
    await fs.ensureDir(hooksDir);
    await fs.writeFile(path.join(hooksDir, `${hookName}.ts`), code);
    const doc = await vscode.workspace.openTextDocument(
      path.join(hooksDir, `${hookName}.ts`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`✅ Hook ${hookName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 5. UTILITY FUNCTION GENERATOR
async function createUtilityFunction(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const utilName = await vscode.window.showInputBox({
      prompt: "Utility name (camelCase)",
      placeHolder: "formatDate, validateEmail",
      validateInput: validateUtilityName,
    });
    if (!utilName) return;

    const isAsync = await vscode.window.showQuickPick(["No", "Yes"], {
      placeHolder: "Async function?",
    });
    const code = `export const ${utilName} = ${isAsync === "Yes" ? "async (input: any): Promise<any> =>" : "(input: any): any =>"} {\n  ${isAsync === "Yes" ? "try {\n    const result = await Promise.resolve(input);\n    return result;\n  } catch (error) {\n    console.error(error);\n    throw error;\n  }" : "return input;"}\n};`;

    const utilsDir = path.join(targetDir, "src", "utils");
    await fs.ensureDir(utilsDir);
    await fs.writeFile(path.join(utilsDir, `${utilName}.ts`), code);
    const doc = await vscode.workspace.openTextDocument(
      path.join(utilsDir, `${utilName}.ts`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`✅ Utility ${utilName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 6. FILTER COMPONENT GENERATOR - FIXED SYNTAX
async function createFilterComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Filter component name (PascalCase)",
      placeHolder: "ProductFilter",
      validateInput: validateComponentName,
    });
    if (!componentName) return;

    const code = `import React, { useState, useMemo, useCallback } from 'react';\n\ninterface FilterOptions {\n  search: string;\n  category: string;\n  minPrice: number;\n  maxPrice: number;\n}\n\ninterface ${componentName}Props<T = any> {\n  data: T[];\n  onFilterChange?: (filteredData: T[]) => void;\n  className?: string;\n}\n\nconst ${componentName} = <T extends any>({ data, onFilterChange, className }: ${componentName}Props<T>) => {\n  const [filters, setFilters] = useState<FilterOptions>({\n    search: '',\n    category: '',\n    minPrice: 0,\n    maxPrice: 1000,\n  });\n\n  const filteredData = useMemo(() => {\n    let result = [...data];\n    if (filters.search) {\n      result = result.filter(item => item.name?.toLowerCase().includes(filters.search.toLowerCase()));\n    }\n    if (filters.category) {\n      result = result.filter(item => item.category === filters.category);\n    }\n    result = result.filter(item => item.price >= filters.minPrice && item.price <= filters.maxPrice);\n    return result;\n  }, [data, filters]);\n\n  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {\n    setFilters(prev => ({ ...prev, search: e.target.value }));\n  }, []);\n\n  return (\n    <div className={\`filter-component \${className || ''}\`}>\n      <div className="filters-section p-4 bg-gray-50 rounded-lg">\n        <input\n          type="text"\n          placeholder="🔍 Search..."\n          value={filters.search}\n          onChange={handleSearchChange}\n          className="w-full px-3 py-2 border rounded-md"\n        />\n      </div>\n      <div className="results-section mt-4">\n        {filteredData.map((item, index) => (\n          <div key={index} className="p-4 border rounded-lg mb-2">\n            <pre>{JSON.stringify(item, null, 2)}</pre>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n};\n\nexport default ${componentName};`;

    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${componentName}.tsx`), code);
    const doc = await vscode.workspace.openTextDocument(
      path.join(componentsDir, `${componentName}.tsx`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(
      `✅ Filter component ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 7. LIST COMPONENT GENERATOR - FIXED SYNTAX
async function createListComponent(uri?: vscode.Uri) {
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

    let code = `import React, { useState } from 'react';\n\ninterface ${componentName}Props<T = any> {\n  items: T[];\n  renderItem: (item: T, index: number) => React.ReactNode;\n  className?: string;\n}\n\nconst ${componentName} = <T extends any>({ items, renderItem, className }: ${componentName}Props<T>) => {\n`;

    if (listType === "🔄 Carousel/Slider") {
      code += `  const [currentIndex, setCurrentIndex] = useState(0);\n  const next = () => setCurrentIndex((prev) => (prev + 1) % items.length);\n  const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);\n\n  if (items.length === 0) return <div>No items</div>;\n\n  return (\n    <div className="carousel relative">\n      <div className="carousel-container overflow-hidden">\n        <div className="carousel-track flex transition-transform duration-300" style={{ transform: \`translateX(-\${currentIndex * 100}%)\` }}>\n          {items.map((item, index) => (\n            <div key={index} className="carousel-slide min-w-full">{renderItem(item, index)}</div>\n          ))}\n        </div>\n      </div>\n      <button onClick={prev} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">◀</button>\n      <button onClick={next} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">▶</button>\n    </div>\n  );\n};`;
    } else if (listType === "📑 Accordion") {
      code += `  const [openIndex, setOpenIndex] = useState<number | null>(null);\n\n  if (items.length === 0) return <div>No items</div>;\n\n  return (\n    <div className="accordion-list">\n      {items.map((item, index) => (\n        <div key={index} className="accordion-item border rounded mb-2">\n          <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="accordion-header w-full text-left p-4 font-semibold bg-gray-50">\n            {item.name || \`Item \${index + 1}\`}\n          </button>\n          {openIndex === index && <div className="accordion-content p-4">{renderItem(item, index)}</div>}\n        </div>\n      ))}\n    </div>\n  );\n};`;
    } else if (listType === "📊 Grid Layout") {
      code = code.replace(
        `className?: string;`,
        `columns?: number;\n  className?: string;`,
      );
      code += `  const columns = 3;\n\n  if (items.length === 0) return <div>No items</div>;\n\n  return (\n    <div className={\`grid gap-4 \${className}\`} style={{ gridTemplateColumns: \`repeat(\${columns}, 1fr)\` }}>\n      {items.map((item, index) => (\n        <div key={index}>{renderItem(item, index)}</div>\n      ))}\n    </div>\n  );\n};`;
    } else {
      code += `  if (items.length === 0) return <div>No items</div>;\n\n  return (\n    <div className={className}>\n      {items.map((item, index) => (\n        <div key={index} className="p-3 border-b">{renderItem(item, index)}</div>\n      ))}\n    </div>\n  );\n};`;
    }

    code += `\n\nexport default ${componentName};`;

    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${componentName}.tsx`), code);
    const doc = await vscode.workspace.openTextDocument(
      path.join(componentsDir, `${componentName}.tsx`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(
      `✅ List component ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 8. DATA FETCHER COMPONENT - FIXED SYNTAX
async function createDataFetcherComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name",
      placeHolder: "UserData",
    });
    if (!componentName) return;

    const code = `import React, { useState, useEffect } from 'react';\n\ninterface ${componentName}Props { id?: string | number; }\n\nconst ${componentName}: React.FC<${componentName}Props> = ({ id }) => {\n  const [data, setData] = useState<any>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<Error | null>(null);\n\n  useEffect(() => {\n    const fetchData = async () => {\n      setLoading(true);\n      try {\n        const url = id ? \`/api/data/\${id}\` : '/api/data';\n        const response = await fetch(url);\n        const result = await response.json();\n        setData(result);\n      } catch (err) {\n        setError(err as Error);\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchData();\n  }, [id]);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error.message}</div>;\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n};\n\nexport default ${componentName};`;

    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${componentName}.tsx`), code);
    const doc = await vscode.workspace.openTextDocument(
      path.join(componentsDir, `${componentName}.tsx`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(
      `✅ Data fetcher ${componentName} created!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 9. DYNAMIC ROUTE - FIXED SYNTAX
async function createDynamicRouteFile(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const paramName = await vscode.window.showInputBox({
      prompt: "Parameter name",
      placeHolder: "id, slug, username",
      value: "id",
    });
    if (!paramName) return;

    const routerType = await detectRouterType(targetDir);
    let code = "";

    if (routerType === "app") {
      code = `import { notFound } from 'next/navigation';\n\ninterface PageProps { params: { ${paramName}: string }; }\n\nexport default async function DynamicPage({ params }: PageProps) {\n  const data = await fetchData(params.${paramName});\n  if (!data) notFound();\n  return <div><h1>Dynamic Page: {params.${paramName}}</h1><pre>{JSON.stringify(data, null, 2)}</pre></div>;\n}\n\nasync function fetchData(id: string) { const res = await fetch(\`https://api.example.com/items/\${id}\`); return res.json(); }`;
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
      code = `import { useRouter } from 'next/router';\nimport type { GetServerSideProps } from 'next';\n\ninterface PageProps { data: any; ${paramName}: string; }\n\nconst DynamicPage: React.FC<PageProps> = ({ data, ${paramName} }) => {\n  const router = useRouter();\n  if (router.isFallback) return <div>Loading...</div>;\n  return <div><h1>Dynamic Page: {${paramName}}</h1><pre>{JSON.stringify(data, null, 2)}</pre></div>;\n};\n\nexport const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {\n  const { ${paramName} } = context.params as { ${paramName}: string };\n  const response = await fetch(\`https://api.example.com/items/\${${paramName}}\`);\n  const data = await response.json();\n  return { props: { data, ${paramName} } };\n};\n\nexport default DynamicPage;`;
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

// 10. TEST FILE GENERATOR
async function createTestFile(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name to test",
      placeHolder: "UserProfile",
    });
    if (!componentName) return;

    const code = `import { render, screen } from '@testing-library/react';\nimport ${componentName} from './${componentName}';\n\ndescribe('${componentName}', () => {\n  it('renders correctly', () => {\n    render(<${componentName} />);\n    expect(screen.getByText(/${componentName}/i)).toBeInTheDocument();\n  });\n});`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.writeFile(
      path.join(componentsDir, `${componentName}.test.tsx`),
      code,
    );
    vscode.window.showInformationMessage(`✅ Test file created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 11. STORYBOOK FILE GENERATOR
async function createStorybookFile(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name for story",
      placeHolder: "Button",
    });
    if (!componentName) return;

    const code = `import type { Meta, StoryObj } from '@storybook/react';\nimport ${componentName} from './${componentName}';\n\nconst meta: Meta<typeof ${componentName}> = {\n  title: '${componentName}',\n  component: ${componentName},\n  tags: ['autodocs'],\n};\n\nexport default meta;\ntype Story = StoryObj<typeof ${componentName}>;\n\nexport const Default: Story = {};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.writeFile(
      path.join(componentsDir, `${componentName}.stories.tsx`),
      code,
    );
    vscode.window.showInformationMessage(`✅ Storybook file created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 12. CONTEXT PROVIDER GENERATOR
async function createContextProvider(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const contextName = await vscode.window.showInputBox({
      prompt: "Context name",
      placeHolder: "User",
      value: "User",
    });
    if (!contextName) return;

    const code = `import React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${contextName}ContextType { data: any; setData: (data: any) => void; }\n\nconst ${contextName}Context = createContext<${contextName}ContextType | undefined>(undefined);\n\nexport const ${contextName}Provider = ({ children }: { children: ReactNode }) => {\n  const [data, setData] = useState<any>(null);\n  return <${contextName}Context.Provider value={{ data, setData }}>{children}</${contextName}Context.Provider>;\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within ${contextName}Provider');\n  return context;\n};`;
    const contextDir = path.join(targetDir, "src", "context");
    await fs.ensureDir(contextDir);
    await fs.writeFile(
      path.join(contextDir, `${contextName}Context.tsx`),
      code,
    );
    vscode.window.showInformationMessage(`✅ Context provider created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 13. FORM COMPONENT GENERATOR
async function createFormComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const formName = await vscode.window.showInputBox({
      prompt: "Form name",
      placeHolder: "LoginForm",
    });
    if (!formName) return;

    const code = `import React, { useState } from 'react';\n\ninterface ${formName}Data { email: string; password: string; }\n\nconst ${formName}: React.FC = () => {\n  const [formData, setFormData] = useState<${formName}Data>({ email: '', password: '' });\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({ ...prev, [name]: value }));\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError(null);\n    try {\n      console.log(formData);\n    } catch (err) {\n      setError(err instanceof Error ? err.message : 'An error occurred');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit} className="space-y-4">\n      <div>\n        <label className="block text-sm font-medium">Email</label>\n        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />\n      </div>\n      <div>\n        <label className="block text-sm font-medium">Password</label>\n        <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />\n      </div>\n      {error && <div className="text-red-600 text-sm">{error}</div>}\n      <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50">\n        {loading ? 'Submitting...' : 'Submit'}\n      </button>\n    </form>\n  );\n};\n\nexport default ${formName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${formName}.tsx`), code);
    vscode.window.showInformationMessage(`✅ Form component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 14. MODAL COMPONENT GENERATOR
async function createModalComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const modalName = await vscode.window.showInputBox({
      prompt: "Modal name",
      placeHolder: "ConfirmModal",
    });
    if (!modalName) return;

    const code = `import React, { useEffect } from 'react';\n\ninterface ${modalName}Props { isOpen: boolean; onClose: () => void; title?: string; children?: React.ReactNode; }\n\nconst ${modalName}: React.FC<${modalName}Props> = ({ isOpen, onClose, title, children }) => {\n  useEffect(() => {\n    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };\n    if (isOpen) document.addEventListener('keydown', handleEscape);\n    return () => document.removeEventListener('keydown', handleEscape);\n  }, [isOpen, onClose]);\n\n  if (!isOpen) return null;\n\n  return (\n    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">\n      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">\n        <div className="flex justify-between items-center p-4 border-b">\n          <h2 className="text-xl font-semibold">{title}</h2>\n          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>\n        </div>\n        <div className="p-4">{children}</div>\n        <div className="flex justify-end gap-2 p-4 border-t">\n          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>\n          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Confirm</button>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default ${modalName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${modalName}.tsx`), code);
    vscode.window.showInformationMessage(`✅ Modal component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// 15. TABLE COMPONENT GENERATOR
async function createTableComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const tableName = await vscode.window.showInputBox({
      prompt: "Table name",
      placeHolder: "DataTable",
    });
    if (!tableName) return;

    const code = `import React, { useState } from 'react';\n\ninterface Column<T = any> { key: keyof T; header: string; }\n\ninterface ${tableName}Props<T = any> { data: T[]; columns: Column<T>[]; onRowClick?: (row: T) => void; }\n\nconst ${tableName} = <T extends any>({ data, columns, onRowClick }: ${tableName}Props<T>) => {\n  const [sortField, setSortField] = useState<keyof T | null>(null);\n  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');\n\n  const sortedData = [...data];\n  if (sortField) {\n    sortedData.sort((a, b) => {\n      const aVal = a[sortField];\n      const bVal = b[sortField];\n      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;\n      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;\n      return 0;\n    });\n  }\n\n  const handleSort = (field: keyof T) => {\n    if (sortField === field) {\n      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');\n    } else {\n      setSortField(field);\n      setSortOrder('asc');\n    }\n  };\n\n  return (\n    <div className="overflow-x-auto">\n      <table className="min-w-full border-collapse border">\n        <thead>\n          <tr className="bg-gray-100">\n            {columns.map(col => (\n              <th key={String(col.key)} onClick={() => handleSort(col.key)} className="border p-2 text-left cursor-pointer hover:bg-gray-200">\n                {col.header} {sortField === col.key && (sortOrder === 'asc' ? '↑' : '↓')}\n              </th>\n            ))}\n          </tr>\n        </thead>\n        <tbody>\n          {sortedData.map((row, idx) => (\n            <tr key={idx} onClick={() => onRowClick?.(row)} className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}>\n              {columns.map(col => (\n                <td key={String(col.key)} className="border p-2">{String(row[col.key])}</td>\n              ))}\n            </tr>\n          ))}\n        </tbody>\n      </td>\n    </div>\n  );\n};\n\nexport default ${tableName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${tableName}.tsx`), code);
    vscode.window.showInformationMessage(`✅ Table component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// ==================== PART B: CODE SNIPPETS ====================

async function insertAtCursor(snippet: string, message: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  await editor.edit((editBuilder) =>
    editBuilder.insert(editor.selection.active, snippet),
  );
  vscode.window.showInformationMessage(message);
}

async function getVarName(): Promise<string> {
  return (
    (await vscode.window.showInputBox({
      prompt: "Variable name",
      placeHolder: "item, user",
    })) || "item"
  );
}

async function getTypeName(): Promise<string> {
  return (
    (await vscode.window.showInputBox({
      prompt: "Type",
      placeHolder: "string, number",
    })) || "any"
  );
}

function cap(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== ARRAY METHODS - COMPLETELY FIXED ====================

async function insertMapFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const arrayName = await vscode.window.showInputBox({
    prompt: "Array name (e.g., items, users, products)",
    placeHolder: "items",
    value: "items",
  });
  if (!arrayName) return;

  const singular = arrayName.endsWith("s") ? arrayName.slice(0, -1) : arrayName;
  const defaultElement = singular || "item";
  const elementName =
    (await vscode.window.showInputBox({
      prompt: "Element variable name",
      placeHolder: defaultElement,
      value: defaultElement,
    })) || "item";

  const mapSnippet = `${arrayName}.map((${elementName}, index) => (
  <div key={index}>
    {/* Your JSX for ${elementName} */}
  </div>
))`;

  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line).text;
  const textBeforeCursor = line.substring(0, position.character);
  const lastOpenBrace = textBeforeCursor.lastIndexOf("{");
  const lastCloseBrace = textBeforeCursor.lastIndexOf("}");

  const finalSnippet =
    lastOpenBrace <= lastCloseBrace ? `{${mapSnippet}}` : mapSnippet;

  await editor.edit((editBuilder) =>
    editBuilder.insert(position, finalSnippet),
  );
  vscode.window.showInformationMessage("✅ Map inserted!");
}

async function insertFilterFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const arrayName = await vscode.window.showInputBox({
    prompt: "Array name (e.g., items, users, products)",
    placeHolder: "items",
    value: "items",
  });
  if (!arrayName) return;

  const singular = arrayName.endsWith("s") ? arrayName.slice(0, -1) : arrayName;
  const elementName =
    (await vscode.window.showInputBox({
      prompt: "Element variable name",
      placeHolder: singular || "item",
      value: singular || "item",
    })) || "item";

  const condition =
    (await vscode.window.showInputBox({
      prompt: "Filter condition",
      placeHolder: `${elementName}.isActive`,
      value: `${elementName}.isActive`,
    })) || `${elementName}.isActive`;

  const filterSnippet = `${arrayName}.filter(${elementName} => ${condition})`;

  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line).text;
  const textBeforeCursor = line.substring(0, position.character);
  const lastOpenBrace = textBeforeCursor.lastIndexOf("{");
  const lastCloseBrace = textBeforeCursor.lastIndexOf("}");

  let finalSnippet = filterSnippet;
  if (
    lastOpenBrace <= lastCloseBrace &&
    !textBeforeCursor.trim().endsWith("{")
  ) {
    finalSnippet = `{${filterSnippet}}`;
  }

  await editor.edit((editBuilder) =>
    editBuilder.insert(position, finalSnippet),
  );
  vscode.window.showInformationMessage("✅ Filter inserted!");
}

async function insertFindFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const arrayName = await vscode.window.showInputBox({
    prompt: "Array name (e.g., items, users, products)",
    placeHolder: "items",
    value: "items",
  });
  if (!arrayName) return;

  const singular = arrayName.endsWith("s") ? arrayName.slice(0, -1) : arrayName;
  const elementName =
    (await vscode.window.showInputBox({
      prompt: "Element variable name",
      placeHolder: singular || "item",
      value: singular || "item",
    })) || "item";

  const condition =
    (await vscode.window.showInputBox({
      prompt: "Find condition",
      placeHolder: `${elementName}.id === id`,
      value: `${elementName}.id === id`,
    })) || `${elementName}.id === id`;

  const findSnippet = `${arrayName}.find(${elementName} => ${condition})`;

  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line).text;
  const textBeforeCursor = line.substring(0, position.character);
  const lastOpenBrace = textBeforeCursor.lastIndexOf("{");
  const lastCloseBrace = textBeforeCursor.lastIndexOf("}");

  let finalSnippet = findSnippet;
  if (
    lastOpenBrace <= lastCloseBrace &&
    !textBeforeCursor.trim().endsWith("{")
  ) {
    finalSnippet = `{${findSnippet}}`;
  }

  await editor.edit((editBuilder) =>
    editBuilder.insert(position, finalSnippet),
  );
  vscode.window.showInformationMessage("✅ Find inserted!");
}

async function insertForEachFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const arrayName = await vscode.window.showInputBox({
    prompt: "Array name (e.g., items, users, products)",
    placeHolder: "items",
    value: "items",
  });
  if (!arrayName) return;

  const singular = arrayName.endsWith("s") ? arrayName.slice(0, -1) : arrayName;
  const elementName =
    (await vscode.window.showInputBox({
      prompt: "Element variable name",
      placeHolder: singular || "item",
      value: singular || "item",
    })) || "item";

  const forEachSnippet = `${arrayName}.forEach(${elementName} => {
  console.log(${elementName});
});`;

  await editor.edit((editBuilder) =>
    editBuilder.insert(editor.selection.active, forEachSnippet),
  );
  vscode.window.showInformationMessage("✅ ForEach inserted!");
}

async function insertReduceFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const arrayName = await vscode.window.showInputBox({
    prompt: "Array name (e.g., numbers, items, prices)",
    placeHolder: "numbers",
    value: "numbers",
  });
  if (!arrayName) return;

  const singular = arrayName.endsWith("s") ? arrayName.slice(0, -1) : arrayName;
  const elementName =
    (await vscode.window.showInputBox({
      prompt: "Element variable name",
      placeHolder: singular || "num",
      value: singular || "num",
    })) || "num";

  const reduceSnippet = `${arrayName}.reduce((acc, ${elementName}) => acc + ${elementName}.value, 0)`;

  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line).text;
  const textBeforeCursor = line.substring(0, position.character);
  const lastOpenBrace = textBeforeCursor.lastIndexOf("{");
  const lastCloseBrace = textBeforeCursor.lastIndexOf("}");

  let finalSnippet = reduceSnippet;
  if (
    lastOpenBrace <= lastCloseBrace &&
    !textBeforeCursor.trim().endsWith("{")
  ) {
    finalSnippet = `{${reduceSnippet}}`;
  }

  await editor.edit((editBuilder) =>
    editBuilder.insert(position, finalSnippet),
  );
  vscode.window.showInformationMessage("✅ Reduce inserted!");
}

async function insertSortFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const arrayName = await vscode.window.showInputBox({
    prompt: "Array name (optional - leave empty to sort existing array)",
    placeHolder: "items (optional)",
    value: "",
  });

  let sortSnippet = "";
  if (arrayName && arrayName.trim() !== "") {
    sortSnippet = `${arrayName}.sort((a, b) => a.name.localeCompare(b.name))`;
  } else {
    sortSnippet = `.sort((a, b) => a.name.localeCompare(b.name))`;
  }

  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line).text;
  const textBeforeCursor = line.substring(0, position.character);
  const lastOpenBrace = textBeforeCursor.lastIndexOf("{");
  const lastCloseBrace = textBeforeCursor.lastIndexOf("}");

  let finalSnippet = sortSnippet;
  if (
    lastOpenBrace <= lastCloseBrace &&
    !textBeforeCursor.trim().endsWith("{")
  ) {
    finalSnippet = `{${sortSnippet}}`;
  }

  await editor.edit((editBuilder) =>
    editBuilder.insert(position, finalSnippet),
  );
  vscode.window.showInformationMessage("✅ Sort inserted!");
}

async function insertSomeFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const arrayName = await vscode.window.showInputBox({
    prompt: "Array name (e.g., items, users, products)",
    placeHolder: "items",
    value: "items",
  });
  if (!arrayName) return;

  const singular = arrayName.endsWith("s") ? arrayName.slice(0, -1) : arrayName;
  const elementName =
    (await vscode.window.showInputBox({
      prompt: "Element variable name",
      placeHolder: singular || "item",
      value: singular || "item",
    })) || "item";

  const condition =
    (await vscode.window.showInputBox({
      prompt: "Condition to check",
      placeHolder: `${elementName}.isActive`,
      value: `${elementName}.isActive`,
    })) || `${elementName}.isActive`;

  const someSnippet = `${arrayName}.some(${elementName} => ${condition})`;

  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line).text;
  const textBeforeCursor = line.substring(0, position.character);
  const lastOpenBrace = textBeforeCursor.lastIndexOf("{");
  const lastCloseBrace = textBeforeCursor.lastIndexOf("}");

  let finalSnippet = someSnippet;
  if (
    lastOpenBrace <= lastCloseBrace &&
    !textBeforeCursor.trim().endsWith("{")
  ) {
    finalSnippet = `{${someSnippet}}`;
  }

  await editor.edit((editBuilder) =>
    editBuilder.insert(position, finalSnippet),
  );
  vscode.window.showInformationMessage("✅ Some/Every inserted!");
}

// React Hooks
async function insertUseStateHook() {
  const v = await getVarName();
  const t = await getTypeName();
  insertAtCursor(
    `const [${v}, set${cap(v)}] = useState<${t}>(${t === "string" ? "''" : t === "number" ? "0" : t === "boolean" ? "false" : "null"});`,
    "✅ useState inserted!",
  );
}
async function insertUseEffectHook() {
  insertAtCursor(
    `useEffect(() => {\n  // Your effect logic\n  return () => {\n    // Cleanup\n  };\n}, []);`,
    "✅ useEffect inserted!",
  );
}
async function insertUseCallbackHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v} = useCallback(() => {\n  // Your callback logic\n}, []);`,
    "✅ useCallback inserted!",
  );
}
async function insertUseMemoHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v} = useMemo(() => {\n  return // computed value;\n}, []);`,
    "✅ useMemo inserted!",
  );
}
async function insertUseRefHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v}Ref = useRef<HTMLDivElement>(null);`,
    "✅ useRef inserted!",
  );
}
async function insertUseContextHook() {
  const v = await getVarName();
  insertAtCursor(
    `const { ${v} } = useContext(${cap(v)}Context);`,
    "✅ useContext inserted!",
  );
}
async function insertUseReducerHook() {
  insertAtCursor(
    `const [state, dispatch] = useReducer(reducer, initialState);`,
    "✅ useReducer inserted!",
  );
}

// Form Handlers
async function insertSubmitHandlerFunction() {
  insertAtCursor(
    `const [loading, setLoading] = useState(false);\nconst [error, setError] = useState<string | null>(null);\n\nconst handleSubmit = async (e: React.FormEvent) => {\n  e.preventDefault();\n  setLoading(true);\n  setError(null);\n  try {\n    // Your submit logic\n  } catch (err) {\n    setError(err instanceof Error ? err.message : 'An error occurred');\n  } finally {\n    setLoading(false);\n  }\n};`,
    "✅ Submit handler inserted!",
  );
}
async function insertChangeHandlerFunction() {
  insertAtCursor(
    `const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {\n  const { name, value } = e.target;\n  setFormData(prev => ({ ...prev, [name]: value }));\n};`,
    "✅ Change handler inserted!",
  );
}
async function insertFormValidationFunction() {
  insertAtCursor(
    `const validate = () => {\n  const errors: Record<string, string> = {};\n  if (!data.name) errors.name = 'Name is required';\n  return errors;\n};`,
    "✅ Validation inserted!",
  );
}
async function insertResetHandlerFunction() {
  insertAtCursor(
    `const handleReset = () => {\n  setFormData(initialState);\n  setErrors({});\n};`,
    "✅ Reset handler inserted!",
  );
}

// Data Fetching
async function insertFetchGetFunction() {
  const v = await getVarName();
  insertAtCursor(
    `const [${v}, set${cap(v)}] = useState(null);\nconst [loading, setLoading] = useState(false);\n\nuseEffect(() => {\n  const fetchData = async () => {\n    setLoading(true);\n    try {\n      const res = await fetch('/api/${v}');\n      const data = await res.json();\n      set${cap(v)}(data);\n    } finally { setLoading(false); }\n  };\n  fetchData();\n}, []);`,
    "✅ Fetch GET inserted!",
  );
}
async function insertFetchPostFunction() {
  insertAtCursor(
    `const handleSubmit = async (data: any) => {\n  const response = await fetch('/api/resource', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(data),\n  });\n  return response.json();\n};`,
    "✅ Fetch POST inserted!",
  );
}
async function insertFetchPutFunction() {
  insertAtCursor(
    `const handleUpdate = async (id: string, data: any) => {\n  const response = await fetch(\`/api/resource/\${id}\`, {\n    method: 'PUT',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(data),\n  });\n  return response.json();\n};`,
    "✅ Fetch PUT inserted!",
  );
}
async function insertFetchDeleteFunction() {
  insertAtCursor(
    `const handleDelete = async (id: string) => {\n  await fetch(\`/api/resource/\${id}\`, { method: 'DELETE' });\n};`,
    "✅ Fetch DELETE inserted!",
  );
}

// Error Handling & UI
async function insertTryCatchBlock() {
  insertAtCursor(
    `try {\n  // Your code\n} catch (error) {\n  console.error('Error:', error);\n  setError(error instanceof Error ? error.message : 'An error occurred');\n}`,
    "✅ Try/Catch inserted!",
  );
}
async function insertLoadingSkeletonComponent() {
  insertAtCursor(
    `{loading && (\n  <div className="animate-pulse space-y-4">\n    <div className="h-4 bg-gray-200 rounded w-3/4"></div>\n    <div className="h-4 bg-gray-200 rounded w-1/2"></div>\n  </div>\n)}`,
    "✅ Loading skeleton inserted!",
  );
}
async function insertErrorBoundaryComponent() {
  insertAtCursor(
    `{error && (\n  <div className="error p-4 bg-red-50 border border-red-200 rounded text-red-600">\n    <p className="font-semibold">Error: {error}</p>\n    <button onClick={() => setError(null)} className="mt-2 text-sm underline">Dismiss</button>\n  </div>\n)}`,
    "✅ Error boundary inserted!",
  );
}
async function insertConditionalRenderFunction() {
  const v = await getVarName();
  insertAtCursor(
    `{${v} && (\n  <div>\n    {/* Show when ${v} is truthy */}\n  </div>\n)}`,
    "✅ Conditional render inserted!",
  );
}

export function deactivate() {}
