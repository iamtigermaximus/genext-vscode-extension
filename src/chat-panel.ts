import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { DeepSeekClient } from "./deepseek-client";

export class AIChatPanel {
  public static currentPanel: AIChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _client: DeepSeekClient | null = null;
  private _conversationHistory: Array<{ role: string; content: string }> = [];
  private _projectContext: string = "";
  private _currentFiles: string[] = [];
  private _currentRelativePaths: string[] = [];

  private _messageQueue: Array<{ role: string; content: string }> = [];
  private _isProcessingQueue = false;
  private _updateTimeout: NodeJS.Timeout | null = null;

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;

    this._updateWebview();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.onDidReceiveMessage(
      this._handleMessage,
      this,
      this._disposables,
    );
  }

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (AIChatPanel.currentPanel) {
      AIChatPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "aiChat",
      "🧠 GeNext AI Architect",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );

    AIChatPanel.currentPanel = new AIChatPanel(panel, extensionPath);
  }

  private async _getClient(): Promise<DeepSeekClient | null> {
    if (this._client) return this._client;

    const config = vscode.workspace.getConfiguration("genext");
    const apiKey = config.get<string>("deepseekApiKey");

    if (!apiKey) {
      const setKey = await vscode.window.showWarningMessage(
        "🤖 DeepSeek API key required for AI chat. Configure now?",
        "Configure",
        "Cancel",
      );
      if (setKey === "Configure") {
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "genext.deepseekApiKey",
        );
      }
      return null;
    }

    this._client = new DeepSeekClient(apiKey);
    return this._client;
  }

  private async _handleMessage(message: any) {
    switch (message.command) {
      case "sendMessage":
        await this._sendToAI(message.text);
        break;
      case "applyCode":
        await this._applyCodeToEditor(message.code);
        break;
      case "deleteFile":
        await this._handleDirectDelete(message.filePath);
        break;
      case "refactorFile":
        await this._refactorFile(message.filePath, message.newContent);
        break;
      case "createFile":
        await this._createFile(message.filePath, message.content);
        break;
      case "scanProject":
        await this._scanProject();
        break;
      case "getCurrentFile":
        await this._sendCurrentFile();
        break;
      case "analyzeFile":
        await this._analyzeCurrentFile();
        break;
      case "suggestFix":
        await this._suggestFixForSelection();
        break;
      case "architectureReview":
        await this._architectureReview();
        break;
      case "clearHistory":
        this._conversationHistory = [];
        break;
    }
  }

  private _addMessage(role: string, content: string) {
    this._messageQueue.push({ role, content });

    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    this._updateTimeout = setTimeout(() => {
      this._processMessageQueue();
    }, 100);
  }

  private _processMessageQueue() {
    if (this._isProcessingQueue || this._messageQueue.length === 0) return;

    this._isProcessingQueue = true;
    const batch = [...this._messageQueue];
    this._messageQueue = [];

    for (let i = 0; i < batch.length; i++) {
      setTimeout(() => {
        this._panel.webview.postMessage({
          command: "addMessage",
          message: {
            ...batch[i],
            timestamp: new Date().toLocaleTimeString(),
          },
        });
      }, i * 50);
    }

    setTimeout(
      () => {
        this._isProcessingQueue = false;
      },
      batch.length * 50 + 100,
    );
  }

  private async _handleDirectDelete(filePath: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      this._addMessage("system", "❌ No workspace folder open.");
      return;
    }

    let fullPath: string | null = null;

    for (const folder of workspaceFolders) {
      const possiblePaths = [
        path.join(folder.uri.fsPath, filePath),
        path.join(folder.uri.fsPath, "src", filePath),
        path.join(folder.uri.fsPath, filePath.replace(/^src\//, "")),
      ];

      for (const possiblePath of possiblePaths) {
        if (await fs.pathExists(possiblePath)) {
          fullPath = possiblePath;
          break;
        }
      }
      if (fullPath) break;
    }

    if (!fullPath) {
      this._addMessage("system", `❌ File not found: ${filePath}`);
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      `🗑️ Delete ${filePath}? This cannot be undone!`,
      { modal: true },
      "Yes, Delete",
      "Cancel",
    );

    if (confirm === "Yes, Delete") {
      try {
        await fs.remove(fullPath);
        this._addMessage("system", `✅ Deleted: ${filePath}`);
        this._currentFiles = this._currentFiles.filter((f) => f !== fullPath);
        await this._scanProject();
      } catch (error) {
        this._addMessage("system", `❌ Failed to delete: ${error}`);
      }
    } else {
      this._addMessage("system", "❌ Deletion cancelled.");
    }
  }

  // ==================== OPTIMIZED FAST SCANNING ====================
  private async _scanProject() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      this._addMessage("system", "❌ No project folder open.");
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    this._addMessage("system", "🔍 Scanning project...");

    try {
      // Use VS Code's built-in findFiles (MUCH faster than manual traversal)
      const files = await vscode.workspace.findFiles(
        "**/*.{ts,tsx,js,jsx}",
        "**/node_modules/**",
      );

      const filePaths = files.map((f) => f.fsPath);
      this._currentFiles = filePaths;
      this._currentRelativePaths = filePaths.map((f) =>
        path.relative(rootPath, f),
      );

      if (filePaths.length === 0) {
        this._addMessage("system", "❌ No TypeScript/JavaScript files found.");
        return;
      }

      // Count file types (fast - no file reading)
      const fileTypes: Record<string, number> = {};
      for (const file of filePaths) {
        const ext = path.extname(file);
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }

      let summary = `📁 **Project Scan Complete**\n\n`;
      summary += `📊 **Total Files:** ${filePaths.length}\n\n`;
      summary += `**File Types:**\n`;
      for (const [ext, count] of Object.entries(fileTypes)) {
        const icon =
          ext === ".tsx"
            ? "⚛️"
            : ext === ".ts"
              ? "📘"
              : ext === ".js"
                ? "📜"
                : "📄";
        summary += `- ${icon} ${ext}: ${count}\n`;
      }

      this._addMessage("system", summary);

      // Build project summary with file list (fast - no content reading)
      let projectContext = this._buildProjectSummary(rootPath, filePaths);

      // Store file paths but DON'T read content yet
      this._projectContext = projectContext;

      this._addMessage(
        "system",
        `✅ Ready! ${filePaths.length} files indexed. Ask me to analyze specific files.`,
      );
    } catch (error) {
      this._addMessage("system", `❌ Error scanning: ${error}`);
    }
  }

  private _buildProjectSummary(rootPath: string, files: string[]): string {
    const folders: Set<string> = new Set();

    for (const file of files) {
      const relativePath = path.relative(rootPath, file);
      const folder = relativePath.includes(path.sep)
        ? relativePath.split(path.sep)[0]
        : "root";
      folders.add(folder);
    }

    let summary = `## 📁 Project Summary\n\n`;
    summary += `**Root Path:** \`${rootPath}\`\n`;
    summary += `**Total Files:** ${files.length}\n\n`;

    summary += `### 📁 Folder Structure:\n`;
    for (const folder of folders) {
      summary += `- 📂 ${folder}/\n`;
    }

    summary += `\n### 📄 File List (first 50):\n`;
    for (const file of files.slice(0, 50)) {
      const relativePath = path.relative(rootPath, file);
      const fileIcon = relativePath.endsWith(".tsx")
        ? "⚛️"
        : relativePath.endsWith(".ts")
          ? "📘"
          : "📄";
      summary += `- ${fileIcon} ${relativePath}\n`;
    }
    if (files.length > 50) {
      summary += `- ... and ${files.length - 50} more files\n`;
    }

    return summary;
  }

  // Helper to read a specific file when needed
  private async _readFileContent(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content.length > 3000
        ? content.slice(0, 3000) + "\n// ... (truncated)"
        : content;
    } catch (err) {
      return `// Error reading file: ${err}`;
    }
  }

  // ==================== ARCHITECTURE REVIEW ====================
  private async _architectureReview() {
    this._sendToAI(
      `Please act as a Senior Software Architect. Provide a comprehensive review of my project architecture based on the file structure I've shared.`,
    );
  }

  // ==================== SEND TO AI ====================
  private async _sendToAI(userMessage: string) {
    const client = await this._getClient();
    if (!client) {
      this._addMessage("system", "❌ Please configure your DeepSeek API key.");
      return;
    }

    this._addMessage("user", userMessage);

    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("delete") &&
      (lowerMessage.includes(".ts") || lowerMessage.includes(".tsx"))
    ) {
      const pathMatch = userMessage.match(
        /(?:src\/|app\/|components\/|hooks\/|utils\/|lib\/)[\w\/\-\.]+\.(tsx?|jsx?|ts|js)/i,
      );
      if (pathMatch) {
        await this._handleDirectDelete(pathMatch[0]);
        return;
      }
    }

    if (
      lowerMessage.includes("architecture") ||
      lowerMessage.includes("review") ||
      lowerMessage.includes("structure")
    ) {
      await this._architectureReview();
      return;
    }

    const fullMessage =
      userMessage +
      (this._projectContext
        ? `\n\n## 📁 PROJECT CONTEXT\n${this._projectContext}\n\n`
        : "");

    try {
      const response = await client.chat(
        [
          {
            role: "system",
            content: `You are a **Senior Software Architect and Lead Developer** with 15+ years of experience in React, Next.js, and TypeScript.

You have access to the user's project file structure. You can see file names and folders.
When asked about specific files, you can request their content.

Be concise, specific, and actionable.`,
          },
          {
            role: "user",
            content: fullMessage,
          },
        ],
        { temperature: 0.7 },
      );

      this._addMessage("assistant", response);
    } catch (error) {
      this._addMessage("assistant", `❌ Error: ${error}`);
    }
  }

  private async _refactorFile(filePath: string, newContent: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    let fullPath: string | null = null;
    for (const folder of workspaceFolders) {
      const possiblePath = path.join(folder.uri.fsPath, filePath);
      if (await fs.pathExists(possiblePath)) {
        fullPath = possiblePath;
        break;
      }
    }

    if (!fullPath) {
      this._addMessage("system", `❌ File not found: ${filePath}`);
      return;
    }

    const document = await vscode.workspace.openTextDocument(fullPath);
    const originalContent = document.getText();

    const apply = await this._showDiffPreview(
      path.basename(filePath),
      originalContent,
      newContent,
    );

    if (apply) {
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(originalContent.length),
      );
      edit.replace(document.uri, fullRange, newContent);
      await vscode.workspace.applyEdit(edit);
      await document.save();
      this._addMessage("system", `✅ Refactored: ${filePath}`);
      await this._scanProject();
    }
  }

  private async _createFile(filePath: string, content: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const fullPath = path.join(workspaceFolders[0].uri.fsPath, filePath);
    const dir = path.dirname(fullPath);

    await fs.ensureDir(dir);
    await fs.writeFile(fullPath, content);

    this._addMessage("system", `✅ Created: ${filePath}`);
    const document = await vscode.workspace.openTextDocument(fullPath);
    await vscode.window.showTextDocument(document);
    await this._scanProject();
  }

  private async _showDiffPreview(
    fileName: string,
    original: string,
    modified: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const panel = vscode.window.createWebviewPanel(
        "diffPreview",
        `Review Changes: ${fileName}`,
        vscode.ViewColumn.Active,
        { enableScripts: true },
      );

      panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 24px;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              color: #e0e0e0;
            }
            h2 { color: #0e83cd; margin-bottom: 16px; }
            .diff-container {
              background: #1e1e2e;
              border-radius: 12px;
              padding: 16px;
              margin: 16px 0;
              font-family: monospace;
              font-size: 13px;
              overflow-x: auto;
              max-height: 500px;
              overflow-y: auto;
            }
            .diff-line { font-family: monospace; line-height: 1.5; white-space: pre; }
            .diff-removed { background: #ffebee; color: #c62828; }
            .diff-added { background: #e8f5e9; color: #2e7d32; }
            .diff-context { color: #888; }
            .button-container { display: flex; gap: 12px; margin-top: 20px; }
            button {
              padding: 10px 20px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              transition: all 0.2s;
            }
            .apply { background: linear-gradient(135deg, #0e83cd 0%, #0a6eae 100%); color: white; }
            .cancel { background: #3d3d3d; color: #e0e0e0; }
            .stats { font-size: 12px; color: #ffcc66; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h2>📝 Review Changes for ${fileName}</h2>
          <div class="diff-container">
            ${this._generateDiffHtml(original, modified)}
          </div>
          <div class="button-container">
            <button id="applyBtn" class="apply">✅ Apply Changes</button>
            <button id="cancelBtn" class="cancel">❌ Cancel</button>
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('applyBtn').onclick = () => vscode.postMessage({ command: 'apply' });
            document.getElementById('cancelBtn').onclick = () => vscode.postMessage({ command: 'cancel' });
          <\/script>
        </body>
        </html>
      `;

      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.command === "apply") {
          panel.dispose();
          resolve(true);
        } else {
          panel.dispose();
          resolve(false);
        }
      });
    });
  }

  private _generateDiffHtml(original: string, modified: string): string {
    const originalLines = original.split("\n");
    const modifiedLines = modified.split("\n");
    let html = "";
    let added = 0,
      removed = 0;

    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    for (let i = 0; i < maxLines; i++) {
      const orig = originalLines[i] || "";
      const mod = modifiedLines[i] || "";

      if (orig !== mod) {
        if (orig && !mod) {
          html += `<div class="diff-line diff-removed">- ${this._escapeHtml(orig)}</div>`;
          removed++;
        } else if (!orig && mod) {
          html += `<div class="diff-line diff-added">+ ${this._escapeHtml(mod)}</div>`;
          added++;
        } else {
          html += `<div class="diff-line diff-removed">- ${this._escapeHtml(orig)}</div>`;
          html += `<div class="diff-line diff-added">+ ${this._escapeHtml(mod)}</div>`;
          removed++;
          added++;
        }
      } else {
        html += `<div class="diff-line diff-context">  ${this._escapeHtml(orig)}</div>`;
      }
    }

    return `<div class="stats">📊 ${added} additions, ${removed} deletions</div>${html}`;
  }

  private _escapeHtml(str: string): string {
    return str.replace(/[&<>]/g, function (m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    });
  }

  private async _applyCodeToEditor(code: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor");
      return;
    }

    await editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, code);
    });

    this._addMessage("system", "✅ Code applied!");
  }

  private async _sendCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this._addMessage("system", "❌ No file open.");
      return;
    }

    const code = editor.document.getText();
    const fileName = editor.document.fileName;
    this._sendToAI(
      `Please analyze this file:\n\n**File:** ${fileName}\n\`\`\`typescript\n${code}\n\`\`\``,
    );
  }

  private async _analyzeCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this._addMessage("system", "❌ No file open.");
      return;
    }

    const code = editor.document.getText();
    const fileName = editor.document.fileName;
    this._sendToAI(
      `Please review ${fileName} for bugs, improvements, and best practices:\n\`\`\`typescript\n${code}\n\`\`\``,
    );
  }

  private async _suggestFixForSelection() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      this._addMessage("system", "❌ Please select some code first");
      return;
    }

    this._sendToAI(
      `Please review and fix this code:\n\`\`\`typescript\n${selectedText}\n\`\`\``,
    );
  }

  private _updateWebview() {
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .toolbar {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(14, 131, 205, 0.3);
          }
          .toolbar button {
            background: #2d2d3d;
            border: 1px solid rgba(14, 131, 205, 0.3);
            border-radius: 10px;
            padding: 8px 16px;
            color: #e0e0e0;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
          }
          .toolbar button:hover {
            background: #3d3d4d;
            border-color: #0e83cd;
          }
          .chat-container {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .message {
            padding: 14px 18px;
            border-radius: 18px;
            max-width: 85%;
            word-wrap: break-word;
          }
          .message-user {
            background: #0e83cd;
            color: white;
            align-self: flex-end;
          }
          .message-assistant {
            background: #2d2d3d;
            border-left: 4px solid #0e83cd;
            align-self: flex-start;
          }
          .message-system {
            background: rgba(255, 204, 102, 0.1);
            color: #ffcc66;
            align-self: center;
            font-size: 12px;
            text-align: center;
          }
          .message pre {
            background: #1a1a2e;
            padding: 14px;
            border-radius: 10px;
            overflow-x: auto;
            margin: 10px 0;
            font-family: monospace;
            font-size: 12px;
          }
          .timestamp { font-size: 10px; opacity: 0.5; margin-top: 8px; }
          .input-container {
            display: flex;
            gap: 12px;
            border-top: 1px solid rgba(14, 131, 205, 0.3);
            padding-top: 20px;
          }
          .input-container textarea {
            flex: 1;
            background: #1e1e2e;
            border: 1px solid rgba(14, 131, 205, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            color: #e0e0e0;
            font-family: inherit;
            resize: none;
            font-size: 13px;
          }
          .input-container textarea:focus {
            outline: none;
            border-color: #0e83cd;
          }
          .input-container button {
            background: #0e83cd;
            border: none;
            border-radius: 12px;
            padding: 0 24px;
            color: white;
            cursor: pointer;
            font-size: 14px;
          }
          .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 12px 18px;
            background: #2d2d3d;
            border-left: 4px solid #0e83cd;
            border-radius: 18px;
            align-self: flex-start;
          }
          .typing-dot {
            width: 8px;
            height: 8px;
            background: #0e83cd;
            border-radius: 50%;
            animation: typing 1.4s infinite;
          }
          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-10px); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button id="scanProjectBtn">📁 Scan Project</button>
          <button id="analyzeFileBtn">📊 Analyze File</button>
          <button id="suggestFixBtn">🔧 Suggest Fix</button>
          <button id="architectureBtn">🏛️ Architecture Review</button>
          <button id="sendFileBtn">📄 Send File</button>
          <button id="clearChatBtn">🗑️ Clear</button>
        </div>
        <div id="chatMessages" class="chat-container">
          <div class="message message-assistant">
            <strong>🧠 GeNext AI Architect</strong><br>
            Click "Scan Project" to index your codebase (fast!). Then ask me to review architecture, find bugs, or suggest improvements.
            <div class="timestamp">Just now</div>
          </div>
        </div>
        <div class="input-container">
          <textarea id="messageInput" rows="2" placeholder="Ask me to review architecture, find bugs, or suggest improvements..."></textarea>
          <button id="sendBtn">Send</button>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          const chatMessages = document.getElementById('chatMessages');
          const messageInput = document.getElementById('messageInput');
          const sendBtn = document.getElementById('sendBtn');
          
          function addMessage(role, content, timestamp) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message message-\${role}\`;
            let formattedContent = content.replace(/\\\`\\\`\\\`(\\w*)\\n([\\s\\S]*?)\\\`\\\`\\\`/g, '<pre><code>$2</code></pre>').replace(/\\n/g, '<br>');
            const name = role === 'user' ? 'You' : role === 'assistant' ? 'GeNext AI' : 'System';
            messageDiv.innerHTML = \`<strong>\${name}</strong><br>\${formattedContent}<div class="timestamp">\${timestamp}</div>\`;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
          
          function showTyping() {
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing';
            typingDiv.className = 'typing-indicator';
            typingDiv.innerHTML = \`<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>\`;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
          
          function hideTyping() {
            const typing = document.getElementById('typing');
            if (typing) typing.remove();
          }
          
          window.addEventListener('message', event => {
            const data = event.data;
            if (data.command === 'addMessage') {
              hideTyping();
              addMessage(data.message.role, data.message.content, data.message.timestamp);
            }
          });
          
          sendBtn.addEventListener('click', () => {
            const text = messageInput.value.trim();
            if (!text) return;
            showTyping();
            vscode.postMessage({ command: 'sendMessage', text });
            messageInput.value = '';
          });
          messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBtn.click(); } });
          document.getElementById('analyzeFileBtn').onclick = () => { showTyping(); vscode.postMessage({ command: 'analyzeFile' }); };
          document.getElementById('scanProjectBtn').onclick = () => { showTyping(); vscode.postMessage({ command: 'scanProject' }); };
          document.getElementById('suggestFixBtn').onclick = () => { showTyping(); vscode.postMessage({ command: 'suggestFix' }); };
          document.getElementById('architectureBtn').onclick = () => { showTyping(); vscode.postMessage({ command: 'architectureReview' }); };
          document.getElementById('sendFileBtn').onclick = () => { showTyping(); vscode.postMessage({ command: 'getCurrentFile' }); };
          document.getElementById('clearChatBtn').onclick = () => { 
            chatMessages.innerHTML = ''; 
            addMessage('assistant', 'Chat cleared!', new Date().toLocaleTimeString()); 
            vscode.postMessage({ command: 'clearHistory' }); 
          };
        </script>
      </body>
      </html>
    `;
  }

  private dispose() {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }
    AIChatPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) disposable.dispose();
    }
  }
}
