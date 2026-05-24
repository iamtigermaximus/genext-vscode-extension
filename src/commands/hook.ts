import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../helpers/fileHelpers";

// ==================== GENERATE FETCHING HOOK HANDLER ====================
export async function generateFetchingHookHandler(uri?: vscode.Uri) {
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

    const filePath = path.join(hooksDir, `${hookName}.ts`);
    await fs.writeFile(filePath, hookCode);
    await openFile(filePath);
    vscode.window.showInformationMessage(`✅ Hook ${hookName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating hook: ${error}`);
  }
}

// ==================== GENERATE FILTER HOOK HANDLER ====================
export async function generateFilterHookHandler(uri?: vscode.Uri) {
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

    const filePath = path.join(hooksDir, `${hookName}.ts`);
    await fs.writeFile(filePath, hookCode);
    await openFile(filePath);
    vscode.window.showInformationMessage(`✅ Filter hook ${hookName} created!`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating filter hook: ${error}`);
  }
}
