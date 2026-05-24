import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";
import { promisify } from "util";
import { DeepSeekClient } from "./deepseek-client";
import { AIChatPanel } from "./chat-panel";
// Add these interfaces after your imports
interface PrismaField {
  name: string;
  type: string;
  isArray: boolean;
  isId: boolean;
  isRequired: boolean;
  isRelation: boolean;
  relationModel?: string;
  defaultValue?: string;
}

interface PrismaModel {
  name: string;
  fields: PrismaField[];
  relations: PrismaField[];
}
interface ModelQuickPickItem extends vscode.QuickPickItem {
  model: PrismaModel;
}

let deepseekClient: DeepSeekClient | null = null;
const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
  console.log("🚀 GeNext is now active!");

  // ==================== FILE GENERATORS ====================
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
  const generateTests = vscode.commands.registerCommand(
    "genext.generateTests",
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
  const createAzureFunction = vscode.commands.registerCommand(
    "genext.createAzureFunction",
    createAzureFunctionHandler,
  );
  const generatePrismaSchema = vscode.commands.registerCommand(
    "genext.generatePrismaSchema",
    generatePrismaSchemaHandler,
  );

  // ==================== CODE SNIPPETS ====================
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
  const generateSampleJson = vscode.commands.registerCommand(
    "genext.generateSampleJson",
    generateSampleJsonHandler,
  );
  const generateNextAuth = vscode.commands.registerCommand(
    "genext.generateNextAuth",
    generateNextAuthConfig,
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
      panel.webview.html = `<h1>🐛 DeepSeek Bug Report</h1><div>${bugs.replace(/\n/g, "<br>")}</div>`;
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
      panel.webview.html = `<h1>💡 DeepSeek Code Explanation</h1><pre>${selectedText.replace(/</g, "&lt;")}</pre><div>${explanation.replace(/\n/g, "<br>")}</div>`;
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

  const registerFetchingHook = vscode.commands.registerCommand(
    "genext.generateFetchingHook",
    generateFetchingHookHandler,
  );

  const registerFilterHook = vscode.commands.registerCommand(
    "genext.generateFilterHook",
    generateFilterHookHandler,
  );
  const generateRoutesFromPrismaCmd = vscode.commands.registerCommand(
    "genext.generateRoutesFromPrisma",
    generateRoutesFromPrisma,
  );

  const generateLayout = vscode.commands.registerCommand(
    "genext.generateLayout",
    generateLayoutOrPage,
  );

  const generatePage = vscode.commands.registerCommand(
    "genext.generatePage",
    generateLayoutOrPage,
  );
  const generateCheatSheetCmd = vscode.commands.registerCommand(
    "genext.generateCheatSheet",
    generateCheatSheet,
  );

  const generateInterface = vscode.commands.registerCommand(
    "genext.generateInterface",
    generateInterfaceFromData,
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
    generateTests,
    createStorybook,
    createContext,
    createForm,
    createModal,
    createTable,
    createAzureFunction,
    generatePrismaSchema,
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
    generateSampleJson,
    registerFetchingHook,
    registerFilterHook,
    generateNextAuth,
    generateRoutesFromPrismaCmd,
    generateLayout,
    generatePage,
    generateCheatSheetCmd,
    generateInterface,
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
    } else return null;
  }
  if (!deepseekClient) deepseekClient = new DeepSeekClient(apiKey);
  return deepseekClient;
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
    {
      label: "   ☁️ Azure Function",
      description: "Create Azure Function",
      command: "genext.createAzureFunction",
    },
    {
      label: "   🗄️ Prisma Schema",
      description: "Generate Prisma schema",
      command: "genext.generatePrismaSchema",
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
    { label: "📁 ───── SAMPLE DATA ─────", description: "", command: "" },
    {
      label: "   📄 Generate Sample JSON",
      description: "Create sample data for testing",
      command: "genext.generateSampleJson",
    },
    {
      label: "   🔄 Fetching Hook",
      description: "Create data fetching hook with CRUD",
      command: "genext.generateFetchingHook",
    },
    {
      label: "   🔍 Filter Hook",
      description: "Create filtering and sorting hook",
      command: "genext.generateFilterHook",
    },
    {
      label: "   🔐 NextAuth Config",
      description: "Generate authentication configuration",
      command: "genext.generateNextAuth",
    },
    {
      label: "   🚀 Generate Routes from Prisma",
      description: "Auto-create CRUD routes from your schema",
      command: "genext.generateRoutesFromPrisma",
    },
    {
      label: "   📐 Generate Layout",
      description: "Create layout wrapper component",
      command: "genext.generateLayout",
    },
    {
      label: "   📄 Generate Page",
      description: "Create new page with template",
      command: "genext.generatePage",
    },
    {
      label: "   📚 Generate Cheat Sheet",
      description: "Ready-to-use code snippets for common tasks",
      command: "genext.generateCheatSheet",
    },
    {
      label: "   🔧 Generate Interface",
      description: "Create TypeScript interface from JSON or manual input",
      command: "genext.generateInterface",
    },
  ];
  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "🎯 GeNext - What do you want to do?",
    matchOnDescription: true,
  });
  if (selected && selected.command)
    vscode.commands.executeCommand(selected.command);
}

// ==================== PROJECT INITIALIZER ====================
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

