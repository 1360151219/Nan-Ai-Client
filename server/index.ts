import { spawn, ChildProcess } from 'child_process';
import { createInterface } from 'readline';

const ServerConfig = {
  filesystem: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Applications/workplace/Nan-Ai-Client'],
  },
};

export class MCPClient {
  private childProcess?: ChildProcess; // 使用 definite assignment assertion
  private timeout: number;
  private requestAbortController?: AbortController;

  constructor(timeout: number = 30000) {
    this.timeout = timeout;
    this.initializeStdioConnection();
    process.on('exit', () => this.close());
  }

  private initializeStdioConnection(): void {
    const { command, args } = ServerConfig.filesystem;
    this.childProcess = spawn(command, args);
    if (!this.childProcess.stdout) throw new Error('Failed to create stdout stream');
    if (!this.childProcess.stdin) throw new Error('Failed to create stdin stream');
    if (!this.childProcess.stderr) throw new Error('Failed to create stderr stream');
    const rl = createInterface({
      input: this.childProcess.stdout!,
      output: this.childProcess.stdin,
      terminal: false,
    });

    rl.on('line', (line: string) => this.handleStdioData(Buffer.from(line)));

    this.childProcess.on('error', (error: Error) => {
      console.error('Failed to start MCP Server:', error);
    });

    this.childProcess.on('close', (code: number) => {
      console.log(`MCP Server process exited with code ${code}`);
      this.childProcess = undefined;
    });
  }

  private handleStdioData(data: Buffer): void {
    const response = data.toString().trim();
    try {
      JSON.parse(response); // 移除未使用变量
    } catch (error) {
      console.error('Failed to parse stdio response:', error, 'Response:', response);
    }
  }

  close(): void {
    this.childProcess?.kill('SIGINT');
    this.childProcess = undefined;
    this.requestAbortController?.abort();
  }
}
