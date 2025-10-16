# 移动端AI对话APP - 项目结构文档

## 项目概述
这是一个移动端AI对话应用程序，采用前后端分离架构，包含三个主要组件：
- **client**: React Native移动端应用（Expo框架）
- **py_server**: Python后端服务（FastAPI + LangGraph）

## 技术栈

### 前端 (client/)
- **框架**: React Native + Expo
- **路由**: Expo Router
- **状态管理**: React Hooks
- **UI组件**: 自定义组件 + React Native基础组件
- **网络通信**: SSE (Server-Sent Events)
- **存储**: AsyncStorage
- **语言**: TypeScript

### Python后端 (py_server/)
- **框架**: FastAPI
- **AI框架**: LangGraph + LangChain
- **数据库**: MongoDB (会话存储)
- **LLM**: OpenAI API
- **语言**: Python 3.12+

## 项目结构详解

### 前端结构 (client/)
```
client/
├── app/                          # 应用主页面
│   ├── _layout.tsx              # 根布局组件
│   ├── index.tsx                # 聊天主界面
│   ├── onboarding.tsx           # 引导页面
│   └── splash.tsx               # 启动页面
├── api/                         # API接口层
│   ├── chat.ts                  # 聊天相关API
│   ├── config.ts                # API配置
│   ├── index.ts                 # API导出
│   └── utils.ts                 # API工具函数
├── components/                  # 可复用组件
│   ├── SafeAreaContainer.tsx    # 安全区域容器
│   ├── external-link.tsx        # 外部链接组件
│   ├── haptic-tab.tsx          # 触觉反馈标签
│   ├── hello-wave.tsx          # 欢迎动画
│   ├── parallax-scroll-view.tsx # 视差滚动视图
│   ├── themed-text.tsx         # 主题文本组件
│   ├── themed-view.tsx         # 主题视图组件
│   └── ui/                     # UI组件库
├── constants/                   # 常量定义
│   ├── Colors.ts               # 颜色主题
│   ├── Layout.ts               # 布局常量
│   ├── Messages.ts             # 消息常量
│   └── theme.ts                # 主题配置
├── hooks/                       # 自定义Hooks
│   ├── use-color-scheme.ts     # 颜色方案
│   ├── use-color-scheme.web.ts # Web颜色方案
│   └── use-theme-color.ts      # 主题颜色
├── types/                       # TypeScript类型定义
│   ├── chat.ts                 # 聊天相关类型
│   ├── document.ts             # 文档类型
│   ├── index.ts                # 类型导出
│   └── navigation.ts           # 导航类型
└── assets/                      # 静态资源
    └── images/                  # 图片资源
```

### Python后端结构 (py_server/)
```
py_server/
├── src/                        # 源代码目录
│   ├── agents/                # AI智能体
│   │   ├── planner.py        # 规划智能体
│   │   ├── researcher.py     # 研究智能体
│   │   ├── run_agent.py      # 智能体运行器
│   │   └── supervisor.py     # 监督智能体
│   ├── config/               # 配置目录
│   ├── coze/                 # Coze平台集成
│   │   ├── app.py           # Coze应用
│   │   └── rag.py           # RAG功能
│   ├── db/                   # 数据库相关
│   │   ├── mongodb.py       # MongoDB连接
│   │   ├── user_api.py      # 用户API
│   │   └── user_model.py    # 用户模型
│   ├── graph/                # 图结构定义
│   │   └── builder.py       # 图构建器
│   ├── modals/               # 数据模型
│   │   └── chat_modal.py    # 聊天模型
│   ├── prompts/              # 提示词模板
│   │   ├── apply.py         # 应用提示词
│   │   └── templates/       # 提示词模板库
│   ├── tools/                # 工具函数
│   │   ├── search.py        # 搜索工具
│   │   └── update_state.py  # 状态更新工具
│   └── utils/                # 工具类
│       └── main.py          # 主工具函数
├── main.py                   # FastAPI主入口
├── langgraph.json           # LangGraph配置
└── Dockerfile               # Docker配置
```