// ==================== REACT COMPONENT GENERATOR ====================
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

    // Add "use client" directive at the top
    let componentCode = `"use client";\n\n`;

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

    componentCode += `${imports.join("\n")}${propsInterface}\nconst ${componentName} = ${propsParam} => {${stateCode}${effectCode}\n  return (\n    <div className="${styling === "Tailwind CSS" ? "container mx-auto p-4" : "container"}">\n      <h1>${componentName} Component</h1>\n      ${hasProps === "Yes" ? "{children}" : ""}\n    </div>\n  );\n};\n\nexport default ${componentName};`;

    if (styling === "Styled Components") {
      componentCode = `"use client";\n\n${imports.join("\n")}\nconst Container = styled.div\`\n  padding: 20px;\n  background: #f5f5f5;\n  border-radius: 8px;\n\`;\n${propsInterface}\nconst ${componentName} = ${propsParam} => {${stateCode}${effectCode}\n  return (\n    <Container>\n      <h1>${componentName} Component</h1>\n      {children}\n    </Container>\n  );\n};\n\nexport default ${componentName};`;
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
// ==================== API ROUTE GENERATOR ====================
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

// ==================== CUSTOM HOOK GENERATOR ====================
async function createCustomHook(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const hookName = await vscode.window.showInputBox({
      prompt: "Hook name (useXxx)",
      placeHolder: "useAuth",
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

// ==================== UTILITY FUNCTION GENERATOR ====================
async function createUtilityFunction(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const utilName = await vscode.window.showInputBox({
      prompt: "Utility name (camelCase)",
      placeHolder: "formatDate",
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

// ==================== FILTER COMPONENT GENERATOR ====================
async function createFilterComponent(uri?: vscode.Uri) {
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

// ==================== LIST COMPONENT GENERATOR ====================
// ==================== LIST COMPONENT GENERATOR ====================
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

    // Ask for the item interface name
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

    code += `

export default ${componentName};`;

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

// ==================== DATA FETCHER COMPONENT ====================
async function createDataFetcherComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name",
      placeHolder: "UserData",
    });
    if (!componentName) return;
    const code = `"use client";\n\nimport React, { useState, useEffect } from 'react';\n\ninterface ${componentName}Props { id?: string | number; }\n\nconst ${componentName}: React.FC<${componentName}Props> = ({ id }) => {\n  const [data, setData] = useState<any>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<Error | null>(null);\n\n  useEffect(() => {\n    const fetchData = async () => {\n      setLoading(true);\n      try {\n        const url = id ? \`/api/data/\${id}\` : '/api/data';\n        const response = await fetch(url);\n        const result = await response.json();\n        setData(result);\n      } catch (err) { setError(err as Error); } finally { setLoading(false); }\n    };\n    fetchData();\n  }, [id]);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error.message}</div>;\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n};\n\nexport default ${componentName};`;
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

// ==================== DYNAMIC ROUTE ====================
async function createDynamicRouteFile(uri?: vscode.Uri) {
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

// ==================== TEST FILE GENERATOR ====================
async function createTestFile(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const componentName = await vscode.window.showInputBox({
      prompt: "Component name to test",
      placeHolder: "UserProfile",
    });
    if (!componentName) return;
    const code = `// 🔴 TEST FILE - Replace with your actual test data\n\nimport { render, screen } from '@testing-library/react';\nimport ${componentName} from './${componentName}';\n\ndescribe('${componentName}', () => {\n  it('renders correctly', () => {\n    render(<${componentName} />);\n    expect(screen.getByText(/${componentName}/i)).toBeInTheDocument();\n  });\n});`;
    const componentsDir = path.join(targetDir, "__tests__");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(
      path.join(componentsDir, `${componentName}.test.tsx`),
      code,
    );
    vscode.window.showInformationMessage(
      `✅ Test file created! Replace 🔴 placeholder with actual test data.`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// ==================== STORYBOOK FILE GENERATOR ====================
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

// ==================== CONTEXT PROVIDER GENERATOR ====================
async function createContextProvider(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const contextName = await vscode.window.showInputBox({
      prompt: "Context name",
      placeHolder: "User",
      value: "User",
    });
    if (!contextName) return;
    const code = `"use client";\n\nimport React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${contextName}ContextType { data: any; setData: (data: any) => void; }\n\nconst ${contextName}Context = createContext<${contextName}ContextType | undefined>(undefined);\n\nexport const ${contextName}Provider = ({ children }: { children: ReactNode }) => {\n  const [data, setData] = useState<any>(null);\n  return <${contextName}Context.Provider value={{ data, setData }}>{children}</${contextName}Context.Provider>;\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within ${contextName}Provider');\n  return context;\n};`;
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
// ==================== FORM COMPONENT GENERATOR ====================
async function createFormComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const formName = await vscode.window.showInputBox({
      prompt: "Form name",
      placeHolder: "LoginForm",
    });
    if (!formName) return;
    const code = `"use client";\n\nimport React, { useState } from 'react';\n\ninterface ${formName}Data { email: string; password: string; }\n\nconst ${formName}: React.FC = () => {\n  const [formData, setFormData] = useState<${formName}Data>({ email: '', password: '' });\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({ ...prev, [name]: value }));\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError(null);\n    try { console.log(formData); } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred'); } finally { setLoading(false); }\n  };\n\n  return (\n    <form onSubmit={handleSubmit} className="space-y-4">\n      <div><label className="block text-sm font-medium">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required /></div>\n      <div><label className="block text-sm font-medium">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required /></div>\n      {error && <div className="text-red-600 text-sm">{error}</div>}\n      <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50">\n        {loading ? 'Submitting...' : 'Submit'}\n      </button>\n    </form>\n  );\n};\n\nexport default ${formName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${formName}.tsx`), code);
    vscode.window.showInformationMessage(`✅ Form component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
// ==================== MODAL COMPONENT GENERATOR ====================
async function createModalComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const modalName = await vscode.window.showInputBox({
      prompt: "Modal name",
      placeHolder: "ConfirmModal",
    });
    if (!modalName) return;
    const code = `"use client";\n\nimport React, { useEffect } from 'react';\n\ninterface ${modalName}Props { isOpen: boolean; onClose: () => void; title?: string; children?: React.ReactNode; }\n\nconst ${modalName}: React.FC<${modalName}Props> = ({ isOpen, onClose, title, children }) => {\n  useEffect(() => {\n    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };\n    if (isOpen) document.addEventListener('keydown', handleEscape);\n    return () => document.removeEventListener('keydown', handleEscape);\n  }, [isOpen, onClose]);\n  if (!isOpen) return null;\n  return (\n    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">\n      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">\n        <div className="flex justify-between items-center p-4 border-b">\n          <h2 className="text-xl font-semibold">{title}</h2>\n          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>\n        </div>\n        <div className="p-4">{children}</div>\n        <div className="flex justify-end gap-2 p-4 border-t">\n          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>\n          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Confirm</button>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default ${modalName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${modalName}.tsx`), code);
    vscode.window.showInformationMessage(`✅ Modal component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// ==================== TABLE COMPONENT GENERATOR ====================
async function createTableComponent(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const tableName = await vscode.window.showInputBox({
      prompt: "Table name",
      placeHolder: "DataTable",
    });
    if (!tableName) return;
    const code = `"use client";\n\nimport React, { useState } from 'react';\n\ninterface Column<T = any> { key: keyof T; header: string; }\n\ninterface ${tableName}Props<T = any> { data: T[]; columns: Column<T>[]; onRowClick?: (row: T) => void; }\n\nconst ${tableName} = <T extends any>({ data, columns, onRowClick }: ${tableName}Props<T>) => {\n  const [sortField, setSortField] = useState<keyof T | null>(null);\n  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');\n\n  const sortedData = [...data];\n  if (sortField) {\n    sortedData.sort((a, b) => {\n      const aVal = a[sortField];\n      const bVal = b[sortField];\n      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;\n      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;\n      return 0;\n    });\n  }\n\n  const handleSort = (field: keyof T) => {\n    if (sortField === field) { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }\n    else { setSortField(field); setSortOrder('asc'); }\n  };\n\n  return (\n    <div className="overflow-x-auto">\n      <table className="min-w-full border-collapse border">\n        <thead><tr className="bg-gray-100">{columns.map(col => (<th key={String(col.key)} onClick={() => handleSort(col.key)} className="border p-2 text-left cursor-pointer hover:bg-gray-200">{col.header} {sortField === col.key && (sortOrder === 'asc' ? '↑' : '↓')}</th>))}<tr></thead>\n        <tbody>{sortedData.map((row, idx) => (<tr key={idx} onClick={() => onRowClick?.(row)} className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}>{columns.map(col => (<td key={String(col.key)} className="border p-2">{String(row[col.key])}</td>))}</tr>))}</tbody>\n      </table>\n    </div>\n  );\n};\n\nexport default ${tableName};`;
    const componentsDir = path.join(targetDir, "src", "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(path.join(componentsDir, `${tableName}.tsx`), code);
    vscode.window.showInformationMessage(`✅ Table component created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

// ==================== AZURE FUNCTIONS GENERATOR ====================
async function createAzureFunctionHandler(uri?: vscode.Uri) {
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

// ==================== PRISMA SCHEMA GENERATOR ====================
async function generatePrismaSchemaHandler(uri?: vscode.Uri) {
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
      schemaContent += `// ============================================
// 📚 LEARNING PLATFORM MODELS
// 🔴 Add your actual fields below
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
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  progress  Float    @default(0)
  enrolledAt DateTime @default(now())
}`;
    } else if (schemaType === "🛒 E-Commerce") {
      schemaContent += `// ============================================
// 🛒 E-COMMERCE MODELS
// 🔴 Add your actual fields below
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
    } else {
      schemaContent += `// ============================================
// 📝 YOUR MODELS GO HERE
// 🔴 Add your actual models below
// ============================================

// Example model:
// model Example {
//   id        String   @id @default(cuid())
//   name      String
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }`;
    }

    // Write the schema.prisma file
    await fs.writeFile(path.join(prismaDir, "schema.prisma"), schemaContent);

    // Create .env file if it doesn't exist
    const envPath = path.join(targetDir, ".env");
    if (!(await fs.pathExists(envPath))) {
      await fs.writeFile(
        envPath,
        `DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"\n`,
      );
    }

    // Generate the prisma.ts client file
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

    // Show success message with next steps
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

// ==================== CODE SNIPPETS (with placeholders) ====================
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
      prompt: "Array name",
      placeHolder: "items, users",
    })) || "items"
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

async function insertMapFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(
    `{${v}.map((${e}, index) => (\n  <div key={index}>\n    {/* 🔴 Replace with your JSX for ${e} */}\n  </div>\n))}`,
    "✅ Map inserted!",
  );
}
async function insertFilterFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(`${v}.filter(${e} => ${e}.isActive)`, "✅ Filter inserted!");
}
async function insertFindFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(`${v}.find(${e} => ${e}.id === id)`, "✅ Find inserted!");
}
async function insertForEachFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(
    `${v}.forEach(${e} => {\n  console.log(${e});\n})`,
    "✅ ForEach inserted!",
  );
}
async function insertReduceFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "num";
  insertAtCursor(
    `${v}.reduce((acc, ${e}) => acc + ${e}.value, 0)`,
    "✅ Reduce inserted!",
  );
}
async function insertSortFunction() {
  insertAtCursor(
    `.sort((a, b) => a.name.localeCompare(b.name))`,
    "✅ Sort inserted!",
  );
}
async function insertSomeFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(`${v}.some(${e} => ${e}.isActive)`, "✅ Some/Every inserted!");
}
async function insertUseStateHook() {
  const v = await getVarName();
  const t = await getTypeName();
  const d =
    t === "string"
      ? "''"
      : t === "number"
        ? "0"
        : t === "boolean"
          ? "false"
          : "null";
  insertAtCursor(
    `const [${v}, set${cap(v)}] = useState<${t}>(${d});`,
    "✅ useState inserted!",
  );
}
async function insertUseEffectHook() {
  insertAtCursor(
    `useEffect(() => {\n  // 🔴 Your effect logic here\n  return () => {\n    // 🔴 Cleanup here\n  };\n}, []);`,
    "✅ useEffect inserted!",
  );
}
async function insertUseCallbackHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v} = useCallback(() => {\n  // 🔴 Your callback logic here\n}, []);`,
    "✅ useCallback inserted!",
  );
}
async function insertUseMemoHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v} = useMemo(() => {\n  return // 🔴 computed value here\n}, []);`,
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
async function insertSubmitHandlerFunction() {
  insertAtCursor(
    `const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    // 🔴 Your submit logic here
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};`,
    "✅ Submit handler inserted!",
  );
}
async function insertChangeHandlerFunction() {
  insertAtCursor(
    `const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};`,
    "✅ Change handler inserted!",
  );
}
async function insertFormValidationFunction() {
  insertAtCursor(
    `const validate = () => {
  const errors: Record<string, string> = {};
  if (!data.name) errors.name = 'Name is required';
  return errors;
};`,
    "✅ Validation inserted!",
  );
}
async function insertResetHandlerFunction() {
  insertAtCursor(
    `const handleReset = () => {
  setFormData(initialState);
  setErrors({});
};`,
    "✅ Reset handler inserted!",
  );
}
async function insertFetchGetFunction() {
  const v = await getVarName();
  insertAtCursor(
    `const [${v}, set${cap(v)}] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/${v}');
      const data = await res.json();
      set${cap(v)}(data);
    } finally { setLoading(false); }
  };
  fetchData();
}, []);`,
    "✅ Fetch GET inserted!",
  );
}
async function insertFetchPostFunction() {
  insertAtCursor(
    `const handleSubmit = async (data: any) => {
  const response = await fetch('/api/resource', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};`,
    "✅ Fetch POST inserted!",
  );
}
async function insertFetchPutFunction() {
  insertAtCursor(
    `const handleUpdate = async (id: string, data: any) => {
  const response = await fetch(\`/api/resource/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};`,
    "✅ Fetch PUT inserted!",
  );
}
async function insertFetchDeleteFunction() {
  insertAtCursor(
    `const handleDelete = async (id: string) => {
  await fetch(\`/api/resource/\${id}\`, { method: 'DELETE' });
};`,
    "✅ Fetch DELETE inserted!",
  );
}
async function insertTryCatchBlock() {
  insertAtCursor(
    `try {
  // 🔴 Your code here
} catch (error) {
  console.error('Error:', error);
  setError(error instanceof Error ? error.message : 'An error occurred');
}`,
    "✅ Try/Catch inserted!",
  );
}
async function insertLoadingSkeletonComponent() {
  insertAtCursor(
    `{loading && (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
)}`,
    "✅ Loading skeleton inserted!",
  );
}
async function insertErrorBoundaryComponent() {
  insertAtCursor(
    `{error && (
  <div className="error p-4 bg-red-50 border border-red-200 rounded text-red-600">
    <p className="font-semibold">Error: {error}</p>
    <button onClick={() => setError(null)} className="mt-2 text-sm underline">Dismiss</button>
  </div>
)}`,
    "✅ Error boundary inserted!",
  );
}
async function insertConditionalRenderFunction() {
  const v = await getVarName();
  insertAtCursor(
    `{${v} && (
  <div>
    {/* 🔴 Show when ${v} is truthy */}
  </div>
)}`,
    "✅ Conditional render inserted!",
  );
}

// ==================== SAMPLE JSON GENERATOR ====================
async function generateSampleJsonHandler(uri?: vscode.Uri) {
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
      content = `{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "status": "active",
      "age": 32,
      "city": "New York",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "editor",
      "status": "active",
      "age": 28,
      "city": "Los Angeles",
      "createdAt": "2024-01-20T14:30:00Z"
    },
    {
      "id": 3,
      "name": "Bob Johnson",
      "email": "bob@example.com",
      "role": "viewer",
      "status": "inactive",
      "age": 45,
      "city": "Chicago",
      "createdAt": "2024-02-01T09:15:00Z"
    },
    {
      "id": 4,
      "name": "Alice Williams",
      "email": "alice@example.com",
      "role": "editor",
      "status": "active",
      "age": 26,
      "city": "New York",
      "createdAt": "2024-02-10T16:45:00Z"
    },
    {
      "id": 5,
      "name": "Charlie Brown",
      "email": "charlie@example.com",
      "role": "viewer",
      "status": "active",
      "age": 35,
      "city": "Miami",
      "createdAt": "2024-03-05T11:20:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}`;
    } else if (sampleType === "📦 Products Data") {
      fileName = "products.json";
      content = `{
  "products": [
    {
      "id": 101,
      "name": "Laptop Pro",
      "description": "High-performance laptop for developers",
      "price": 1299.99,
      "category": "Electronics",
      "stock": 25,
      "rating": 4.8,
      "images": ["laptop1.jpg", "laptop2.jpg"],
      "tags": ["tech", "computer", "development"]
    },
    {
      "id": 102,
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse",
      "price": 49.99,
      "category": "Accessories",
      "stock": 150,
      "rating": 4.5,
      "images": ["mouse1.jpg"],
      "tags": ["accessories", "wireless"]
    },
    {
      "id": 103,
      "name": "Mechanical Keyboard",
      "description": "RGB mechanical keyboard",
      "price": 89.99,
      "category": "Accessories",
      "stock": 75,
      "rating": 4.7,
      "images": ["keyboard1.jpg"],
      "tags": ["accessories", "keyboard"]
    },
    {
      "id": 104,
      "name": "4K Monitor",
      "description": "27-inch 4K UHD monitor",
      "price": 399.99,
      "category": "Electronics",
      "stock": 30,
      "rating": 4.9,
      "images": ["monitor1.jpg", "monitor2.jpg"],
      "tags": ["tech", "monitor"]
    },
    {
      "id": 105,
      "name": "USB-C Hub",
      "description": "7-in-1 USB-C hub",
      "price": 59.99,
      "category": "Accessories",
      "stock": 200,
      "rating": 4.3,
      "images": ["hub1.jpg"],
      "tags": ["accessories", "usb"]
    }
  ]
}`;
    } else if (sampleType === "📝 Posts Data") {
      fileName = "posts.json";
      content = `{
  "posts": [
    {
      "id": 1001,
      "title": "Getting Started with Next.js",
      "content": "Next.js is a React framework that enables server-side rendering and static site generation...",
      "author": "John Doe",
      "likes": 245,
      "comments": 42,
      "published": true,
      "tags": ["nextjs", "react", "tutorial"],
      "createdAt": "2024-03-10T08:00:00Z"
    },
    {
      "id": 1002,
      "title": "TypeScript Best Practices",
      "content": "Learn how to use TypeScript effectively in your projects with these proven patterns...",
      "author": "Jane Smith",
      "likes": 189,
      "comments": 23,
      "published": true,
      "tags": ["typescript", "best-practices"],
      "createdAt": "2024-03-12T10:30:00Z"
    },
    {
      "id": 1003,
      "title": "Understanding React Hooks",
      "content": "Deep dive into useState, useEffect, useCallback, and custom hooks...",
      "author": "Alice Williams",
      "likes": 312,
      "comments": 56,
      "published": true,
      "tags": ["react", "hooks"],
      "createdAt": "2024-03-15T14:20:00Z"
    }
  ]
}`;
    } else if (sampleType === "✅ Todos Data") {
      fileName = "todos.json";
      content = `{
  "todos": [
    { "id": 1, "task": "Complete project documentation", "completed": false, "priority": "high", "dueDate": "2024-03-25" },
    { "id": 2, "task": "Review pull requests", "completed": true, "priority": "medium", "dueDate": "2024-03-20" },
    { "id": 3, "task": "Buy groceries", "completed": false, "priority": "low", "dueDate": "2024-03-22" },
    { "id": 4, "task": "Schedule team meeting", "completed": false, "priority": "high", "dueDate": "2024-03-21" },
    { "id": 5, "task": "Update resume", "completed": true, "priority": "medium", "dueDate": "2024-03-15" }
  ]
}`;
    } else if (sampleType === "🌐 API Response (Success)") {
      fileName = "api-success.json";
      content = `{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 123,
    "name": "Sample Item",
    "createdAt": "2024-03-20T10:00:00Z"
  },
  "timestamp": "2024-03-20T10:00:00Z",
  "requestId": "req_abc123"
}`;
    } else if (sampleType === "⚠️ API Response (Error)") {
      fileName = "api-error.json";
      content = `{
  "success": false,
  "message": "Operation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Email is required" },
      { "field": "name", "message": "Name must be at least 3 characters" }
    ]
  },
  "timestamp": "2024-03-20T10:00:00Z"
}`;
    } else if (sampleType === "📊 Paginated Response") {
      fileName = "api-paginated.json";
      content = `{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" },
    { "id": 3, "name": "Item 3" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "nextPage": 2,
    "prevPage": null
  }
}`;
    } else if (sampleType === "🎨 UI Mock Data") {
      fileName = "mock-data.json";
      content = `{
  "chartData": [
    { "month": "Jan", "sales": 4000, "revenue": 2400 },
    { "month": "Feb", "sales": 3000, "revenue": 1398 },
    { "month": "Mar", "sales": 5000, "revenue": 3800 },
    { "month": "Apr", "sales": 4500, "revenue": 2900 },
    { "month": "May", "sales": 6000, "revenue": 4200 },
    { "month": "Jun", "sales": 5500, "revenue": 5100 }
  ],
  "notifications": [
    { "id": 1, "message": "New user registered", "type": "info", "read": false },
    { "id": 2, "message": "Server update completed", "type": "success", "read": true },
    { "id": 3, "message": "Payment failed", "type": "error", "read": false }
  ]
}`;
    } else {
      // Generate all sample files
      fileName = "all-samples";
      await fs.writeFile(
        path.join(samplesDir, "users.json"),
        `{"users":[{"id":1,"name":"John Doe","email":"john@example.com"}]}`,
      );
      await fs.writeFile(
        path.join(samplesDir, "products.json"),
        `{"products":[{"id":1,"name":"Laptop","price":1299.99}]}`,
      );
      await fs.writeFile(
        path.join(samplesDir, "posts.json"),
        `{"posts":[{"id":1,"title":"Sample Post","content":"Content here"}]}`,
      );
      await fs.writeFile(
        path.join(samplesDir, "api-success.json"),
        `{"success":true,"message":"Success"}`,
      );
      await fs.writeFile(
        path.join(samplesDir, "api-error.json"),
        `{"success":false,"error":"Something went wrong"}`,
      );
      vscode.window.showInformationMessage(
        `✅ All sample JSON files created in samples/ folder!`,
      );
      return;
    }

    await fs.writeFile(path.join(samplesDir, fileName), content);
    vscode.window.showInformationMessage(
      `✅ Sample JSON file created: samples/${fileName}`,
    );

    // Open the file
    const doc = await vscode.workspace.openTextDocument(
      path.join(samplesDir, fileName),
    );
    await vscode.window.showTextDocument(doc);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}
// ==================== GENERATE FETCHING HOOK HANDLER ====================
async function generateFetchingHookHandler(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const hooksDir = path.join(targetDir, "src", "hooks");
    await fs.ensureDir(hooksDir);

    const hookName = await vscode.window.showInputBox({
      prompt: "Hook name (camelCase, starting with 'use')",
      placeHolder: "useFetchingProducts",
      value: "useFetchingProducts",
      validateInput: (value) => {
        if (!value) return "Hook name is required";
        if (!/^use[A-Z]/.test(value)) return 'Hook name must start with "use"';
        return null;
      },
    });

    if (!hookName) return;

    const apiEndpoint = await vscode.window.showInputBox({
      prompt: "API endpoint URL",
      placeHolder: "https://fakestoreapi.com/products",
      value: "https://fakestoreapi.com/products",
    });

    if (!apiEndpoint) return;

    const includeCrud = await vscode.window.showQuickPick(
      ["Yes (full CRUD)", "No (just fetching)"],
      { placeHolder: "Include CRUD operations?" },
    );

    const modelName = hookName
      .replace(/^use/, "")
      .replace(/Fetching|Products|Data$/, "");
    const interfaceName = modelName || "Item";

    const hookCode = `"use client";

import { useState, useCallback, useEffect } from "react";

export interface ${interfaceName} {
  id: number;
  title?: string;
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  image?: string;
}

interface Use${interfaceName}Options {
  id?: number;
  limit?: number;
  sort?: "asc" | "desc";
  autoFetch?: boolean;
}

interface Use${interfaceName}Return {
  data: ${interfaceName} | ${interfaceName}[] | null;
  loading: boolean;
  error: string | null;
  fetchData: (options?: Use${interfaceName}Options) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  ${
    includeCrud === "Yes (full CRUD)"
      ? `
  createItem: (item: Omit<${interfaceName}, 'id'>) => Promise<${interfaceName} | null>;
  updateItem: (id: number, item: Partial<${interfaceName}>) => Promise<${interfaceName} | null>;
  deleteItem: (id: number) => Promise<boolean>;
  `
      : ""
  }
  reset: () => void;
}

const ${hookName} = (options: Use${interfaceName}Options = {}): Use${interfaceName}Return => {
  const { autoFetch = false, ...defaultOptions } = options;
  
  const [data, setData] = useState<${interfaceName} | ${interfaceName}[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (fetchOptions?: Use${interfaceName}Options) => {
    setLoading(true);
    setError(null);
    
    const { limit = 10, sort = "asc" } = fetchOptions || defaultOptions;
    
    try {
      const url = \`${apiEndpoint}?limit=\${limit}&sort=\${sort}\`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const result: ${interfaceName}[] = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [defaultOptions]);

  const fetchById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = \`${apiEndpoint}/\${id}\`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const result: ${interfaceName} = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : \`Failed to fetch item \${id}\`);
    } finally {
      setLoading(false);
    }
  }, []);

  ${
    includeCrud === "Yes (full CRUD)"
      ? `
  const createItem = useCallback(async (item: Omit<${interfaceName}, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(${apiEndpoint}, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      const result: ${interfaceName} = await response.json();
      if (Array.isArray(data)) {
        setData([...data, result]);
      } else {
        setData(result);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
      return null;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const updateItem = useCallback(async (id: number, item: Partial<${interfaceName}>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(\`${apiEndpoint}/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      const result: ${interfaceName} = await response.json();
      if (Array.isArray(data)) {
        setData(data.map(d => (d.id === id ? result : d)));
      } else {
        setData(result);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
      return null;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const deleteItem = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetch(\`${apiEndpoint}/\${id}\`, { method: 'DELETE' });
      if (Array.isArray(data)) {
        setData(data.filter(d => d.id !== id));
      } else {
        setData(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
      return false;
    } finally {
      setLoading(false);
    }
  }, [data]);
  `
      : ""
  }

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    fetchById,
    ${
      includeCrud === "Yes (full CRUD)"
        ? `
    createItem,
    updateItem,
    deleteItem,
    `
        : ""
    }
    reset,
  };
};

export default ${hookName};`;

    await fs.writeFile(path.join(hooksDir, `${hookName}.ts`), hookCode);
    const doc = await vscode.workspace.openTextDocument(
      path.join(hooksDir, `${hookName}.ts`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`✅ Hook ${hookName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating hook: ${error}`);
  }
}

// ==================== GENERATE FILTER HOOK HANDLER ====================
async function generateFilterHookHandler(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);
    const hooksDir = path.join(targetDir, "src", "hooks");
    await fs.ensureDir(hooksDir);

    const hookName = await vscode.window.showInputBox({
      prompt: "Hook name (camelCase, starting with 'use')",
      placeHolder: "useProductFilter",
      value: "useProductFilter",
      validateInput: (value) => {
        if (!value) return "Hook name is required";
        if (!/^use[A-Z]/.test(value)) return 'Hook name must start with "use"';
        return null;
      },
    });

    if (!hookName) return;

    const interfaceName = hookName.replace(/^use/, "").replace(/Filter$/, "");

    const hookCode = `"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

export interface ${interfaceName} {
  id: number;
  title: string;
  price: number;
  category: string;
  image?: string;
  rating?: { rate: number; count: number };
}

export interface FilterOptions {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy?: "price" | "title";
  sortOrder?: "asc" | "desc";
}

interface Use${interfaceName}FilterProps {
  items: ${interfaceName}[];
  initialFilters?: Partial<FilterOptions>;
  debounceMs?: number;
}

const ${hookName} = ({ items, initialFilters = {}, debounceMs = 300 }: Use${interfaceName}FilterProps) => {
  const [searchDebounce, setSearchDebounce] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    sortBy: "price",
    sortOrder: "asc",
    ...initialFilters,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }));
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchDebounce, debounceMs]);

  const categories = useMemo(() => {
    const unique = new Set(items.map(item => item.category));
    return Array.from(unique).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }

    result = result.filter(
      item => item.price >= filters.minPrice && item.price <= filters.maxPrice
    );

    if (filters.sortBy) {
      result.sort((a, b) => {
        const aVal = a[filters.sortBy!];
        const bVal = b[filters.sortBy!];
        if (aVal < bVal) return filters.sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return filters.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, filters]);

  const setSearch = useCallback((search: string) => setSearchDebounce(search), []);
  const setCategory = useCallback((category: string) => setFilters(prev => ({ ...prev, category })), []);
  const setMinPrice = useCallback((minPrice: number) => setFilters(prev => ({ ...prev, minPrice })), []);
  const setMaxPrice = useCallback((maxPrice: number) => setFilters(prev => ({ ...prev, maxPrice })), []);
  const resetFilters = useCallback(() => {
    setFilters({ search: "", category: "", minPrice: 0, maxPrice: 1000, sortBy: "price", sortOrder: "asc" });
    setSearchDebounce("");
  }, []);

  return {
    filteredItems,
    filters,
    categories,
    setSearch,
    setCategory,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  };
};

export default ${hookName};`;

    await fs.writeFile(path.join(hooksDir, `${hookName}.ts`), hookCode);
    const doc = await vscode.workspace.openTextDocument(
      path.join(hooksDir, `${hookName}.ts`),
    );
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`✅ Filter hook ${hookName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating filter hook: ${error}`);
  }
}

// ==================== GENERATE NEXTAUTH CONFIGURATION ====================
async function generateNextAuthConfig(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    // Ask which providers to include
    const providers = await vscode.window.showQuickPick(
      [
        "📧 Credentials (Email/Password)",
        "🔵 Google",
        "🐙 GitHub",
        "🟦 Facebook",
        "🔷 Microsoft",
        "🐦 Twitter",
        "🟪 Discord",
        "✅ All of the above",
      ],
      {
        canPickMany: true,
        placeHolder:
          "Select authentication providers (you can select multiple)",
      },
    );

    if (!providers || providers.length === 0) return;

    // Ask about database adapter
    const usePrisma = await vscode.window.showQuickPick(
      ["Yes (Prisma)", "No (No database adapter)"],
      { placeHolder: "Use Prisma as database adapter?" },
    );

    // Ask about email verification
    const emailVerification = await vscode.window.showQuickPick(
      ["Yes (Send email verification)", "No"],
      { placeHolder: "Enable email verification?" },
    );

    // Ask about user roles
    const includeRoles = await vscode.window.showQuickPick(
      ["Yes (Admin/User roles)", "No"],
      { placeHolder: "Include user roles (admin/user)?" },
    );

    // Create types directory
    const typesDir = path.join(targetDir, "src", "types");
    await fs.ensureDir(typesDir);

    // Create next-auth.d.ts type declaration file
    const typeDeclarationsPath = path.join(typesDir, "next-auth.d.ts");
    const typeDeclarationsContent = `// ============================================
// 🔐 NEXT-AUTH TYPE DECLARATIONS
// 📝 Generated by GeNext
// ============================================

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    ${includeRoles === "Yes (Admin/User roles)" ? `role?: "USER" | "ADMIN";` : ""}
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      ${includeRoles === "Yes (Admin/User roles)" ? `role?: "USER" | "ADMIN";` : ""}
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    ${includeRoles === "Yes (Admin/User roles)" ? `role?: "USER" | "ADMIN";` : ""}
    email?: string;
    name?: string;
  }
}`;

    await fs.writeFile(typeDeclarationsPath, typeDeclarationsContent);

    // Create lib directory
    const libDir = path.join(targetDir, "src", "lib");
    await fs.ensureDir(libDir);

    // Create auth.ts file
    const authTsPath = path.join(libDir, "auth.ts");

    // Generate the auth.ts content
    let authContent = `// ============================================
// 🔐 NEXT-AUTH CONFIGURATION
// 📝 Generated by GeNext
// ⚠️ Replace 🔴 placeholders with your actual values
// ============================================

import { NextAuthOptions } from "next-auth";
${providers.includes("📧 Credentials (Email/Password)") ? `import CredentialsProvider from "next-auth/providers/credentials";\n` : ""}
${providers.includes("🔵 Google") ? `import GoogleProvider from "next-auth/providers/google";\n` : ""}
${providers.includes("🐙 GitHub") ? `import GitHubProvider from "next-auth/providers/github";\n` : ""}
${providers.includes("🟦 Facebook") ? `import FacebookProvider from "next-auth/providers/facebook";\n` : ""}
${providers.includes("🔷 Microsoft") ? `import MicrosoftProvider from "next-auth/providers/microsoft-entra-id";\n` : ""}
${providers.includes("🐦 Twitter") ? `import TwitterProvider from "next-auth/providers/twitter";\n` : ""}
${providers.includes("🟪 Discord") ? `import DiscordProvider from "next-auth/providers/discord";\n` : ""}
${usePrisma === "Yes (Prisma)" ? `import { PrismaAdapter } from "@auth/prisma-adapter";\nimport { prisma } from "@/lib/prisma";\n` : ""}
${providers.includes("📧 Credentials (Email/Password)") ? `import bcrypt from "bcryptjs";\n` : ""}

// 🔴 Add these environment variables to your .env.local file:
// NEXTAUTH_SECRET="your-secret-key-here" (run: openssl rand -base64 32)
// NEXTAUTH_URL="http://localhost:3000"
${providers.includes("🔵 Google") ? `// GOOGLE_CLIENT_ID="your-google-client-id"\n// GOOGLE_CLIENT_SECRET="your-google-client-secret"\n` : ""}
${providers.includes("🐙 GitHub") ? `// GITHUB_CLIENT_ID="your-github-client-id"\n// GITHUB_CLIENT_SECRET="your-github-client-secret"\n` : ""}
${providers.includes("🟦 Facebook") ? `// FACEBOOK_CLIENT_ID="your-facebook-client-id"\n// FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"\n` : ""}
${providers.includes("🔷 Microsoft") ? `// MICROSOFT_CLIENT_ID="your-microsoft-client-id"\n// MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"\n// MICROSOFT_TENANT_ID="common"\n` : ""}
${providers.includes("🐦 Twitter") ? `// TWITTER_CLIENT_ID="your-twitter-client-id"\n// TWITTER_CLIENT_SECRET="your-twitter-client-secret"\n` : ""}
${providers.includes("🟪 Discord") ? `// DISCORD_CLIENT_ID="your-discord-client-id"\n// DISCORD_CLIENT_SECRET="your-discord-client-secret"\n` : ""}
${emailVerification === "Yes (Send email verification)" ? `// EMAIL_SERVER="smtp://username:password@smtp.example.com:587"\n// EMAIL_FROM="noreply@example.com"\n` : ""}

export const authOptions: NextAuthOptions = {
  ${usePrisma === "Yes (Prisma)" ? `adapter: PrismaAdapter(prisma),\n  ` : ""}
  providers: [
${
  providers.includes("🔵 Google")
    ? `    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
`
    : ""
}
${
  providers.includes("🐙 GitHub")
    ? `    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
`
    : ""
}
${
  providers.includes("🟦 Facebook")
    ? `    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
`
    : ""
}
${
  providers.includes("🔷 Microsoft")
    ? `    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
    }),
`
    : ""
}
${
  providers.includes("🐦 Twitter")
    ? `    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
`
    : ""
}
${
  providers.includes("🟪 Discord")
    ? `    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
`
    : ""
}
${
  providers.includes("📧 Credentials (Email/Password)")
    ? `    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // 🔴 REPLACE with your actual user lookup logic
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        // 🔴 Uncomment when using bcrypt
        // const isValid = await bcrypt.compare(credentials.password, user.password);
        
        // 🔴 TEMPORARY: For development only - remove in production
        const isValid = credentials.password === user.password;
        
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          ${includeRoles === "Yes (Admin/User roles)" ? `role: user.role,` : ""}
        };
      },
    }),
`
    : ""
}
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/login",      // 🔴 Customize sign-in page
    signOut: "/",          // 🔴 Customize sign-out redirect
    error: "/auth/error",  // 🔴 Customize error page
    verifyRequest: "/auth/verify-request", // 🔴 For email verification
    newUser: "/register",  // 🔴 Customize new user registration page
  },
  
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Add user ID to token
      if (user) {
        token.id = user.id;
        ${includeRoles === "Yes (Admin/User roles)" ? `token.role = user.role;` : ""}
      }
      
      // 🔴 Add custom logic here (e.g., add user role from database)
      // if (token.email) {
      //   const dbUser = await prisma.user.findUnique({
      //     where: { email: token.email },
      //   });
      //   if (dbUser) {
      //     token.role = dbUser.role;
      //   }
      // }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = token.id as string;
        ${includeRoles === "Yes (Admin/User roles)" ? `session.user.role = token.role as "USER" | "ADMIN";` : ""}
      }
      
      return session;
    },
    
    // 🔴 Optional: Redirect after sign in
    // async redirect({ url, baseUrl }) {
    //   return baseUrl;
    // },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // 🔴 Enable debug in development only
  debug: process.env.NODE_ENV === "development",
};

// 🔴 Export auth utilities
export const { handlers, signIn, signOut, auth } = {
  handlers: {
    GET: async (req: Request) => {
      // This is a placeholder - you'll need to create the actual route handler
      // in src/app/api/auth/[...nextauth]/route.ts
      return new Response("Auth endpoint", { status: 200 });
    },
    POST: async (req: Request) => {
      return new Response("Auth endpoint", { status: 200 });
    },
  },
  signIn: async (provider?: string, options?: any) => {
    throw new Error("Not implemented - use NextAuth signIn from 'next-auth/react'");
  },
  signOut: async (options?: any) => {
    throw new Error("Not implemented - use NextAuth signOut from 'next-auth/react'");
  },
  auth: async () => {
    throw new Error("Not implemented - use NextAuth auth from 'next-auth'");
  },
};`;

    await fs.writeFile(authTsPath, authContent);

    // Create the API route file for NextAuth
    const apiAuthDir = path.join(
      targetDir,
      "src",
      "app",
      "api",
      "auth",
      "[...nextauth]",
    );
    await fs.ensureDir(apiAuthDir);

    const routeTsPath = path.join(apiAuthDir, "route.ts");
    const routeContent = `// ============================================
// 🔐 NEXT-AUTH API ROUTE
// 📝 Generated by GeNext
// ============================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`;

    await fs.writeFile(routeTsPath, routeContent);

    // Create environment variables template
    const envPath = path.join(targetDir, ".env.local");
    if (!(await fs.pathExists(envPath))) {
      let envContent = `# ============================================
# 🔐 NEXT-AUTH ENVIRONMENT VARIABLES
# Generated by GeNext
# ============================================

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

`;

      if (providers.includes("🔵 Google")) {
        envContent += `# Google OAuth (https://console.cloud.google.com/apis/credentials)\n`;
        envContent += `GOOGLE_CLIENT_ID="your-google-client-id"\n`;
        envContent += `GOOGLE_CLIENT_SECRET="your-google-client-secret"\n\n`;
      }

      if (providers.includes("🐙 GitHub")) {
        envContent += `# GitHub OAuth (https://github.com/settings/developers)\n`;
        envContent += `GITHUB_CLIENT_ID="your-github-client-id"\n`;
        envContent += `GITHUB_CLIENT_SECRET="your-github-client-secret"\n\n`;
      }

      if (providers.includes("📧 Credentials (Email/Password)")) {
        envContent += `# Database Configuration (for credentials provider)\n`;
        envContent += `DATABASE_URL="postgresql://user:password@localhost:5432/dbname"\n\n`;
      }

      await fs.writeFile(envPath, envContent);
    }

    // Show success message with next steps
    const action = await vscode.window.showInformationMessage(
      `✅ NextAuth configuration generated!\n\nCreated:\n- src/types/next-auth.d.ts (Type declarations)\n- src/lib/auth.ts\n- src/app/api/auth/[...nextauth]/route.ts\n- .env.local (with placeholders)\n\nNext steps:`,
      "Install Packages",
      "Setup Database",
      "View Files",
    );

    if (action === "Install Packages") {
      const terminal = vscode.window.createTerminal("Install NextAuth");
      terminal.show();
      terminal.sendText("npm install next-auth @auth/prisma-adapter bcryptjs");
      terminal.sendText("npm install --save-dev @types/bcryptjs");
    } else if (action === "Setup Database") {
      const terminal = vscode.window.createTerminal("Setup Database");
      terminal.show();
      terminal.sendText("npx prisma generate");
      terminal.sendText("npx prisma db push");
    } else if (action === "View Files") {
      const doc = await vscode.workspace.openTextDocument(typeDeclarationsPath);
      await vscode.window.showTextDocument(doc);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error generating NextAuth config: ${error}`,
    );
  }
}
// ==================== PRISMA SCHEMA SCANNER & ROUTE GENERATOR ====================

async function generateRoutesFromPrisma(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    // Find prisma schema file
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

    // Read and parse schema
    const schemaContent = await fs.readFile(schemaPath!, "utf-8");
    const models = parsePrismaSchemaAdvanced(schemaContent);

    if (models.length === 0) {
      vscode.window.showErrorMessage("No models found in schema.prisma");
      return;
    }

    // Create quick pick items with model details - FIXED TYPING
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

    // Type guard function
    function isModelQuickPickItem(item: any): item is ModelQuickPickItem {
      return item && typeof item === "object" && "model" in item;
    }

    // Filter and map safely
    const selectedModels = selectedItems
      .filter(isModelQuickPickItem)
      .map((item) => item.model);

    if (selectedModels.length === 0) {
      vscode.window.showErrorMessage("No valid models selected");
      return;
    }
    // Ask for route options
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

    // Ask for additional features
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

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Generating API routes from Prisma schema...",
        cancellable: false,
      },
      async (progress) => {
        let generated = 0;
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
          generated++;
        }
      },
    );

    // Generate API client
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

// Generate advanced CRUD routes
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

  // Find ID field
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

  // Filter out id fields for create/update schemas
  const createFields = model.fields.filter((f) => !f.isId && !f.isRelation);
  const updateFields = model.fields.filter((f) => !f.isRelation);

  // Build proper TypeScript types
  const tsInterfaceFields = model.fields
    .map((f) => {
      let tsType = getTypeScriptType(f.type, f.isArray, f.isRequired);
      return `  ${f.name}: ${tsType};`;
    })
    .join("\n");

  let routeCode = `// ============================================
// 🚀 AUTO-GENERATED API ROUTE FOR ${modelName}
// Generated by GeNext from Prisma schema
// Generated on: ${new Date().toLocaleString()}
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

  // Add Zod validation schemas
  if (hasValidation) {
    routeCode += `// ============================================
// Validation Schemas
// ============================================

const create${modelName}Schema = z.object({
${createFields
  .map((f) => {
    let zodType = getZodType(f.type, f.isRequired);
    return `  ${f.name}: ${zodType},`;
  })
  .join("\n")}
});

const update${modelName}Schema = create${modelName}Schema.partial();

`;
  }

  // GET method
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
    
    // Fetch single record by ID
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
    
    // Build where clause for filtering
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
        ? `// Pagination
    const page = parseInt(searchParams.get('page') || '1');
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
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
    return NextResponse.json(
      { error: 'Failed to fetch ${modelVar}s' },
      { status: 500 }
    );
  }
}

`;
  }

  // POST method
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
        ? `// Validate request body
    const validationResult = create${modelName}Schema.safeParse(body);
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
    return NextResponse.json(
      { error: 'Failed to create ${modelVar}' },
      { status: 500 }
    );
  }
}

`;
  }

  // PUT method
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
        ? `// Validate request body
    const validationResult = update${modelName}Schema.safeParse(body);
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
    
    // Check if record exists
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
    return NextResponse.json(
      { error: 'Failed to update ${modelVar}' },
      { status: 500 }
    );
  }
}

`;
  }

  // DELETE method
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
    
    // Check if record exists
    const existing = await prisma.${modelVar}.findUnique({
      where: { ${idField.name}: ${idType === "number" ? `parseInt(id)` : "id"} }
    });
    
    if (!existing) {
      return NextResponse.json({ error: '${modelName} not found' }, { status: 404 });
    }
    
    await prisma.${modelVar}.delete({
      where: { ${idField.name}: ${idType === "number" ? `parseInt(id)` : "id"} }
    });
    
    return NextResponse.json({ 
      message: '${modelName} deleted successfully',
      deletedId: id 
    });
    
  } catch (error) {
    console.error('Error deleting ${modelVar}:', error);
    return NextResponse.json(
      { error: 'Failed to delete ${modelVar}' },
      { status: 500 }
    );
  }
}

