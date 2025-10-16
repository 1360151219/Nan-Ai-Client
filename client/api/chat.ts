import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from './config';
import EventSource from 'react-native-sse';
import { getApiPath } from './utils';

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

export interface ChatSession {
  /** session id */
  id: string;
  /** 智能体 id */
  agent_id: string;
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
 * 获取当前用户的所有会话信息
 */
export const getChatSessions = async (
  user_id?: string
): Promise<ChatSession[]> => {
  try {
    const response = await fetch(
      getApiPath(API_ENDPOINTS.USER.SESSIONS, { user_id: user_id || 'root' })
    );

    if (!response.ok) {
      throw new Error(`getChatSessions失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getChatSessions失败:', error);
    throw error;
  }
};

/**
 * 获取当前会话ID
 */
export const getCurrentSessionId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('session_id');
};

export const clearCurrentSessionId = async (): Promise<void> => {
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

/**
 * 保存会话信息
 */
export const saveSessionInfo = async (
  sessionId: string,
  title: string,
  lastMessage: string,
  messageCount: number
): Promise<void> => {
  const sessionInfo = {
    title,
    lastMessage,
    updatedAt: new Date().toISOString(),
    messageCount,
  };
  await AsyncStorage.setItem(
    `session_${sessionId}`,
    JSON.stringify(sessionInfo)
  );
};

/**
 * 获取所有会话
 */
export const getAllSessions = async (): Promise<ChatSession[]> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const sessionKeys = allKeys.filter((key) => key.startsWith('session_'));
    const sessionData = await AsyncStorage.multiGet(sessionKeys);

    const sessions: ChatSession[] = [];
    for (const [key, value] of sessionData) {
      if (value) {
        try {
          const sessionInfo = JSON.parse(value);
          sessions.push({
            id: key.replace('session_', ''),
            title:
              sessionInfo.title ||
              `会话 ${key.replace('session_', '').substring(0, 8)}`,
            lastMessage: sessionInfo.lastMessage,
            updatedAt: new Date(sessionInfo.updatedAt || Date.now()),
            messageCount: sessionInfo.messageCount || 0,
          });
        } catch (error) {
          console.error('解析会话数据失败:', error);
        }
      }
    }

    // 按更新时间排序
    sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return sessions;
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return [];
  }
};
