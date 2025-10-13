import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from './config';
import EventSource from 'react-native-sse';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ApiChatMessage {
  id?: string;
  content: string;
  type: 'human' | 'ai';
  timestamp?: string;
}

export interface ChatHistoryResponse {
  history: ApiChatMessage[];
  session_id: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatStreamResponse {
  session_id: string;
  message: string;
  type: 'message' | 'message_done';
  send_type: 'human' | 'ai';
}

/**
 * 获取聊天历史记录
 */
export const getChatHistory = async (
  sessionId: string
): Promise<ChatHistoryResponse> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.HISTORY}/${sessionId}`
    );

    if (!response.ok) {
      throw new Error(`获取历史消息失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    throw error;
  }
};

/**
 * 发送聊天消息（SSE流式响应）
 */
export const sendChatMessage = (request: ChatRequest) => {
  // 构建SSE连接URL
  const url = new URL(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.SEND}`);
  // 创建EventSource实例
  const eventSource = new EventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return eventSource;
};

/**
 * 获取当前会话ID
 */
export const getCurrentSessionId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('session_id');
};

export const clearCurrentSessionId = async () => {
  await AsyncStorage.removeItem('session_id');
};

/**
 * 保存会话ID
 */
export const saveSessionId = async (sessionId: string): Promise<void> => {
  await AsyncStorage.setItem('session_id', sessionId);
};

/**
 * 格式化API消息为本地消息格式
 */
export const formatApiMessage = (apiMessage: ApiChatMessage): ChatMessage => {
  return {
    id: apiMessage.id || Date.now().toString() + Math.random(),
    text: apiMessage.content,
    isUser: apiMessage.type === 'human',
    timestamp: new Date(apiMessage.timestamp || Date.now()),
  };
};

/**
 * 解析SSE数据
 */
export const parseSSEData = (
  event: Record<string, any>
): ChatStreamResponse | null => {
  const { data } = event ?? {};

  try {
    const res = JSON.parse(data);
    return {
      ...res,
      isDone: res?.todos?.every((todo) => todo.status === 'done'),
    };
  } catch (error) {
    console.error('解析SSE数据失败:', error);
    return null;
  }
};
