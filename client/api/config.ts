/**
 * API 配置
 */

export const API_CONFIG = {
  BASE_URL: 'http://121.40.211.85:8000/api',
  // BASE_URL: 'http://192.168.18.219:8000/api',
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
  USER: {
    SESSIONS: '/user/sessions/:user_id',
  },
};