`;
  }

  // Write the route file
  let filePath: string;
  if (routerType === "app") {
    filePath = path.join(routeDir, "route.ts");
  } else {
    filePath = path.join(apiBaseDir, `${modelVar}.ts`);
  }

  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, routeCode);
}

// Generate API client
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

// API Client for ${model.name}
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

// React Query hooks (optional)
export const createApiHooks = () => {
  return {
${models
  .map(
    (model) => `
    use${model.name}s: (params?: any) => {
      return ['${model.name.toLowerCase()}s', params];
    },
    use${model.name}: (id: string | number) => {
      return ['${model.name.toLowerCase()}', id];
    },`,
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
// ==================== HELPER FUNCTIONS FOR PRISMA GENERATOR ====================

function getTypeScriptType(
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
      // Check if it's a relation (another model)
      tsType = prismaType;
  }

  if (isArray) {
    tsType += "[]";
  }
  if (!isRequired && !isArray) {
    tsType += " | null";
  }

  return tsType;
}

function getZodType(prismaType: string, isRequired: boolean): string {
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

  if (!isRequired) {
    zodType = `${zodType}.optional()`;
  }

  return zodType;
}

// Make sure parsePrismaSchemaAdvanced is properly defined
function parsePrismaSchemaAdvanced(schemaContent: string): PrismaModel[] {
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

      // Parse field: name type [optional] [@attributes]
      const fieldMatch = trimmed.match(
        /^(\w+)\s+(\w+)(\[\])?(?:\s*[?]?)?(?:\s+@(\w+))?(?:\s+@relation\(([^)]*)\))?/,
      );
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const isArray = !!fieldMatch[3];
        const isId = fieldMatch[4] === "id";

        // Check if it's a relation
        const relationMatch = trimmed.match(/@relation\(["']?(\w+)["']?/);
        const isRelation = !!relationMatch;
        const relationModel = isRelation ? relationMatch[1] : undefined;

        const field: PrismaField = {
          name: fieldName,
          type: fieldType,
          isArray,
          isId,
          isRequired: !trimmed.includes("?") && !isArray,
          isRelation,
          relationModel,
          defaultValue: trimmed.match(/@default\((\w+)\)/)?.[1],
        };

        fields.push(field);
        if (isRelation) {
          relations.push(field);
        }
      }
    }

    models.push({
      name: modelName,
      fields,
      relations,
    });
  }

  return models;
}

// ==================== LAYOUT & PAGE GENERATOR ====================

async function generateLayoutOrPage(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    // Step 1: Choose type
    const type = await vscode.window.showQuickPick(
      [
        {
          label: "📐 Layout",
          description: "Wrapper component for pages",
          value: "layout",
        },
        { label: "📄 Page", description: "Full page component", value: "page" },
      ],
      { placeHolder: "What do you want to generate?" },
    );

    if (!type) return;

    // Step 2: Choose template
    let templates: { label: string; description: string; value: string }[] = [];

    if (type.value === "layout") {
      templates = [
        {
          label: "Dashboard Layout",
          description: "Sidebar + header + main content",
          value: "dashboard",
        },
        {
          label: "Auth Layout",
          description: "Centered card for auth pages",
          value: "auth",
        },
        {
          label: "Public Layout",
          description: "Marketing navigation + footer",
          value: "public",
        },
        {
          label: "Admin Layout",
          description: "Admin sidebar with role checks",
          value: "admin",
        },
        {
          label: "Empty Layout",
          description: "Minimal wrapper component",
          value: "empty",
        },
      ];
    } else {
      templates = [
        {
          label: "Landing Page",
          description: "Hero, features, CTA, testimonials",
          value: "landing",
        },
        {
          label: "Dashboard Page",
          description: "Stats cards, charts, activity",
          value: "dashboard-page",
        },
        {
          label: "List Page",
          description: "Search, filter, sort, pagination",
          value: "list",
        },
        {
          label: "Form Page",
          description: "Create/edit with validation",
          value: "form",
        },
        {
          label: "Settings Page",
          description: "Profile, password, preferences",
          value: "settings",
        },
        {
          label: "Auth Page",
          description: "Login/Register forms",
          value: "auth-page",
        },
      ];
    }

    const template = await vscode.window.showQuickPick(templates, {
      placeHolder: `Select ${type.value} template`,
    });

    if (!template) return;

    // Step 3: Enter name
    // Fix: Properly handle the input result
    let name: string = "";
    if (type.value === "page") {
      const inputName = await vscode.window.showInputBox({
        prompt: "Page name (e.g., 'about', 'dashboard', 'users')",
        placeHolder: "my-page",
        validateInput: (value) => {
          if (!value) return "Name is required";
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return "Use lowercase letters, numbers, and hyphens";
          }
          return null;
        },
      });
      if (!inputName) return;
      name = inputName;
    } else {
      name = template.label.replace(" Layout", "");
    }

    // Step 4: Choose styling
    const styling = await vscode.window.showQuickPick(
      [
        {
          label: "🎨 Tailwind CSS",
          value: "tailwind",
          description: "Most popular",
        },
        {
          label: "📦 CSS Modules",
          value: "css-modules",
          description: "Scoped CSS",
        },
        {
          label: "💅 Styled Components",
          value: "styled",
          description: "CSS-in-JS",
        },
        { label: "🚫 None", value: "none", description: "Plain CSS" },
      ],
      { placeHolder: "Choose styling solution" },
    );

    if (!styling) return;

    // Step 5: Select features
    const availableFeatures = [
      {
        label: "🔐 Authentication",
        description: "Protect route with NextAuth",
        value: "auth",
        picked: type.value === "page",
      },
      {
        label: "🌙 Dark Mode",
        description: "Add dark/light theme toggle",
        value: "darkmode",
        picked: false,
      },
      {
        label: "📱 Responsive",
        description: "Mobile-friendly design",
        value: "responsive",
        picked: true,
      },
      {
        label: "🚀 SEO Meta Tags",
        description: "Add Next.js metadata",
        value: "seo",
        picked: type.value === "page",
      },
      {
        label: "📊 Analytics",
        description: "Track page views",
        value: "analytics",
        picked: false,
      },
      {
        label: "🧹 Loading Skeleton",
        description: "Skeleton loading states",
        value: "loading",
        picked: false,
      },
      {
        label: "❌ Error Boundary",
        description: "Error handling UI",
        value: "error",
        picked: false,
      },
    ];

    const selectedFeatures = await vscode.window.showQuickPick(
      availableFeatures,
      {
        canPickMany: true,
        placeHolder: "Select additional features (toggle with space)",
      },
    );

    // Step 6: Select integrations (for pages)
    let integrations: any[] = [];
    if (
      type.value === "page" &&
      (template.value === "form" || template.value === "list")
    ) {
      const availableIntegrations = [
        {
          label: "📝 React Hook Form",
          description: "Form handling",
          value: "rhf",
          picked: template.value === "form",
        },
        {
          label: "✅ Zod Validation",
          description: "Schema validation",
          value: "zod",
          picked: template.value === "form",
        },
        {
          label: "🔄 TanStack Query",
          description: "Data fetching & caching",
          value: "tanstack",
          picked: false,
        },
      ];

      integrations =
        (await vscode.window.showQuickPick(availableIntegrations, {
          canPickMany: true,
          placeHolder: "Select integrations",
        })) || [];
    }

    // Generate the file
    let filePath: string;
    let code = "";

    if (type.value === "layout") {
      const componentName = `${name.replace(/\s/g, "")}Layout`;
      code = generateLayoutCode(
        componentName,
        template.value,
        styling.value,
        selectedFeatures || [],
      );

      const layoutsDir = path.join(targetDir, "src", "components", "layouts");
      await fs.ensureDir(layoutsDir);
      filePath = path.join(layoutsDir, `${componentName}.tsx`);
    } else {
      code = generatePageCode(
        name,
        template.value,
        styling.value,
        selectedFeatures || [],
        integrations,
      );

      const routerType = await detectRouterType(targetDir);

      if (routerType === "app") {
        const pageDir = path.join(targetDir, "src", "app", name);
        await fs.ensureDir(pageDir);

        // Also generate layout if needed
        if (
          name !== "page" &&
          !(await fs.pathExists(path.join(pageDir, "layout.tsx")))
        ) {
          const layoutCode = `export default function ${capitalizeFirstLetter(name)}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`;
          await fs.writeFile(path.join(pageDir, "layout.tsx"), layoutCode);
        }

        filePath = path.join(pageDir, "page.tsx");
      } else {
        const pagesDir = path.join(targetDir, "src", "pages");
        filePath = path.join(pagesDir, `${name}.tsx`);
      }
    }

    await fs.writeFile(filePath, code);

    // Open the generated file
    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(
      `✅ ${type.value} generated successfully!`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating layout/page: ${error}`);
  }
}

