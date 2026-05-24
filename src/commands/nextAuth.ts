import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getTargetDirectory } from "../helpers/fileHelpers";

export async function generateNextAuthConfig(uri?: vscode.Uri) {
  try {
    const targetDir = await getTargetDirectory(uri);

    const providers = await vscode.window.showQuickPick(
      [
        "📧 Credentials (Email/Password)",
        "🔵 Google",
        "🐙 GitHub",
        "🟦 Facebook",
        "🔷 Microsoft",
        "🐦 Twitter",
        "🟪 Discord",
      ],
      { canPickMany: true, placeHolder: "Select authentication providers" },
    );

    if (!providers || providers.length === 0) return;

    const usePrisma = await vscode.window.showQuickPick(
      ["Yes (Prisma)", "No (No database adapter)"],
      { placeHolder: "Use Prisma as database adapter?" },
    );

    const includeRoles = await vscode.window.showQuickPick(
      ["Yes (Admin/User roles)", "No"],
      { placeHolder: "Include user roles?" },
    );

    // Create types directory
    const typesDir = path.join(targetDir, "src", "types");
    await fs.ensureDir(typesDir);

    const typeDeclarationsPath = path.join(typesDir, "next-auth.d.ts");
    const typeDeclarationsContent = `import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    ${includeRoles === "Yes (Admin/User roles)" ? `role?: "USER" | "ADMIN";` : ""}
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
  }
}`;

    await fs.writeFile(typeDeclarationsPath, typeDeclarationsContent);

    // Create lib directory
    const libDir = path.join(targetDir, "src", "lib");
    await fs.ensureDir(libDir);

    const authTsPath = path.join(libDir, "auth.ts");
    const authContent = generateAuthContent(
      providers,
      usePrisma === "Yes (Prisma)",
      includeRoles === "Yes (Admin/User roles)",
    );
    await fs.writeFile(authTsPath, authContent);

    // Create API route
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
    const routeContent = `import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`;

    await fs.writeFile(routeTsPath, routeContent);

    // Create .env.local
    const envPath = path.join(targetDir, ".env.local");
    if (!(await fs.pathExists(envPath))) {
      const envContent = generateEnvContent(providers);
      await fs.writeFile(envPath, envContent);
    }

    const action = await vscode.window.showInformationMessage(
      `✅ NextAuth configuration generated!\n\nCreated:\n- src/types/next-auth.d.ts\n- src/lib/auth.ts\n- src/app/api/auth/[...nextauth]/route.ts\n- .env.local`,
      "Install Packages",
      "View Files",
    );

    if (action === "Install Packages") {
      const terminal = vscode.window.createTerminal("Install NextAuth");
      terminal.show();
      terminal.sendText("npm install next-auth @auth/prisma-adapter bcryptjs");
      terminal.sendText("npm install --save-dev @types/bcryptjs");
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error generating NextAuth config: ${error}`,
    );
  }
}

function generateAuthContent(
  providers: readonly string[],
  usePrisma: boolean,
  includeRoles: boolean,
): string {
  let content = `import { NextAuthOptions } from "next-auth";
${providers.includes("📧 Credentials (Email/Password)") ? `import CredentialsProvider from "next-auth/providers/credentials";\n` : ""}
${providers.includes("🔵 Google") ? `import GoogleProvider from "next-auth/providers/google";\n` : ""}
${providers.includes("🐙 GitHub") ? `import GitHubProvider from "next-auth/providers/github";\n` : ""}
${usePrisma ? `import { PrismaAdapter } from "@auth/prisma-adapter";\nimport { prisma } from "@/lib/prisma";\n` : ""}
${providers.includes("📧 Credentials (Email/Password)") ? `import bcrypt from "bcryptjs";\n` : ""}

export const authOptions: NextAuthOptions = {
  ${usePrisma ? `adapter: PrismaAdapter(prisma),\n  ` : ""}
  providers: [\n`;

  if (providers.includes("🔵 Google")) {
    content += `    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),\n`;
  }

  if (providers.includes("🐙 GitHub")) {
    content += `    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),\n`;
  }

  if (providers.includes("📧 Credentials (Email/Password)")) {
    content += `    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          ${includeRoles ? `role: user.role,` : ""}
        };
      },
    }),\n`;
  }

  content += `  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        ${includeRoles ? `token.role = user.role;` : ""}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        ${includeRoles ? `session.user.role = token.role as "USER" | "ADMIN";` : ""}
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};`;

  return content;
}

function generateEnvContent(providers: readonly string[]): string {
  let content = `# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

`;

  if (providers.includes("🔵 Google")) {
    content += `# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

`;
  }

  if (providers.includes("🐙 GitHub")) {
    content += `# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

`;
  }

  return content;
}
