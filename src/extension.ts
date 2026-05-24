import * as vscode from "vscode";
import { showDashboardHandler } from "./commands/dashboard";
import { initProjectHandler } from "./commands/projectInit";
import {
  createReactComponent,
  createCustomHook,
  createUtilityFunction,
  createFilterComponent,
  createListComponent,
  createDataFetcherComponent,
  createContextProvider,
  createFormComponent,
  createModalComponent,
  createTableComponent,
} from "./commands/components/index";
import {
  createApiRouteHandler,
  createDynamicRouteFile,
  createAzureFunctionHandler,
} from "./commands/apiRoutes";
import { createTestFile, createStorybookFile } from "./commands/testing";
import { generateSampleJsonHandler } from "./commands/sampleData";
import {
  generateFetchingHookHandler,
  generateFilterHookHandler,
} from "./commands/hook";
import {
  generatePrismaSchemaHandler,
  generateRoutesFromPrisma,
} from "./commands/prisma";
import { generateNextAuthConfig } from "./commands/nextAuth";
import { generateLayoutOrPage } from "./commands/layoutsPages";
import { generateCheatSheet } from "./commands/cheatSheet";
import { generateInterfaceFromData } from "./commands/interfaceGenerator";
import {
  insertMapFunction,
  insertFilterFunction,
  insertFindFunction,
  insertForEachFunction,
  insertReduceFunction,
  insertSortFunction,
  insertSomeFunction,
  insertUseStateHook,
  insertUseEffectHook,
  insertUseCallbackHook,
  insertUseMemoHook,
  insertUseRefHook,
  insertUseContextHook,
  insertUseReducerHook,
  insertSubmitHandlerFunction,
  insertChangeHandlerFunction,
  insertFormValidationFunction,
  insertResetHandlerFunction,
  insertFetchGetFunction,
  insertFetchPostFunction,
  insertFetchPutFunction,
  insertFetchDeleteFunction,
  insertTryCatchBlock,
  insertLoadingSkeletonComponent,
  insertErrorBoundaryComponent,
  insertConditionalRenderFunction,
} from "./snippets/snippets";
import {
  analyzeCode,
  generateDocs,
  findBugs,
  explainCode,
  refactorCode,
} from "./commands/aiFeatures";
import { AIChatPanel } from "./panels/chat-panel";

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
  const generateSampleJson = vscode.commands.registerCommand(
    "genext.generateSampleJson",
    generateSampleJsonHandler,
  );

  // ==================== HOOK GENERATORS ====================
  const generateFetchingHook = vscode.commands.registerCommand(
    "genext.generateFetchingHook",
    generateFetchingHookHandler,
  );
  const generateFilterHook = vscode.commands.registerCommand(
    "genext.generateFilterHook",
    generateFilterHookHandler,
  );

  // ==================== AUTH & PRISMA ====================
  const generateNextAuth = vscode.commands.registerCommand(
    "genext.generateNextAuth",
    generateNextAuthConfig,
  );
  const generateRoutesFromPrismaCmd = vscode.commands.registerCommand(
    "genext.generateRoutesFromPrisma",
    generateRoutesFromPrisma,
  );

  // ==================== LAYOUT & PAGE GENERATORS ====================
  const generateLayout = vscode.commands.registerCommand(
    "genext.generateLayout",
    generateLayoutOrPage,
  );
  const generatePage = vscode.commands.registerCommand(
    "genext.generatePage",
    generateLayoutOrPage,
  );

  // ==================== CHEAT SHEET & INTERFACE ====================
  const generateCheatSheetCmd = vscode.commands.registerCommand(
    "genext.generateCheatSheet",
    generateCheatSheet,
  );
  const generateInterface = vscode.commands.registerCommand(
    "genext.generateInterface",
    generateInterfaceFromData,
  );

  // ==================== AI FEATURES ====================
  const openAIChat = vscode.commands.registerCommand(
    "genext.openAIChat",
    () => {
      AIChatPanel.createOrShow(context.extensionPath);
    },
  );
  const analyzeCodeCmd = vscode.commands.registerCommand(
    "genext.analyzeCode",
    analyzeCode,
  );
  const generateDocsCmd = vscode.commands.registerCommand(
    "genext.generateDocs",
    generateDocs,
  );
  const findBugsCmd = vscode.commands.registerCommand(
    "genext.findBugs",
    findBugs,
  );
  const explainCodeCmd = vscode.commands.registerCommand(
    "genext.explainCode",
    explainCode,
  );
  const refactorCodeCmd = vscode.commands.registerCommand(
    "genext.refactorCode",
    refactorCode,
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

  // ==================== PUSH ALL COMMANDS ====================
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
    generateSampleJson,
    generateFetchingHook,
    generateFilterHook,
    generateNextAuth,
    generateRoutesFromPrismaCmd,
    generateLayout,
    generatePage,
    generateCheatSheetCmd,
    generateInterface,
    openAIChat,
    analyzeCodeCmd,
    generateDocsCmd,
    findBugsCmd,
    explainCodeCmd,
    refactorCodeCmd,
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
  );
}

export function deactivate() {}
