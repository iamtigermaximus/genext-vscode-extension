import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";
import { promisify } from "util";
import { getTargetDirectory } from "../helpers/fileHelpers";
import { validateProjectName } from "../helpers/validationHelpers";

const execAsync = promisify(exec);

export async function initProjectHandler() {
  try {
    const projectName = await vscode.window.showInputBox({
      prompt: "Project name",
      placeHolder: "my-nextjs-app",
      validateInput: validateProjectName,
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
          if (router.value === "app") {
            await fs.writeFile(
              path.join(projectPath, "src", "app", "globals.css"),
              cssCode,
            );
          } else {
            await fs.writeFile(
              path.join(projectPath, "src", "styles", "globals.css"),
              cssCode,
            );
          }

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