function generateLayoutCode(
  name: string,
  type: string,
  styling: string,
  features: any[],
): string {
  const hasAuth = features.some((f) => f.value === "auth");
  const hasDarkMode = features.some((f) => f.value === "darkmode");
  const hasResponsive = features.some((f) => f.value === "responsive");
  const hasSeo = features.some((f) => f.value === "seo");

  let code = `'use client';\n\n`;

  if (hasSeo) {
    code += `import { Metadata } from 'next';\n\n`;
    code += `export const metadata: Metadata = {\n`;
    code += `  title: '${name.replace(/Layout$/, "")}',\n`;
    code += `  description: '${name.replace(/Layout$/, "")} layout page',\n`;
    code += `};\n\n`;
  }

  code += `import React, { useState, useEffect } from 'react';\n`;
  code += `import Link from 'next/link';\n`;
  code += `import { usePathname } from 'next/navigation';\n\n`;

  if (hasAuth) {
    code += `import { useSession, signOut } from 'next-auth/react';\n\n`;
  }

  if (styling === "tailwind") {
    code += `// Tailwind CSS classes are used throughout\n\n`;
  } else if (styling === "css-modules") {
    code += `import styles from './${name}.module.css';\n\n`;
  } else if (styling === "styled") {
    code += `import styled from 'styled-components';\n\n`;
  }

  code += `interface ${name}Props {\n`;
  code += `  children: React.ReactNode;\n`;
  code += `}\n\n`;

  // Generate different layouts based on type
  if (type === "dashboard") {
    code += generateDashboardLayout(
      name,
      styling,
      hasAuth,
      hasDarkMode,
      hasResponsive,
    );
  } else if (type === "auth") {
    code += generateAuthLayout(name, styling);
  } else if (type === "public") {
    code += generatePublicLayout(name, styling, hasDarkMode);
  } else if (type === "admin") {
    code += generateAdminLayout(name, styling, hasAuth);
  } else {
    code += generateEmptyLayout(name, styling);
  }

  return code;
}

