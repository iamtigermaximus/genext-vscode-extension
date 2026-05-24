import * as vscode from "vscode";

export async function showDashboardHandler() {
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
      description: "Ready-to-use code snippets",
      command: "genext.generateCheatSheet",
    },
    {
      label: "   🔧 Generate Interface",
      description: "Create TypeScript interface from JSON",
      command: "genext.generateInterface",
    },
    { label: "📁 ───── SAMPLE DATA ─────", description: "", command: "" },
    {
      label: "   📄 Generate Sample JSON",
      description: "Create sample data for testing",
      command: "genext.generateSampleJson",
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
