/**
 * API 配置
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  CHAT: {
    SEND: '/chat',
    HISTORY: '/chat/history',
  },
};