# API 模块说明

## 目录结构

```
api/
├── chat.ts          # 聊天相关API
├── config.ts        # API配置
├── utils.ts         # API工具函数
├── index.ts         # 模块导出
└── README.md        # 说明文档
```

## 使用方法

### 1. 导入API模块

```typescript
import {
  getChatHistory,
  sendChatMessage,
  getCurrentSessionId,
  saveSessionId,
} from '@/api';
```

### 2. 获取聊天历史

```typescript
const history = await getChatHistory(sessionId);
```

### 3. 发送聊天消息

```typescript
const response = await sendChatMessage({
  message: '你好',
  session_id: 'session-123'
});
```

### 4. 管理会话ID

```typescript
// 获取当前会话ID
const sessionId = await getCurrentSessionId();

// 保存会话ID
await saveSessionId('new-session-id');
```

## API配置

在 `config.ts` 中可以修改以下配置：

- `BASE_URL`: API基础地址
- `TIMEOUT`: 请求超时时间
- `RETRY_COUNT`: 重试次数
- `RETRY_DELAY`: 重试延迟时间

## 错误处理

所有API函数都包含错误处理，会自动记录错误并抛出异常。

## 类型定义

提供了完整的TypeScript类型定义，包括：

- `ChatMessage`: 聊天消息类型
- `ApiChatMessage`: API返回的消息格式
- `ChatHistoryResponse`: 历史记录响应格式
- `ChatRequest`: 发送消息请求格式
- `ChatStreamResponse`: SSE流响应格式