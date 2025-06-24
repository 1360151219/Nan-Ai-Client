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
export const formatSystemMeesgae = (input: string) => {
  return {
    content: [
      {
        type: MessageType.Text,
        text: input,
      },
    ],
    role: Role.System,
  };
};
export const formatUserMeesgae = (input: string) => {
  return {
    content: [
      {
        type: MessageType.Text,
        text: input,
      },
    ],
    role: Role.User,
  };
};

export const formatAssistantMeesgae = (input: string) => {
  return {
    content: [
      {
        type: MessageType.Text,
        text: input,
      },
    ],
    role: Role.Assistant,
  };
};

export const parseMessage = (msg: Message) => {
  return msg.content
    .map((c: any) => {
      if (c.type === 'text') {
        return c.text;
      }
    })
    .join('\n---\n');
};
