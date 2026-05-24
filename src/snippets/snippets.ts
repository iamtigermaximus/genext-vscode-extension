// src/snippets.ts
import * as vscode from "vscode";

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

export async function insertMapFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(
    `{${v}.map((${e}, index) => (\n  <div key={index}>\n    {/* 🔴 Replace with your JSX for ${e} */}\n  </div>\n))}`,
    "✅ Map inserted!",
  );
}

export async function insertFilterFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(`${v}.filter(${e} => ${e}.isActive)`, "✅ Filter inserted!");
}

export async function insertFindFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(`${v}.find(${e} => ${e}.id === id)`, "✅ Find inserted!");
}

export async function insertForEachFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(
    `${v}.forEach(${e} => {\n  console.log(${e});\n})`,
    "✅ ForEach inserted!",
  );
}

export async function insertReduceFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "num";
  insertAtCursor(
    `${v}.reduce((acc, ${e}) => acc + ${e}.value, 0)`,
    "✅ Reduce inserted!",
  );
}

export async function insertSortFunction() {
  insertAtCursor(
    `.sort((a, b) => a.name.localeCompare(b.name))`,
    "✅ Sort inserted!",
  );
}

export async function insertSomeFunction() {
  const v = await getVarName();
  const e = v.endsWith("s") ? v.slice(0, -1) : "item";
  insertAtCursor(`${v}.some(${e} => ${e}.isActive)`, "✅ Some/Every inserted!");
}

export async function insertUseStateHook() {
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

export async function insertUseEffectHook() {
  insertAtCursor(
    `useEffect(() => {\n  // 🔴 Your effect logic here\n  return () => {\n    // 🔴 Cleanup here\n  };\n}, []);`,
    "✅ useEffect inserted!",
  );
}

export async function insertUseCallbackHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v} = useCallback(() => {\n  // 🔴 Your callback logic here\n}, []);`,
    "✅ useCallback inserted!",
  );
}

export async function insertUseMemoHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v} = useMemo(() => {\n  return // 🔴 computed value here\n}, []);`,
    "✅ useMemo inserted!",
  );
}

export async function insertUseRefHook() {
  const v = await getVarName();
  insertAtCursor(
    `const ${v}Ref = useRef<HTMLDivElement>(null);`,
    "✅ useRef inserted!",
  );
}

export async function insertUseContextHook() {
  const v = await getVarName();
  insertAtCursor(
    `const { ${v} } = useContext(${cap(v)}Context);`,
    "✅ useContext inserted!",
  );
}

export async function insertUseReducerHook() {
  insertAtCursor(
    `const [state, dispatch] = useReducer(reducer, initialState);`,
    "✅ useReducer inserted!",
  );
}

export async function insertSubmitHandlerFunction() {
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

export async function insertChangeHandlerFunction() {
  insertAtCursor(
    `const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};`,
    "✅ Change handler inserted!",
  );
}

export async function insertFormValidationFunction() {
  insertAtCursor(
    `const validate = () => {
  const errors: Record<string, string> = {};
  if (!data.name) errors.name = 'Name is required';
  return errors;
};`,
    "✅ Validation inserted!",
  );
}

export async function insertResetHandlerFunction() {
  insertAtCursor(
    `const handleReset = () => {
  setFormData(initialState);
  setErrors({});
};`,
    "✅ Reset handler inserted!",
  );
}

export async function insertFetchGetFunction() {
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

export async function insertFetchPostFunction() {
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

export async function insertFetchPutFunction() {
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

export async function insertFetchDeleteFunction() {
  insertAtCursor(
    `const handleDelete = async (id: string) => {
  await fetch(\`/api/resource/\${id}\`, { method: 'DELETE' });
};`,
    "✅ Fetch DELETE inserted!",
  );
}

export async function insertTryCatchBlock() {
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

export async function insertLoadingSkeletonComponent() {
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

export async function insertErrorBoundaryComponent() {
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

export async function insertConditionalRenderFunction() {
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
