import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from './config';

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
  type: 'human' | 'ai';
}

/**
 * 获取聊天历史记录
 */
export const getChatHistory = async (sessionId: string): Promise<ChatHistoryResponse> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.HISTORY}/${sessionId}`);
    
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
export const sendChatMessage = async (request: ChatRequest): Promise<Response> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT.SEND}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`发送消息失败: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('发送聊天消息失败:', error);
    throw error;
  }
};

/**
 * 获取当前会话ID
 */
export const getCurrentSessionId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('session_id');
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
export const parseSSEData = (line: string): ChatStreamResponse | null => {
  if (!line.startsWith('data: ')) {
    return null;
  }

  const data = line.slice(6);
  
  if (data === '[DONE]') {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('解析SSE数据失败:', error);
    return null;
  }
};