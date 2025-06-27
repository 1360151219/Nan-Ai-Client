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

/**
 * 发送检索请求到指定API端点
 * @param question - 用户的问题
 * @param datasetIds - 数据集ID数组
 * @param documentIds - 文档ID数组
 * @param maxRetries - 最大重试次数，默认为3
 * @returns 返回API响应数据，失败时返回null
 */
export async function sendRetrievalRequest(
  question: string,
  datasetIds = ['6cbe3fe2518d11f0b2db56f2cbbe91c0'],
  documentIds?: string[],
  maxRetries = 3
) {
  const url = process.env.RAGFLOW_URL;

  if (!url) {
    console.error('RETRIEVAL_URL environment variable is not set');
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.RAGFLOW_API_KEY}`,
  };

  const data = {
    question,
    dataset_ids: datasetIds,
    document_ids: documentIds,
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(`${url}/api/v1/retrieval`, data, { headers });
      return response.data.data;
    } catch (e) {
      console.error(`Attempt ${attempt + 1} failed:`, e);
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  return null;
}
