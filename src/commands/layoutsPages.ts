import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import {
  getTargetDirectory,
  detectRouterType,
  capitalizeFirstLetter,
} from "../helpers/fileHelpers";
import { validatePageName } from "../helpers/validationHelpers";

// ==================== LAYOUT & PAGE GENERATOR ====================
export async function generateLayoutOrPage(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

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

    let name: string = "";
    if (type.value === "page") {
      const inputName = await vscode.window.showInputBox({
        prompt: "Page name (e.g., 'about', 'dashboard', 'users')",
        placeHolder: "my-page",
        validateInput: validatePageName,
      });
      if (!inputName) return;
      name = inputName;
    } else {
      name = template.label.replace(" Layout", "");
    }

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
    ];

    const selectedFeatures = await vscode.window.showQuickPick(
      availableFeatures,
      {
        canPickMany: true,
        placeHolder: "Select additional features",
      },
    );

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
      );
      const routerType = await detectRouterType(targetDir);

      if (routerType === "app") {
        const pageDir = path.join(targetDir, "src", "app", name);
        await fs.ensureDir(pageDir);
        filePath = path.join(pageDir, "page.tsx");
      } else {
        const pagesDir = path.join(targetDir, "src", "pages");
        filePath = path.join(pagesDir, `${name}.tsx`);
      }
    }

    await fs.writeFile(filePath, code);
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

  if (type === "dashboard") {
    return `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
${hasAuth ? `import { useSession, signOut } from 'next-auth/react';\n` : ""}

export const ${name} = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  ${hasAuth ? `const { data: session } = useSession();\n` : ""}
  ${hasDarkMode ? `const [darkMode, setDarkMode] = useState(false);\n` : ""}

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/users', label: 'Users', icon: '👥' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b fixed top-0 right-0 left-0 z-10">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">☰</button>
          <div className="font-semibold">Logo</div>
          ${
            hasAuth
              ? `
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span>{session.user?.email}</span>
                <button onClick={() => signOut()} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
              </>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </div>`
              : ""
          }
        </div>
      </header>

      <aside className={\`fixed top-16 bottom-0 left-0 w-64 bg-white border-r transform transition-transform \${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0\`}>
        <nav className="p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={\`block px-4 py-2 rounded \${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}\`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="lg:ml-64 pt-16 p-6">{children}</main>
    </div>
  );
};

export default ${name};`;
  }

  if (type === "auth") {
    return `'use client';

export const ${name} = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ${name};`;
  }

  return `'use client';

export const ${name} = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen">{children}</div>;
};

export default ${name};`;
}

function generatePageCode(
  name: string,
  type: string,
  styling: string,
  features: any[],
): string {
  const hasAuth = features.some((f) => f.value === "auth");
  const hasSeo = features.some((f) => f.value === "seo");

  if (type === "landing") {
    return `${hasSeo ? `import { Metadata } from 'next';\n\nexport const metadata: Metadata = { title: '${capitalizeFirstLetter(name)}' };\n\n` : ""}export default function ${capitalizeFirstLetter(name)}Page() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24 text-center">
        <h1 className="text-5xl font-bold">Welcome to ${capitalizeFirstLetter(name)}</h1>
        <p className="text-xl mt-4">The best place to build your next project</p>
        <button className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">Get Started</button>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {['Fast', 'Secure', 'Scalable'].map((feature, i) => (
              <div key={i} className="text-center p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                <p className="text-gray-600">Built with performance and security in mind</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`;
  }

  if (type === "list") {
    return `'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ${capitalizeFirstLetter(name)}Page() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sampleData = [
    { id: 1, name: 'Item 1', status: 'Active', createdAt: '2024-01-01' },
    { id: 2, name: 'Item 2', status: 'Inactive', createdAt: '2024-01-02' },
  ];

  const filteredData = sampleData.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">${capitalizeFirstLetter(name)}</h1>
        <Link href="/${name}/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create New</Link>
      </div>
      <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 w-full md:w-96 px-4 py-2 border rounded-lg" />
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Actions</th></tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{item.id}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.status}</td>
                <td className="px-4 py-2">
                  <Link href={\`/${name}/\${item.id}\`} className="text-blue-600 mr-3">View</Link>
                  <Link href={\`/${name}/\${item.id}/edit\`} className="text-green-600">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-4 py-2 border rounded">Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border rounded">Next</button>
      </div>
    </div>
  );
}`;
  }

  return `export default function ${capitalizeFirstLetter(name)}Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">${capitalizeFirstLetter(name)} Page</h1>
      <p>Welcome to the ${name} page.</p>
    </div>
  );
}`;
}
