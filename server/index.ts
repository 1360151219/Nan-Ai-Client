import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { MCPClient } from './mcp_client';
import dotenv from 'dotenv';
import path from 'path';
import { sendRetrievalRequest } from './utils';
// 单独配环境变量路径
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});
/**
 * 路由处理接口定义
 */
interface RouteHandler {
  (props: { data: Record<string, any>; req: IncomingMessage; res: ServerResponse }): Promise<void>;
}

/**
 * 路由配置接口
 */
interface RouteConfig {
  path: string;
  method: string;
  handler: RouteHandler;
}

/**
 * 简单HTTP服务器类
 * 功能：创建服务器实例并提供基础接口
 */
class SimpleHTTPServer {
  private server: http.Server;
  private port: number;
  private mcpClient: MCPClient | null;
  private routes: RouteConfig[];

  /**
   * 构造函数
   * @param port - 服务器监听端口，默认3000
   */
  constructor(port: number = 3000) {
    this.routes = [];
    this.mcpClient = null;
    this.port = port;
    this.server = http.createServer(this.handleRequest.bind(this));
    this.initialize();
  }

  /**
   * 注册路由
   * @param path - 路由路径
   * @param method - HTTP方法
   * @param handler - 处理函数
   */
  private registerRoute(path: string, method: string, handler: RouteHandler): void {
    this.routes.push({
      path,
      method: method.toUpperCase(),
      handler,
    });
  }

  /**
   * 处理请求分发
   */
  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    console.log('req incoming，', req.url, req.method);

    // 路由匹配
    const matchedRoute = this.routes.find((route) => req.url?.startsWith(route.path) && req.method === route.method);

    if (matchedRoute) {
      let requestBody = '';
      // 收集请求体数据
      req.on('data', (chunk: Buffer) => {
        requestBody += chunk.toString();
        // 防止请求体过大
        if (requestBody.length > 1e6) {
          res.statusCode = 413;
          res.end(JSON.stringify({ error: '请求体过大' }));
          req.destroy();
        }
      });
      req.on('end', async () => {
        try {
          // 解析JSON格式请求体
          const requestData = JSON.parse(requestBody) as Record<string, any>;
          matchedRoute.handler({ data: requestData, res, req }).catch((error) => {
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                status_code: 1,
                error: '服务器内部错误',
                details: error instanceof Error ? error.message : String(error),
              })
            );
          });
          return;
        } catch (error) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              status_code: 1,
              error: '请求格式错误或解析失败',
              details: error instanceof Error ? error.message : String(error),
            })
          );
        }
      });
      return;
    }

    // 404处理
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        status_code: 1,
        error: '接口未找到',
        path: req.url,
        method: req.method,
      })
    );
  }

  /**
   * 初始化服务器
   */
  private initialize(): void {
    this.mcpClient = new MCPClient();
    // 注册路由
    this.registerRoute('/api/chat', 'POST', this.handleChatRequest.bind(this));
    this.registerRoute('/api/retrieval', 'POST', this.handleRetrievalRequest.bind(this));
  }

  /**
   * 处理聊天请求的回调函数
   * @param req - 请求对象
   * @param res - 响应对象
   */
  private async handleChatRequest({ data, req, res }: Parameters<RouteHandler>['0']) {
    const response = await this.mcpClient?.handleMessage(data?.query || '');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status_code: 0,
        data: response || '处理成功',
      })
    );
  }

  private async handleRetrievalRequest({ data, req, res }: Parameters<RouteHandler>['0']) {
    const response = await sendRetrievalRequest(data?.query || '');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status_code: 0,
        data: response || '处理成功',
      })
    );
  }

  /**
   * 启动服务器
   */
  start(): void {
    this.server.listen(this.port, () => {
      console.log(`服务器已启动，监听端口：${this.port}，正在链接MCP Server......`);
    });
  }
}

// 创建服务器实例并启动
const server = new SimpleHTTPServer(3000);
server.start();

// 导出服务器实例供外部使用（如果需要）
export default server;
