import { spawn, ChildProcess } from 'child_process';
import { createInterface } from 'readline';
import { Message, Tool } from './types';
import { buildSystemPrompt } from './prompt';
import { formatAssistantMeesgae, formatUserMeesgae, sendModelRequest } from './utils';

const ServerConfig = {
  filesystem: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', __dirname],
  },
};
/**
 * MCP Server Tool
 * @example
 * ```js
 * {
    name: 'read_file',
    description: 'Read the complete contents of a file from the file system. Handles various text encodings and provides detailed error messages if the file cannot be read. Use this tool when you need to examine the contents of a single file. Only works within allowed directories.',
    inputSchema: {
      type: 'object',
      properties: [Object],
      required: [Array],
      additionalProperties: false,
      '$schema': 'http://json-schema.org/draft-07/schema#',
    },
  }
  ```
 */

export class MCPClient {
  private clientInfo: {
    name: string;
    version: string;
  };
  private childProcess?: ChildProcess; // 使用 definite assignment assertion
  private chatHistory: Message[];
  private systemPrompt: string;
  private timeout: number;
  private requestId: number;
  private requestStack: Map<number, (erorr: any, result: any) => void>;
  private requestAbortController?: AbortController;
  private tools: Tool[];

  constructor(timeout: number = 30000) {
    this.clientInfo = {
      name: 'mcp-client',
      version: '1.0.0',
    };
    this.chatHistory = [];
    this.systemPrompt = '';
    this.requestId = 1;
    this.requestStack = new Map();
    this.timeout = timeout;
    this.tools = [];
    this.initialize();
    process.on('exit', () => this.close());
  }

  private async initialize() {
    const { command, args } = ServerConfig.filesystem;
    this.childProcess = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'inherit'], // stdin, stdout, stderr 均通过管道通信
    });

    if (!this.childProcess) {
      throw new Error('Failed to connect MCP Server：' + command);
    }

    const rl = createInterface({
      input: this.childProcess.stdout!,
      output: this.childProcess.stdin!,
      terminal: false,
    });

    rl.on('line', (line: string) => this.handleMcpMessage(Buffer.from(line)));

    this.childProcess.on('exit', (code: number) => {
      console.log(`MCP Server process exited with code ${code}`);
      rl.close();
    });

    await this.sendMcpRequest({
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: {
            listChanged: true,
          },
          sampling: {},
        },
        clientInfo: this.clientInfo,
      },
    });

    console.log('MCP Server initialized~');
    const toolsResult = await this.sendMcpRequest({
      method: 'tools/list',
    });
    this.tools = toolsResult.tools;

    const { systemPrompt, chatHistory } = buildSystemPrompt(this.tools);
    this.chatHistory = chatHistory;
    this.systemPrompt = systemPrompt;
  }

  /**
   * 
   * 
   * // 失败案例
   ```js
  jsonrpc: '2.0',
  id: 1,
  error: {
    code: -32603,
    message: '[\n' +
      '  {\n' +
      '    "code": "invalid_type",\n' +
      '    "expected": "object",\n' +
      '    "received": "undefined",\n' +
      '    "path": [\n' +
      '      "params"\n' +
      '    ],\n' +
      '    "message": "Required"\n' +
      '  }\n' +
      ']'
  }
}
  ```

  // 成功案例
```
 {
  result: {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    serverInfo: { name: 'secure-filesystem-server', version: '0.2.0' }
  },
  jsonrpc: '2.0',
  id: 1
}
  ```
   */
  private handleMcpMessage(data: Buffer): void {
    const response = data.toString().trim();
    try {
      const res = JSON.parse(response); // 移除未使用变量
      const { id, result, error } = res ?? {};
      const cb = this.requestStack.get(id);
      if (!cb) {
        throw new Error('Failed to find callback for response:' + id);
      }
      cb(error, result);
      this.requestStack.delete(id);
    } catch (error) {
      console.error('Failed to parse stdio response:', error, 'Response:', response);
    }
  }

  private sendMcpRequest(request: { method: string; params?: Record<string, any> }): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = this.requestId++;
      const requestData = {
        id: requestId,
        jsonrpc: '2.0',
        method: request.method,
        params: request.params,
      };
      this.requestStack.set(requestId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      const requestStr = JSON.stringify(requestData) + '\n';
      this.childProcess?.stdin?.write(requestStr, (error) => {
        if (error) {
          this.requestStack.delete(requestId);
          reject(error);
        }
      });
    });
  }

  private async callLLM(prompt: Message[]) {
    const response = await sendModelRequest(prompt);
    return response;
  }
  /**
   * 处理用户消息
   * @param message 处理用户消息
   */
  public async handleMessage(message: string) {
    if (!message) {
      this.chatHistory.push(formatAssistantMeesgae('请再详细描述一下您的问题哈～'));
      return '';
    }
    this.chatHistory.push(formatUserMeesgae(message));
    const response = await this.callLLM(this.chatHistory);
    console.log('LLM Response:', response);
    return response;
  }

  close(): void {
    this.childProcess?.kill('SIGINT');
    this.childProcess = undefined;
    this.requestAbortController?.abort();
  }
}
