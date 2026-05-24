// import axios from "axios";

// interface DeepSeekMessage {
//   role: "system" | "user" | "assistant";
//   content: string;
// }

// export class DeepSeekClient {
//   private apiKey: string;
//   private baseURL: string = "https://api.deepseek.com/v1";
//   private model: string = "deepseek-chat";

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async chat(
//     messages: DeepSeekMessage[],
//     options?: { temperature?: number },
//   ): Promise<string> {
//     try {
//       const response = await axios.post(
//         `${this.baseURL}/chat/completions`,
//         {
//           model: this.model,
//           messages: messages,
//           temperature: options?.temperature || 0.7,
//           max_tokens: 4000,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.apiKey}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       return response.data.choices[0].message.content;
//     } catch (error: any) {
//       console.error("DeepSeek API error:", error?.response?.data || error);
//       throw new Error(
//         "Failed to get response from DeepSeek. Check your API key.",
//       );
//     }
//   }

//   async analyzeCode(code: string, fileName: string): Promise<string> {
//     const messages: DeepSeekMessage[] = [
//       {
//         role: "system",
//         content: `You are an expert React/Next.js/TypeScript code reviewer.
//         Analyze the code and provide specific, actionable feedback.
//         Focus on: TypeScript best practices, React patterns, performance, security, readability.
//         Format with clear sections using emojis. Keep responses concise but helpful.`,
//       },
//       {
//         role: "user",
//         content: `File: ${fileName}\n\nCode:\n\`\`\`typescript\n${code}\n\`\`\``,
//       },
//     ];
//     return await this.chat(messages, { temperature: 0.5 });
//   }

//   async generateDocumentation(
//     code: string,
//     componentName: string,
//   ): Promise<string> {
//     const messages: DeepSeekMessage[] = [
//       {
//         role: "system",
//         content: `Generate JSDoc/TSDoc documentation for this code.
//         Include: description, @param for each parameter, @returns, @example.
//         Format as proper JSDoc comments.`,
//       },
//       {
//         role: "user",
//         content: `Component/Function: ${componentName}\n\nCode:\n${code}`,
//       },
//     ];
//     return await this.chat(messages, { temperature: 0.4 });
//   }

//   async findBugs(code: string): Promise<string> {
//     const messages: DeepSeekMessage[] = [
//       {
//         role: "system",
//         content: `Find bugs, edge cases, and logical errors in this code.
//         For each issue: severity (🔴 Critical/🟡 High/🟢 Low), description, suggested fix.
//         Format in markdown with bullet points.`,
//       },
//       {
//         role: "user",
//         content: code,
//       },
//     ];
//     return await this.chat(messages, { temperature: 0.3 });
//   }

//   async explainCode(code: string): Promise<string> {
//     const messages: DeepSeekMessage[] = [
//       {
//         role: "system",
//         content: `Explain this code in simple terms.
//         Break down: what it does, how it works step by step, why patterns are used.
//         Use analogies and simple language. Keep it under 500 words.`,
//       },
//       {
//         role: "user",
//         content: code,
//       },
//     ];
//     return await this.chat(messages, { temperature: 0.6 });
//   }

//   async refactorCode(code: string, targetPattern: string): Promise<string> {
//     const messages: DeepSeekMessage[] = [
//       {
//         role: "system",
//         content: `Refactor this code to use ${targetPattern} pattern.
//         Keep the same functionality but improve structure.
//         Return ONLY the refactored code, no explanations.`,
//       },
//       {
//         role: "user",
//         content: code,
//       },
//     ];
//     return await this.chat(messages, { temperature: 0.4 });
//   }
// }
import * as vscode from "vscode";
import axios from "axios";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class DeepSeekClient {
  private apiKey: string;
  private baseURL: string = "https://api.deepseek.com/v1";
  private model: string = "deepseek-chat";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(
    messages: DeepSeekMessage[],
    options?: { temperature?: number },
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          temperature: options?.temperature || 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error("DeepSeek API error:", error?.response?.data || error);
      throw new Error(
        "Failed to get response from DeepSeek. Check your API key.",
      );
    }
  }

  async analyzeCode(code: string, fileName: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: `You are an expert React/Next.js/TypeScript code reviewer. 
        Analyze the code and provide specific, actionable feedback.
        Focus on: TypeScript best practices, React patterns, performance, security, readability.
        Format with clear sections using emojis. Keep responses concise but helpful.`,
      },
      {
        role: "user",
        content: `File: ${fileName}\n\nCode:\n\`\`\`typescript\n${code}\n\`\`\``,
      },
    ];
    return await this.chat(messages, { temperature: 0.5 });
  }

  async generateDocumentation(
    code: string,
    componentName: string,
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: `Generate JSDoc/TSDoc documentation for this code.
        Include: description, @param for each parameter, @returns, @example.
        Format as proper JSDoc comments.`,
      },
      {
        role: "user",
        content: `Component/Function: ${componentName}\n\nCode:\n${code}`,
      },
    ];
    return await this.chat(messages, { temperature: 0.4 });
  }

  async findBugs(code: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: `Find bugs, edge cases, and logical errors in this code.
        For each issue: severity (🔴 Critical/🟡 High/🟢 Low), description, suggested fix.
        Format in markdown with bullet points.`,
      },
      {
        role: "user",
        content: code,
      },
    ];
    return await this.chat(messages, { temperature: 0.3 });
  }

  async explainCode(code: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: `Explain this code in simple terms.
        Break down: what it does, how it works step by step, why patterns are used.
        Use analogies and simple language. Keep it under 500 words.`,
      },
      {
        role: "user",
        content: code,
      },
    ];
    return await this.chat(messages, { temperature: 0.6 });
  }

  async refactorCode(code: string, targetPattern: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: `Refactor this code to use ${targetPattern} pattern.
        Keep the same functionality but improve structure.
        Return ONLY the refactored code, no explanations.`,
      },
      {
        role: "user",
        content: code,
      },
    ];
    return await this.chat(messages, { temperature: 0.4 });
  }
}

// ==================== ADD THIS SECTION ====================
let deepseekClient: DeepSeekClient | null = null;

export async function getDeepSeekClient(): Promise<DeepSeekClient | null> {
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
    } else {
      return null;
    }
  }

  if (!deepseekClient) {
    deepseekClient = new DeepSeekClient(apiKey);
  }
  return deepseekClient;
}
