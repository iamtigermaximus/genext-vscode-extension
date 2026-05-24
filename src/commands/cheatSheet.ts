import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory, openFile } from "../helpers/fileHelpers";

export async function generateCheatSheet(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

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
      default:
        fileName = "cheat-sheet.md";
        content = "# Cheat Sheet\n\nReference documentation here.";
    }

    const filePath = path.join(cheatSheetsDir, fileName);
    await fs.writeFile(filePath, content);
    await openFile(filePath);
    vscode.window.showInformationMessage(
      `✅ Cheat sheet generated: ${fileName}`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating cheat sheet: ${error}`);
  }
}

function getLeaseCalculatorCheatSheet(): string {
  return `import React, { useState, useMemo } from 'react';

interface LeaseInput {
  principal: number;
  annualRate: number;
  termMonths: number;
  residualValue: number;
  processingFee: number;
}

export default function LeaseCalculator() {
  const [inputs, setInputs] = useState<LeaseInput>({
    principal: 25000,
    annualRate: 5.9,
    termMonths: 48,
    residualValue: 5000,
    processingFee: 500,
  });

  const result = useMemo(() => {
    const monthlyRate = inputs.annualRate / 100 / 12;
    const depreciableAmount = inputs.principal - inputs.residualValue;
    
    let monthlyPayment = depreciableAmount / inputs.termMonths;
    if (monthlyRate > 0) {
      const compound = Math.pow(1 + monthlyRate, inputs.termMonths);
      monthlyPayment = depreciableAmount * (monthlyRate * compound) / (compound - 1);
    }
    
    const adjustedPayment = monthlyPayment + (inputs.processingFee / inputs.termMonths);
    const totalInterest = (monthlyPayment * inputs.termMonths) - depreciableAmount;
    
    return { monthlyPayment: adjustedPayment, totalInterest };
  }, [inputs]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lease Calculator</h1>
      <div className="space-y-4">
        <div><label>Principal (€)</label><input type="number" value={inputs.principal} onChange={e => setInputs({...inputs, principal: +e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label>Interest Rate (%)</label><input type="number" step="0.1" value={inputs.annualRate} onChange={e => setInputs({...inputs, annualRate: +e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label>Term (months)</label><input type="number" value={inputs.termMonths} onChange={e => setInputs({...inputs, termMonths: +e.target.value})} className="w-full p-2 border rounded" /></div>
        <div className="pt-4 border-t">
          <p className="text-lg font-semibold">Monthly Payment: €{result.monthlyPayment.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Interest: €{result.totalInterest.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}`;
}

function getDataTableCheatSheet(): string {
  return `import React, { useState, useMemo } from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
}

export function DataTable<T extends { id: string | number }>({ data, columns }: { data: T[]; columns: Column<T>[] }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(search.toLowerCase())));
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 w-full md:w-96 p-2 border rounded" />
      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>{columns.map(col => <th key={String(col.key)} onClick={() => col.sortable !== false && setSortField(col.key)} className="p-2 text-left cursor-pointer">{col.header}</th>)}</tr>
          </thead>
          <tbody>{paginatedData.map(row => <tr key={row.id}>{columns.map(col => <td key={String(col.key)} className="p-2 border-t">{String(row[col.key])}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</button><span>Page {currentPage}</span><button onClick={() => setCurrentPage(p => p + 1)}>Next</button></div>
    </div>
  );
}`;
}
