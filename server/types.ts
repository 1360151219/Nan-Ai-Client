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
