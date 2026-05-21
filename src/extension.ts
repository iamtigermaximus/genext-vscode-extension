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

  // In your activate function, add these command registrations
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

export function deactivate() {}
