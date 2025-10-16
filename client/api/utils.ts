/**
 * API 工具函数
 */

import { API_CONFIG } from './config';

/**
 * 处理API错误
 */
export class ApiError extends Error {
  public status: number;
  public statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * 检查响应状态
 */
export const checkResponse = (response: Response): Response => {
  if (!response.ok) {
    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText
    );
  }
  return response;
};

/**
 * 重试机制
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
};

/**
 * 创建查询参数
 */
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, String(params[key]));
    }
  });

  return searchParams.toString();
};

/**
 * 延迟函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getApiPath = (
  path: string,
  params: Record<string, any> = {}
): string => {
  return (
    API_CONFIG.BASE_URL + path.replace(/:(\w+)/g, (_, key) => params[key] || '')
  );
};

// 格式化时间
export const formatSimpleChineseTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
};
