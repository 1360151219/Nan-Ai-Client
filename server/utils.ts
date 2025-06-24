import axios from 'axios';
import { MessageType, Role, Message } from './types';

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

export async function sendModelRequest(prompt: Message[], maxRetries = 3, temperature = 0.8) {
  const url = process.env.LLM_URL;

  const headers = {
    'Agw-Js-Conv': 'str',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.API_KEY}`,
  };

  const data = {
    model: process.env.MODEL,
    messages: prompt,
  };
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(url, data, { headers });
      try {
        const jsonResponse = response.data.choices[0].message.content;
        return jsonResponse;
      } catch (e) {
        console.log('JSON 解析失败:', e);
        continue;
      }
    } catch (e) {
      console.error(e);
      console.log(`Attempt ${attempt + 1} failed:`, e, 'Retrying...');
      // 等待 2 秒后重试
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('All attempts failed.');
  return null;
}
