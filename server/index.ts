import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { MCPClient } from './mcp_client';
import dotenv from 'dotenv';
import path from 'path';
// 单独配环境变量路径
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

/**
 * 简单HTTP服务器类
 * 功能：创建服务器实例并提供基础接口
 */
class SimpleHTTPServer {
  private server: http.Server;
  private port: number;
  private mcpClient: MCPClient | null;

  /**
   * 构造函数
   * @param port - 服务器监听端口，默认3000
   */
  constructor(port: number = 3000) {
    this.mcpClient = null;
    this.port = port;
    this.server = http.createServer(this.handleRequest.bind(this));
    this.initialize();
  }

  /**
   * 请求处理函数
   * @param req - 客户端请求对象
   * @param res - 服务器响应对象
   */
  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    // 设置响应头：允许跨域和JSON格式
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 根路径接口
    if (req.url === '/' && req.method === 'GET') {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          message: '欢迎使用简单HTTP服务器',
          status: 'running',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // 测试接口：返回请求信息
    if (req.url?.startsWith('/api/chat') && req.method === 'POST') {
      res.statusCode = 200;
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
      // 数据接收完成后处理
      req.on('end', async () => {
        try {
          // 解析JSON格式请求体
          const requestData = JSON.parse(requestBody) as Record<string, any>;

          // 处理业务逻辑
          const response = await this.mcpClient?.handleMessage(requestData?.query || '');
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              status_code: 0,
              data: response || '处理成功',
            })
          );
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
        error: '接口未找到',
        path: req.url || 'unknown',
        method: req.method || 'unknown',
      })
    );
  }

  /**
   * 初始化服务器
   */
  private initialize(): void {
    this.mcpClient = new MCPClient();
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
