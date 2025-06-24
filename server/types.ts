export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export enum Role {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}
export enum MessageType {
  Text = 'text',
}
export interface Message {
  role: Role;
  content: {
    type: MessageType.Text;
    text: string;
  }[];
}

/**
 * 环境变量类型定义
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly API_KEY: string;
      readonly LLM_URL: string;
      readonly MODEL: string;
    }
  }
}

export {};