function generateDashboardLayout(
  name: string,
  styling: string,
  hasAuth: boolean,
  hasDarkMode: boolean,
  hasResponsive: boolean,
): string {
  return `export const ${name} = ({ children }: ${name}Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  ${hasAuth ? `const { data: session } = useSession();\n` : ""}
  ${
    hasDarkMode
      ? `const [darkMode, setDarkMode] = useState(false);\n\n  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);\n`
      : ""
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/users', label: 'Users', icon: '👥' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="${hasDarkMode ? "dark" : ""}">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 fixed top-0 right-0 left-0 z-10">
          <div className="flex items-center justify-between px-4 h-16">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ☰
            </button>
            
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900 dark:text-white">Logo</span>
            </div>
            
            <div className="flex items-center gap-4">
              ${
                hasDarkMode
                  ? `
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              `
                  : ""
              }
              ${
                hasAuth
                  ? `
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {session.user?.email}
                  </span>
                  <button 
                    onClick={() => signOut()}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-sm text-blue-600 dark:text-blue-400">
                  Login
                </Link>
              )}
              `
                  : ""
              }
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <aside className={\`
          fixed top-16 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700
          transform transition-transform duration-200 z-20
          \${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        \`}>
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={\`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                      \${pathname === item.href 
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    \`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 pt-16">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ${name};
`;
}

function generateAuthLayout(name: string, styling: string): string {
  return `export const ${name} = ({ children }: ${name}Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ${name};
`;
}

function generatePublicLayout(
  name: string,
  styling: string,
  hasDarkMode: boolean,
): string {
  return `export const ${name} = ({ children }: ${name}Props) => {
  ${hasDarkMode ? `const [darkMode, setDarkMode] = useState(false);\n` : ""}

  return (
    <div className="${hasDarkMode ? "dark" : ""}">
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Logo
              </div>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Home
                </Link>
                <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  About
                </Link>
                <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Contact
                </Link>
                ${
                  hasDarkMode
                    ? `
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                `
                    : ""
                }
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-800 mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              © 2024 Your Company. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ${name};
`;
}

