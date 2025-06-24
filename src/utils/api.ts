import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// 创建axios实例，配置基础URL和超时时间
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // 后端服务器地址
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 响应拦截器：统一处理错误和响应格式
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据进行处理
    return response.data;
  },
  (error: AxiosError) => {
    // 统一错误处理
    let errorResponse = {
      status_code: -1,
      data: '',
      error: '未知错误',
    };

    if (error.response) {
      // 服务器返回错误响应
      errorResponse = error.response.data || {
        status_code: error.response.status,
        error: `服务器错误: ${error.response.statusText}`,
      };
    } else if (error.request) {
      // 请求已发送但未收到响应
      errorResponse = {
        status_code: -1,
        error: '网络错误，未收到服务器响应',
      };
    } else {
      // 请求配置错误
      errorResponse = {
        status_code: -2,
        error: `请求失败: ${error.message}`,
      };
    }

    // 可以在这里添加全局错误提示，如弹窗或日志
    console.error('API请求错误:', errorResponse);

    // 返回标准化的错误响应
    return Promise.resolve(errorResponse);
  }
);

/**
 * 聊天消息请求参数接口定义
 */
interface ChatRequest {
  query: string; // 用户发送的消息内容
  [key: string]: any; // 允许其他额外参数
}

/**
 * 聊天消息响应结果接口定义
 */
interface ChatResponse {
  status_code: number; // 状态码，0表示成功
  data: string; // 大模型返回的响应内容
  error?: string; // 错误信息，状态码非0时存在
}

/**
 * 发送聊天消息到后端接口
 * @param requestData - 包含用户消息的请求对象
 * @returns Promise<ChatResponse> - 后端返回的响应结果
 */
async function sendChatMessage(requestData: ChatRequest) {
  // 移除try/catch，错误处理由拦截器统一管理
  return await apiClient.post<ChatResponse>('/api/chat', requestData);
}

// 导出API函数供其他组件使用
export { sendChatMessage, type ChatRequest, type ChatResponse };