function generateAdminLayout(
  name: string,
  styling: string,
  hasAuth: boolean,
): string {
  return `export const ${name} = ({ children }: ${name}Props) => {
  const pathname = usePathname();
  ${hasAuth ? `const { data: session } = useSession();\n\n  // Check if user is admin\n  if (session?.user?.role !== 'ADMIN') {\n    return <div>Access Denied</div>;\n  }\n` : ""}

  const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊', adminOnly: false },
    { href: '/admin/users', label: 'Users', icon: '👥', adminOnly: true },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️', adminOnly: true },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈', adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-4 text-xl font-bold border-b border-gray-700">
            Admin Panel
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => (
                (!item.adminOnly || (item.adminOnly && ${hasAuth ? 'session?.user?.role === "ADMIN"' : "true"})) && (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={\`
                        flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                        \${pathname === item.href 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      \`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </nav>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ${name};
`;
}

function generateEmptyLayout(name: string, styling: string): string {
  return `export const ${name} = ({ children }: ${name}Props) => {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};

export default ${name};
`;
}

function generatePageCode(
  name: string,
  type: string,
  styling: string,
  features: any[],
  integrations: any[],
): string {
  const hasAuth = features.some((f) => f.value === "auth");
  const hasSeo = features.some((f) => f.value === "seo");
  const hasAnalytics = features.some((f) => f.value === "analytics");
  const hasLoading = features.some((f) => f.value === "loading");
  const hasError = features.some((f) => f.value === "error");
  const hasDarkMode = features.some((f) => f.value === "darkmode");
  const hasRHF = integrations.some((i) => i.value === "rhf");
  const hasZod = integrations.some((i) => i.value === "zod");
  const hasTanStack = integrations.some((i) => i.value === "tanstack");

  let code = "";

  if (hasAuth) {
    code += `'use client';\n\n`;
  }

  if (hasSeo && !hasAuth) {
    code += `import { Metadata } from 'next';\n\n`;
    code += `export const metadata: Metadata = {\n`;
    code += `  title: '${capitalizeFirstLetter(name)}',\n`;
    code += `  description: '${capitalizeFirstLetter(name)} page description',\n`;
    code += `};\n\n`;
  }

  code += `import React, { useState, useEffect } from 'react';\n`;

  if (hasAuth) {
    code += `import { useSession } from 'next-auth/react';\n`;
    code += `import { redirect } from 'next/navigation';\n\n`;
  }

  if (hasRHF) {
    code += `import { useForm } from 'react-hook-form';\n`;
  }

  if (hasZod) {
    code += `import { z } from 'zod';\n`;
    code += `import { zodResolver } from '@hookform/resolvers/zod';\n\n`;
  }

  if (hasTanStack) {
    code += `import { useQuery } from '@tanstack/react-query';\n\n`;
  }

  if (hasAnalytics) {
    code += `import { useReportWebVitals } from 'next/web-vitals';\n\n`;
  }

  // Generate different page types
  if (type === "landing") {
    code += generateLandingPage(name, styling, hasAuth, hasDarkMode);
  } else if (type === "dashboard-page") {
    code += generateDashboardPage(
      name,
      styling,
      hasAuth,
      hasDarkMode,
      hasTanStack,
    );
  } else if (type === "list") {
    code += generateListPage(name, styling, hasAuth);
  } else if (type === "form") {
    code += generateFormPage(
      name,
      styling,
      hasAuth,
      hasRHF,
      hasZod,
      hasLoading,
    );
  } else if (type === "settings") {
    code += generateSettingsPage(name, styling, hasAuth);
  } else if (type === "auth-page") {
    code += generateAuthPage(name, styling);
  } else {
    code += generateBasicPage(name, styling);
  }

  return code;
}

function generateLandingPage(
  name: string,
  styling: string,
  hasAuth: boolean,
  hasDarkMode: boolean,
): string {
  return `export default function ${capitalizeFirstLetter(name)}Page() {
  return (
    <div className="${hasDarkMode ? "dark" : ""}">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to ${capitalizeFirstLetter(name)}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            The best place to build your next project with modern tools and best practices.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Get Started
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Fast', description: 'Built with performance in mind' },
              { icon: '🔒', title: 'Secure', description: 'Best security practices' },
              { icon: '📈', title: 'Scalable', description: 'Grows with your needs' },
            ].map((feature, i) => (
              <div key={i} className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of developers building amazing applications.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Start Building Now
          </button>
        </div>
      </section>
    </div>
  );
}
`;
}

function generateDashboardPage(
  name: string,
  styling: string,
  hasAuth: boolean,
  hasDarkMode: boolean,
  hasTanStack: boolean,
): string {
  return `export default function ${capitalizeFirstLetter(name)}Page() {
  ${hasAuth ? `const { data: session } = useSession();\n` : ""}
  
  // Sample stats data
  const stats = [
    { label: 'Total Users', value: '1,234', change: '+12%', icon: '👥' },
    { label: 'Revenue', value: '$12,345', change: '+8%', icon: '💰' },
    { label: 'Active Projects', value: '42', change: '+3%', icon: '📁' },
    { label: 'Conversion Rate', value: '2.4%', change: '-1%', icon: '📊' },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Signed up', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'Created project', time: '5 hours ago' },
    { id: 3, user: 'Bob Johnson', action: 'Updated settings', time: '1 day ago' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back${hasAuth ? ` \${session?.user?.name || 'User'}` : ""}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={\`text-sm font-semibold \${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }\`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {activity.user}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.action}
                </p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

// function generateListPage(
//   name: string,
//   styling: string,
//   hasAuth: boolean,
//   hasLoading: boolean,
//   hasTanStack: boolean,
// ): string {
//   const pageName = capitalizeFirstLetter(name);

//   return `export default function ${pageName}Page() {
//   const [search, setSearch] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Sample data - replace with your actual data
//   const allItems = [
//     { id: 1, name: 'Item 1', status: 'Active', createdAt: '2024-01-01' },
//     { id: 2, name: 'Item 2', status: 'Inactive', createdAt: '2024-01-02' },
//     { id: 3, name: 'Item 3', status: 'Active', createdAt: '2024-01-03' },
//   ];

//   // Filter items based on search
//   const filteredItems = allItems.filter(item =>
//     item.name.toLowerCase().includes(search.toLowerCase())
//   );

//   // Pagination
//   const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

//   return (
//     <div>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             ${pageName}
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Manage your ${name.toLowerCase()} here
//           </p>
//         </div>
//         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
//           + Create New
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-6">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full md:w-96 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
//         />
//       </div>

//       {/* Table */}
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Created At
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y dark:divide-gray-700">
//               ${
//                 hasLoading
//                   ? `{loading ? (
//                 <tr>
//                   <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
//                 </tr>
//               ) : `
//                   : ""
//               }
//               {paginatedItems.map((item) => (
//                 <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                     {item.id}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                     {item.name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={\`px-2 py-1 text-xs rounded-full \${
//                       item.status === 'Active'
//                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                         : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
//                     }\`}>
//                       {item.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                     {item.createdAt}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm">
//                     <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
//                     <button className="text-red-600 hover:text-red-800">Delete</button>
//                   </td>
//                 </tr>
//               ))}
//               ${hasLoading ? `}` : ""}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-between items-center">
//             <button
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="text-sm text-gray-600 dark:text-gray-400">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// `;
// }

function generateFormPage(
  name: string,
  styling: string,
  hasAuth: boolean,
  hasRHF: boolean,
  hasZod: boolean,
  hasLoading: boolean,
): string {
  const pageName = capitalizeFirstLetter(name);

  let code = `export default function ${pageName}Page() {
  ${hasLoading ? `const [loading, setLoading] = useState(false);\n` : ""}
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
`;

  if (hasRHF && hasZod) {
    code += `  // Form schema with Zod validation
  const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    ${hasLoading ? `setLoading(true);\n` : ""}
    setError('');
    setSuccess('');
    
    try {
      // Replace with your API call
      console.log('Form data:', data);
      // await fetch('/api/${name}', { method: 'POST', body: JSON.stringify(data) });
      
      setSuccess('Form submitted successfully!');
      reset();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      ${hasLoading ? `setLoading(false);\n` : ""}
    }
  };
`;
  } else {
    code += `  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ${hasLoading ? `setLoading(true);\n` : ""}
    setError('');
    setSuccess('');
    
    try {
      // Replace with your API call
      console.log('Form data:', formData);
      // await fetch('/api/${name}', { method: 'POST', body: JSON.stringify(formData) });
      
      setSuccess('Form submitted successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      ${hasLoading ? `setLoading(false);\n` : ""}
    }
  };
`;
  }

  code += `
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ${pageName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Please fill out the form below
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          ${
            hasRHF
              ? `
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
          `
              : `
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
          `
          }
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          ${
            hasRHF
              ? `
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
          `
              : `
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
          `
          }
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          ${
            hasRHF
              ? `
          <textarea
            rows={4}
            {...register('message')}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
          `
              : `
          <textarea
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          />
          `
          }
        </div>

        <button
          type="submit"
          ${hasLoading ? `disabled={loading}` : ""}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          ${hasLoading ? `{loading ? 'Submitting...' : 'Submit'}` : "Submit"}
        </button>
      </form>
    </div>
  );
}
`;

  return code;
}

function generateSettingsPage(
  name: string,
  styling: string,
  hasAuth: boolean,
): string {
  return `export default function ${capitalizeFirstLetter(name)}Page() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Settings' },
    { id: 'password', label: 'Change Password' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b dark:border-gray-700 mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={\`pb-2 px-1 text-sm font-medium transition-colors \${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }\`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="john@example.com"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Update Password
            </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email notifications about your account</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-gray-500">Switch between light and dark themes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function generateAuthPage(name: string, styling: string): string {
  return `'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ${capitalizeFirstLetter(name)}Page() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      // Login
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } else {
      // Register
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          // Auto-login after registration
          await signIn('credentials', { email, password, redirect: false });
          router.push('/dashboard');
        } else {
          const data = await response.json();
          setError(data.error || 'Registration failed');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={\`px-4 py-2 rounded-md text-sm font-medium transition \${
              isLogin
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }\`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={\`px-4 py-2 rounded-md text-sm font-medium transition \${
              !isLogin
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }\`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      {isLogin && (
        <div className="mt-4 text-center">
          <button
            onClick={() => signIn('google')}
            className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
`;
}

function generateBasicPage(name: string, styling: string): string {
  return `export default function ${capitalizeFirstLetter(name)}Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ${capitalizeFirstLetter(name)} Page
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome to the ${name} page. Customize this content as needed.
      </p>
    </div>
  );
}
`;
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== CHEAT SHEET GENERATOR ====================

async function generateCheatSheet(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    // Select cheat sheet topic
    const topic = await vscode.window.showQuickPick(
      [
        {
          label: "💰 Lease Calculator",
          description: "Complete lease payment calculator component",
          value: "lease",
        },
        {
          label: "📊 Data Table",
          description: "Searchable, sortable, paginated table",
          value: "datatable",
        },
        {
          label: "🔐 NextAuth Setup",
          description: "Complete authentication configuration",
          value: "nextauth",
        },
        {
          label: "🌐 API Route",
          description: "Full CRUD API route with validation",
          value: "api",
        },
        {
          label: "🎣 Custom Hooks",
          description: "Collection of useful React hooks",
          value: "hooks",
        },
        {
          label: "📝 Form with Validation",
          description: "React Hook Form + Zod example",
          value: "form",
        },
        {
          label: "☁️ Azure Function",
          description: "HTTP trigger function with error handling",
          value: "azure",
        },
        {
          label: "🧪 Testing Examples",
          description: "Unit and integration tests",
          value: "testing",
        },
        {
          label: "🎨 UI Components",
          description: "Button, Modal, Toast components",
          value: "ui",
        },
        {
          label: "📐 Layout Templates",
          description: "Dashboard, Auth, Public layouts",
          value: "layouts",
        },
      ],
      { placeHolder: "Select cheat sheet topic" },
    );

    if (!topic) return;

    // Create cheat-sheets directory
    const cheatSheetsDir = path.join(targetDir, "cheat-sheets");
    await fs.ensureDir(cheatSheetsDir);

    let content = "";
    let fileName = "";

    switch (topic.value) {
      case "lease":
        fileName = "lease-calculator.tsx";
        content = getLeaseCalculatorCheatSheet();
        break;
      case "datatable":
        fileName = "data-table.tsx";
        content = getDataTableCheatSheet();
        break;
      case "nextauth":
        fileName = "nextauth-config.ts";
        content = getNextAuthCheatSheet();
        break;
      case "api":
        fileName = "api-route.ts";
        content = getAPIRouteCheatSheet();
        break;
      case "hooks":
        fileName = "custom-hooks.ts";
        content = getHooksCheatSheet();
        break;
      case "form":
        fileName = "form-with-validation.tsx";
        content = getFormCheatSheet();
        break;
      case "azure":
        fileName = "azure-function.ts";
        content = getAzureFunctionCheatSheet();
        break;
      case "testing":
        fileName = "testing-examples.ts";
        content = getTestingCheatSheet();
        break;
      case "ui":
        fileName = "ui-components.tsx";
        content = getUIComponentsCheatSheet();
        break;
      case "layouts":
        fileName = "layouts.tsx";
        content = getLayoutsCheatSheet();
        break;
    }

    const filePath = path.join(cheatSheetsDir, fileName);
    await fs.writeFile(filePath, content);

    // Open the file
    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(
      `✅ Cheat sheet generated: ${fileName}`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating cheat sheet: ${error}`);
  }
}

// ============================================
// Cheat Sheet Content
// ============================================

function getLeaseCalculatorCheatSheet(): string {
  return `/**
 * 💰 LEASE CALCULATOR CHEAT SHEET
 * 
 * Complete lease payment calculator for finance applications
 * Use this as reference for the Northfina assessment
 */

"use client";

import React, { useState, useMemo } from 'react';

// ============================================
// Type Definitions
// ============================================

interface LeaseInput {
  principal: number;           // Amount financed
  annualRate: number;          // Annual interest rate (%)
  termMonths: number;          // Lease duration in months
  residualValue: number;       // Balloon payment at end
  processingFee: number;       // One-time fee
}

interface PaymentScheduleItem {
  paymentNumber: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
}

interface LeaseResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  totalCost: number;
  apr: number;
  schedule: PaymentScheduleItem[];
}

// ============================================
// Calculator Logic
// ============================================

function calculateLease(input: LeaseInput): LeaseResult {
  const { principal, annualRate, termMonths, residualValue, processingFee } = input;
  
  // Input validation - CRITICAL for interview!
  if (principal <= 0) throw new Error("Principal must be greater than 0");
  if (annualRate < 0) throw new Error("Interest rate cannot be negative");
  if (termMonths <= 0) throw new Error("Term must be greater than 0");
  if (residualValue < 0) throw new Error("Residual value cannot be negative");
  if (residualValue >= principal) throw new Error("Residual value must be less than principal");
  
  // Calculate monthly interest rate
  const monthlyRate = annualRate / 100 / 12;
  
  // Calculate depreciable amount
  const depreciableAmount = principal - residualValue;
  
  let monthlyPayment: number;
  const schedule: PaymentScheduleItem[] = [];
  
  if (monthlyRate === 0) {
    // Zero interest case
    monthlyPayment = depreciableAmount / termMonths;
  } else {
    // Standard amortization with residual value
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    const paymentFactor = numerator / denominator;
    monthlyPayment = (principal - residualValue / Math.pow(1 + monthlyRate, termMonths)) * paymentFactor;
  }
  
  // Add processing fee
  const adjustedMonthlyPayment = monthlyPayment + (processingFee / termMonths);
  
  // Generate amortization schedule
  let remainingBalance = principal;
  let totalInterest = 0;
  
  for (let i = 1; i <= termMonths; i++) {
    const interest = remainingBalance * monthlyRate;
    let principalPayment = monthlyPayment - interest;
    
    if (i === termMonths) {
      principalPayment = remainingBalance - residualValue;
    }
    
    remainingBalance -= principalPayment;
    totalInterest += interest;
    
    schedule.push({
      paymentNumber: i,
      payment: Math.round((adjustedMonthlyPayment) * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      remainingBalance: Math.round(Math.max(0, remainingBalance) * 100) / 100
    });
  }
  
  // Calculate APR
  const totalFinanceCharge = totalInterest + processingFee;
  const apr = (totalFinanceCharge / principal / termMonths) * 12 * 100;
  
  return {
    monthlyPayment: Math.round(adjustedMonthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayments: Math.round((adjustedMonthlyPayment * termMonths) * 100) / 100,
    totalCost: Math.round((adjustedMonthlyPayment * termMonths + residualValue) * 100) / 100,
    apr: Math.round(apr * 100) / 100,
    schedule
  };
}

// ============================================
// React Component
// ============================================

export default function LeaseCalculator() {
  const [inputs, setInputs] = useState<LeaseInput>({
    principal: 25000,
    annualRate: 5.9,
    termMonths: 48,
    residualValue: 5000,
    processingFee: 500
  });
  
  const [result, setResult] = useState<LeaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  
  // Calculate on input change
  useMemo(() => {
    try {
      const calculation = calculateLease(inputs);
      setResult(calculation);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
      setResult(null);
    }
  }, [inputs]);
  
  const handleInputChange = (field: keyof LeaseInput, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lease Calculator</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Lease Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Principal (€)</label>
              <input
                type="number"
                value={inputs.principal}
                onChange={(e) => handleInputChange('principal', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.annualRate}
                onChange={(e) => handleInputChange('annualRate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Term (months)</label>
              <input
                type="number"
                value={inputs.termMonths}
                onChange={(e) => handleInputChange('termMonths', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Residual Value (€)</label>
              <input
                type="number"
                value={inputs.residualValue}
                onChange={(e) => handleInputChange('residualValue', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Processing Fee (€)</label>
              <input
                type="number"
                value={inputs.processingFee}
                onChange={(e) => handleInputChange('processingFee', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        
        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(result.monthlyPayment)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span>{formatCurrency(result.totalInterest)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payments:</span>
                <span>{formatCurrency(result.totalPayments)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-semibold">{formatCurrency(result.totalCost)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">APR:</span>
                <span>{result.apr}%</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {showSchedule ? "Hide" : "Show"} Amortization Schedule
            </button>
          </div>
        )}
      </div>
      
      {/* Amortization Schedule */}
      {showSchedule && result && (
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Payment Schedule</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-right">Payment</th>
                  <th className="px-4 py-2 text-right">Interest</th>
                  <th className="px-4 py-2 text-right">Principal</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.schedule.map((item) => (
                  <tr key={item.paymentNumber}>
                    <td className="px-4 py-2">{item.paymentNumber}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.payment)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.interest)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.principal)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// KEY CONCEPTS FOR INTERVIEW:
// ============================================
// 
// 1. TypeScript Interfaces - Always define types
// 2. Input Validation - Check for edge cases
// 3. Error Handling - Try/catch blocks
// 4. Mathematical Accuracy - Round to 2 decimals
// 5. Component State - useState for form inputs
// 6. Memoization - useMemo for calculations
// 7. Accessibility - Proper labels and inputs
// 
// FORMULA REFERENCE:
// Monthly Payment = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
// Where: P = Principal, r = Monthly rate, n = Number of payments
`;
}

// Add other cheat sheet functions here (datatable, nextauth, etc.)

function getDataTableCheatSheet(): string {
  return `/**
 * 📊 DATA TABLE CHEAT SHEET
 * 
 * Complete searchable, sortable, paginated data table
 */

"use client";

import React, { useState, useMemo } from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  itemsPerPage = 10,
  onRowClick
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter data
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);
  
  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  return (
    <div className="w-full">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full md:w-96"
        />
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={\`px-4 py-3 text-left text-sm font-semibold \${
                    col.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }\`}
                >
                  {col.header}
                  {sortField === col.key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-2 text-sm">
                    {col.render 
                      ? col.render(item[col.key], item)
                      : String(item[col.key])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
`;
}

// Simplified versions of other cheat sheets (you can expand these)
function getNextAuthCheatSheet(): string {
  return `// NextAuth configuration - see extension's NextAuth generator for full code`;
}
function getAPIRouteCheatSheet(): string {
  return `// API Route with CRUD - see extension's API route generator`;
}
function getHooksCheatSheet(): string {
  return `// Custom hooks collection - see extension's hook generator`;
}
function getFormCheatSheet(): string {
  return `// React Hook Form + Zod - see extension's form generator`;
}
function getAzureFunctionCheatSheet(): string {
  return `// Azure Function - see extension's Azure Function generator`;
}
function getTestingCheatSheet(): string {
  return `// Testing examples - Jest/Vitest tests for components`;
}
function getUIComponentsCheatSheet(): string {
  return `// Button, Modal, Toast components - reusable UI library`;
}
function getLayoutsCheatSheet(): string {
  return `// Dashboard, Auth, Public layouts - layout templates`;
}

// ============================================
// Register the command
// ============================================

// Add to activate function:
// const generateCheatSheetCmd = vscode.commands.registerCommand(
//   "genext.generateCheatSheet",
//   generateCheatSheet
// );
// context.subscriptions.push(generateCheatSheetCmd);
// ==================== INTERFACE & PAGE GENERATOR ====================

async function generateInterfaceFromData(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    // Option 1: Paste JSON data
    // Option 2: Enter fields manually
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

    let interfaceName: string = ""; // Initialize as empty string
    let fields: { name: string; type: string; required: boolean }[] = [];

    if (inputMethod.value === "json") {
      // Get JSON data from user
      const jsonInput = await vscode.window.showInputBox({
        prompt: "Paste your JSON data or example",
        placeHolder:
          '{"id": 1, "name": "John", "amount": 25000, "status": "pending"}',
        value:
          '{\n  "id": 1,\n  "name": "John Doe",\n  "amount": 25000,\n  "status": "pending"\n}',
      });

      if (!jsonInput) return;

      // Parse JSON and infer types
      try {
        const data = JSON.parse(jsonInput);
        fields = inferTypesFromData(data);
      } catch (error) {
        vscode.window.showErrorMessage(
          "Invalid JSON. Please check your syntax.",
        );
        return;
      }

      const nameInput = await vscode.window.showInputBox({
        prompt: "Interface name (PascalCase)",
        placeHolder: "LeaseApplication",
        value: "MyData",
      });

      if (!nameInput) return;
      interfaceName = nameInput;
    } else if (inputMethod.value === "manual") {
      // Manual field entry
      const nameInput = await vscode.window.showInputBox({
        prompt: "Interface name (PascalCase)",
        placeHolder: "LeaseApplication",
        validateInput: (value) => {
          if (!value) return "Name is required";
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) return "Use PascalCase";
          return null;
        },
      });

      if (!nameInput) return;
      interfaceName = nameInput;

      // Add fields one by one
      let addingFields = true;
      while (addingFields) {
        const fieldName = await vscode.window.showInputBox({
          prompt: "Field name (camelCase)",
          placeHolder: "customerName",
        });

        if (!fieldName) {
          addingFields = false;
          break;
        }

        const fieldType = await vscode.window.showQuickPick(
          [
            "string",
            "number",
            "boolean",
            "Date",
            "string[]",
            "number[]",
            "Record<string, any>",
            "Custom Type",
          ],
          { placeHolder: `Select type for ${fieldName}` },
        );

        if (!fieldType) continue;

        let actualType = fieldType;
        if (fieldType === "Custom Type") {
          const customType = await vscode.window.showInputBox({
            prompt: "Enter custom type",
            placeHolder: "User | null",
          });
          if (!customType) continue;
          actualType = customType;
        }

        const isRequired = await vscode.window.showQuickPick(["Yes", "No"], {
          placeHolder: "Is this field required?",
        });

        fields.push({
          name: fieldName,
          type: actualType,
          required: isRequired === "Yes",
        });

        const addMore = await vscode.window.showQuickPick(["Yes", "No"], {
          placeHolder: "Add another field?",
        });

        if (addMore !== "Yes") addingFields = false;
      }
    } else if (inputMethod.value === "prisma") {
      // From Prisma schema
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
          model: m,
        })),
        { placeHolder: "Select model to generate interface for" },
      );

      if (!selectedModel) return;

      interfaceName = selectedModel.model.name;
      fields = selectedModel.model.fields.map((f) => ({
        name: f.name,
        type: getTypeScriptType(f.type, f.isArray, f.isRequired),
        required: f.isRequired,
      }));
    }

    if (fields.length === 0) {
      vscode.window.showErrorMessage("No fields defined");
      return;
    }

    // Generate the interface
    const interfaceCode = generateInterfaceCode(interfaceName, fields);

    // Ask where to save
    const saveLocation = await vscode.window.showQuickPick(
      [
        {
          label: "📁 src/types/",
          description: "Dedicated types folder",
          value: "types",
        },
        {
          label: "📄 Same folder as page",
          description: "Next to component",
          value: "local",
        },
        {
          label: "📋 Copy to clipboard",
          description: "Just copy, don't save",
          value: "clipboard",
        },
      ],
      { placeHolder: "Where to save the interface?" },
    );

    if (saveLocation?.value === "clipboard") {
      await vscode.env.clipboard.writeText(interfaceCode);
      vscode.window.showInformationMessage("✅ Interface copied to clipboard!");
      return;
    }

    let filePath = "";
    if (saveLocation?.value === "types") {
      const typesDir = path.join(targetDir, "src", "types");
      await fs.ensureDir(typesDir);
      filePath = path.join(typesDir, `${interfaceName}.ts`);
    } else {
      // Ask for specific folder
      const uri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Folder",
      });

      if (uri && uri[0]) {
        filePath = path.join(uri[0].fsPath, `${interfaceName}.ts`);
      } else {
        const defaultPath = path.join(targetDir, "src", "components");
        filePath = path.join(defaultPath, `${interfaceName}.ts`);
      }
    }

    if (filePath) {
      await fs.writeFile(filePath, interfaceCode);
      const doc = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(doc);
      vscode.window.showInformationMessage(`✅ Interface saved to ${filePath}`);
    }

    // Ask if they want to generate a page with this interface
    const generatePage = await vscode.window.showInformationMessage(
      "Generate a fully typed page with this interface?",
      "Yes, Generate Page",
      "No, Thanks",
    );

    if (generatePage === "Yes, Generate Page") {
      await generateTypedPage(targetDir, interfaceName, fields);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating interface: ${error}`);
  }
}
// Infer TypeScript types from JSON data
function inferTypesFromData(
  data: any,
): { name: string; type: string; required: boolean }[] {
  const fields: { name: string; type: string; required: boolean }[] = [];

  for (const [key, value] of Object.entries(data)) {
    let type = "any";

    if (value === null) {
      type = "null";
    } else if (typeof value === "string") {
      // Check if it looks like a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        type = "Date | string";
      } else {
        type = "string";
      }
    } else if (typeof value === "number") {
      type = "number";
    } else if (typeof value === "boolean") {
      type = "boolean";
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        const itemType = typeof value[0];
        type = `${itemType}[]`;
      } else {
        type = "any[]";
      }
    } else if (typeof value === "object") {
      type = "Record<string, any>";
    }

    fields.push({
      name: key,
      type,
      required: true,
    });
  }

  return fields;
}

// Generate TypeScript interface code
function generateInterfaceCode(
  name: string,
  fields: { name: string; type: string; required: boolean }[],
): string {
  const lines: string[] = [];

  lines.push(`/**`);
  lines.push(` * ${name} Interface`);
  lines.push(` * Generated by GeNext`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`export interface ${name} {`);

  for (const field of fields) {
    const optional = field.required ? "" : "?";
    lines.push(`  ${field.name}${optional}: ${field.type};`);
  }

  lines.push(`}`);
  lines.push(``);
  lines.push(`// Example usage:`);
  lines.push(`// const data: ${name} = {`);
  for (const field of fields) {
    let example = "";
    if (field.type === "string") example = `"example"`;
    else if (field.type === "number") example = "0";
    else if (field.type === "boolean") example = "true";
    else if (field.type.includes("[]")) example = "[]";
    else example = "null";
    lines.push(`//   ${field.name}: ${example},`);
  }
  lines.push(`// };`);

  return lines.join("\n");
}

// Generate a fully typed page
async function generateTypedPage(
  targetDir: string,
  interfaceName: string,
  fields: any[],
) {
  const pageName = await vscode.window.showInputBox({
    prompt: "Page name (URL path)",
    placeHolder: interfaceName.toLowerCase(),
    value: interfaceName.toLowerCase(),
  });

  if (!pageName) return;

  const pageType = await vscode.window.showQuickPick(
    [
      {
        label: "📋 List Page",
        description: "Table with search, filter, pagination",
        value: "list",
      },
      {
        label: "📝 Form Page",
        description: "Create/Edit form with validation",
        value: "form",
      },
      {
        label: "📊 Dashboard Card",
        description: "Stats and charts",
        value: "dashboard",
      },
      {
        label: "🔍 Detail Page",
        description: "Single item view",
        value: "detail",
      },
    ],
    { placeHolder: "What type of page do you want?" },
  );

  if (!pageType) return;

  const routerType = await detectRouterType(targetDir);
  let pageCode = "";

  switch (pageType.value) {
    case "list":
      pageCode = generateListPageForInterface(interfaceName, fields, pageName);
      break;
    case "form":
      pageCode = generateFormPageFromInterface(interfaceName, fields, pageName);
      break;
    case "dashboard":
      pageCode = generateDashboardPageFromInterface(
        interfaceName,
        fields,
        pageName,
      );
      break;
    case "detail":
      pageCode = generateDetailPage(interfaceName, fields, pageName);
      break;
  }

  // Save the page
  let filePath: string;
  if (routerType === "app") {
    const pageDir = path.join(targetDir, "src", "app", pageName);
    await fs.ensureDir(pageDir);
    filePath = path.join(pageDir, "page.tsx");
  } else {
    const pagesDir = path.join(targetDir, "src", "pages");
    filePath = path.join(pagesDir, `${pageName}.tsx`);
  }

  await fs.writeFile(filePath, pageCode);
  const doc = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(doc);

  vscode.window.showInformationMessage(`✅ Page generated: ${pageName}`);
}

// function generateListPage(
//   interfaceName: string,
//   fields: any[],
//   pageName: string,
// ): string {
//   // Determine which fields to show in table (first 5)
//   const tableFields = fields.slice(0, 5);

//   return `"use client";

// import React, { useState, useEffect, useMemo } from 'react';
// import Link from 'next/link';

// export interface ${interfaceName} {
// ${fields.map((f) => `  ${f.name}${f.required ? "" : "?"}: ${f.type};`).join("\n")}
// }

// export default function ${interfaceName}ListPage() {
//   const [data, setData] = useState<${interfaceName}[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/${pageName}');
//       if (!response.ok) throw new Error('Failed to fetch');
//       const result = await response.json();
//       setData(result);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredData = useMemo(() => {
//     if (!search) return data;
//     return data.filter(item =>
//       Object.values(item).some(value =>
//         String(value).toLowerCase().includes(search.toLowerCase())
//       )
//     );
//   }, [data, search]);

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   if (loading) return <div className="p-8 text-center">Loading...</div>;
//   if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">${interfaceName}s</h1>
//         <Link
//           href="/${pageName}/create"
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Create New
//         </Link>
//       </div>

//       {/* Search */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full md:w-96 px-4 py-2 border rounded-lg"
//         />
//       </div>

//       {/* Table */}
//       <div className="border rounded-lg overflow-hidden">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
// ${tableFields.map((f) => `              <th className="px-4 py-3 text-left text-sm font-semibold">${f.name.charAt(0).toUpperCase() + f.name.slice(1)}</th>`).join("\n")}
//               <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {paginatedData.map((item, idx) => (
//               <tr key={idx} className="hover:bg-gray-50">
// ${tableFields.map((f) => `                <td className="px-4 py-2 text-sm">{String(item.${f.name})}</td>`).join("\n")}
//                 <td className="px-4 py-2 text-sm">
//                   <Link href={\`/${pageName}/\${item.id}\`} className="text-blue-600 hover:underline mr-3">
//                     View
//                   </Link>
//                   <Link href={\`/${pageName}/\${item.id}/edit\`} className="text-green-600 hover:underline">
//                     Edit
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-between items-center mt-4">
//           <button
//             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//             className="px-4 py-2 border rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="text-sm">Page {currentPage} of {totalPages}</span>
//           <button
//             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }`;
// }
function generateListPage(
  interfaceName: string,
  styling: string,
  hasAuth: boolean,
): string {
  const pageName = interfaceName.toLowerCase();

  return `"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export interface ${interfaceName} {
  id: string;
  name: string;
  createdAt: string;
}

export default function ${interfaceName}ListPage() {
  const [data, setData] = useState<${interfaceName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/${pageName}');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">${interfaceName}s</h1>
        <Link
          href="/${pageName}/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Created At</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{item.id}</td>
                <td className="px-4 py-2 text-sm">{item.name}</td>
                <td className="px-4 py-2 text-sm">{item.createdAt}</td>
                <td className="px-4 py-2 text-sm">
                  <Link href={\`/${pageName}/\${item.id}\`} className="text-blue-600 hover:underline mr-3">
                    View
                  </Link>
                  <Link href={\`/${pageName}/\${item.id}/edit\`} className="text-green-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}`;
}
function generateFormPageFromInterface(
  interfaceName: string,
  fields: any[],
  pageName: string,
): string {
  // Filter out id and auto-generated fields for form
  const formFields = fields.filter(
    (f) =>
      !f.name.includes("id") &&
      f.name !== "createdAt" &&
      f.name !== "updatedAt",
  );

  return `"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ${interfaceName} {
${fields.map((f) => `  ${f.name}${f.required ? "" : "?"}: ${f.type};`).join("\n")}
}

export default function Create${interfaceName}Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<${interfaceName}>>({});

  const handleChange = (field: keyof ${interfaceName}, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/${pageName}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');

      router.push('/${pageName}');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create ${interfaceName}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
${formFields
  .map(
    (f) => `
        <div>
          <label className="block text-sm font-medium mb-1">
            ${f.name.charAt(0).toUpperCase() + f.name.slice(1)}${f.required ? " *" : ""}
          </label>
          <input
            type="${f.type === "number" ? "number" : "text"}"
            value={formData.${f.name} || ''}
            onChange={(e) => handleChange('${f.name}', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            ${f.required ? "required" : ""}
          />
        </div>
`,
  )
  .join("\n")}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}`;
}

function generateDashboardPageFromInterface(
  interfaceName: string,
  fields: any[],
  pageName: string,
): string {
  return `"use client";

import React, { useState, useEffect } from 'react';

export interface ${interfaceName} {
${fields.map((f) => `  ${f.name}${f.required ? "" : "?"}: ${f.type};`).join("\n")}
}

export default function ${interfaceName}Dashboard() {
  const [data, setData] = useState<${interfaceName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, average: 0, trend: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/${pageName}');
      const result = await response.json();
      setData(result);
      
      // Calculate stats
      const total = result.length;
      const avgField = result.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) / total;
      setStats({ total, average: avgField, trend: 12 });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">${interfaceName} Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total ${interfaceName}s</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Average Amount</h3>
          <p className="text-3xl font-bold">€{Math.round(stats.average).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Monthly Trend</h3>
          <p className="text-3xl font-bold text-green-600">+{stats.trend}%</p>
        </div>
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Recent ${interfaceName}s</h2>
        </div>
        <div className="divide-y">
          {data.slice(0, 5).map((item, idx) => (
            <div key={idx} className="p-4">
              <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

function generateDetailPage(
  interfaceName: string,
  fields: any[],
  pageName: string,
): string {
  return `"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export interface ${interfaceName} {
${fields.map((f) => `  ${f.name}${f.required ? "" : "?"}: ${f.type};`).join("\n")}
}

export default function ${interfaceName}DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<${interfaceName} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`/api/${pageName}/\${params.id}\`);
      if (!response.ok) throw new Error('Not found');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;
    
    try {
      const response = await fetch(\`/api/${pageName}/\${params.id}\`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      router.push('/${pageName}');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-center">Not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">${interfaceName} Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(\`/${pageName}/\${params.id}/edit\`)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
${fields
  .map(
    (f) => `
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-1">${f.name}</div>
          <div className="font-medium">{String(data.${f.name} || '—')}</div>
        </div>
`,
  )
  .join("\n")}
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        Back
      </button>
    </div>
  );
}`;
}

export function deactivate() {}

function generateListPageForInterface(
  interfaceName: string,
  fields: any[],
  pageName: string,
): string {
  // Determine which fields to show in table (first 5)
  const tableFields = fields.slice(0, 5);

  return `"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export interface ${interfaceName} {
${fields.map((f: any) => `  ${f.name}${f.required ? "" : "?"}: ${f.type};`).join("\n")}
}

export default function ${interfaceName}ListPage() {
  const [data, setData] = useState<${interfaceName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/${pageName}');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">${interfaceName}s</h1>
        <Link
          href="/${pageName}/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
              ${tableFields.map((f: any) => `<th className="px-4 py-3 text-left text-sm font-semibold">${f.name.charAt(0).toUpperCase() + f.name.slice(1)}</th>`).join("\n              ")}
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{item.id}</td>
                ${tableFields.map((f: any) => `<td className="px-4 py-2 text-sm">{String(item.${f.name})}</td>`).join("\n                ")}
                <td className="px-4 py-2 text-sm">
                  <Link href={\`/${pageName}/\${item.id}\`} className="text-blue-600 hover:underline mr-3">
                    View
                  </Link>
                  <Link href={\`/${pageName}/\${item.id}/edit\`} className="text-green-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}`;
}
