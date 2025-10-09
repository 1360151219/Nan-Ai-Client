/**
 * 应用文本常量定义
 * 集中管理所有UI文本，便于国际化扩展
 */

export const Messages = {
  // 应用信息
  app: {
    name: 'AI智能助手',
    version: '1.0.0',
  },

  // 通用文本
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    loading: '加载中...',
    error: '出错了',
    retry: '重试',
    success: '成功',
    search: '搜索',
    clear: '清空',
    done: '完成',
  },

  // 导航标签
  tabs: {
    chat: 'AI助手',
    knowledge: '知识库',
    search: '搜索',
    profile: '我的',
  },

  // AI对话页面
  chat: {
    title: 'AI智能助手',
    placeholder: '输入您的问题...',
    send: '发送',
    thinking: 'AI正在思考...',
    typing: '正在输入...',
    newChat: '新对话',
    chatHistory: '聊天记录',
    clearHistory: '清空聊天记录',
    confirmClear: '确定要清空所有聊天记录吗？',
  },

  // 知识库页面  
  knowledge: {
    title: '知识库',
    upload: '上传文档',
    myDocuments: '我的文档',
    recent: '最近上传',
    categories: '分类',
    noDocuments: '暂无文档',
    uploadSuccess: '文档上传成功',
    uploadFailed: '文档上传失败',
    processing: '正在处理...',
    processed: '处理完成',
    failed: '处理失败',
  },

  // 搜索页面
  search: {
    title: '搜索',
    placeholder: '搜索文档和对话...',
    recentSearch: '最近搜索',
    noResults: '未找到相关结果',
    suggestions: '搜索建议',
  },

  // 个人中心页面
  profile: {
    title: '个人中心',
    usage: '使用统计',
    chatCount: '对话次数',
    documentCount: '文档数量',
    storageUsed: '已用存储',
    settings: '设置',
    help: '帮助',
    feedback: '反馈',
    about: '关于',
    privacy: '隐私设置',
  },

  // 设置页面
  settings: {
    title: '设置',
    general: '通用设置',
    theme: '主题模式',
    language: '语言',
    fontSize: '字体大小',
    notifications: '通知设置',
    privacy: '隐私设置',
    storage: '存储管理',
    about: '关于应用',
  },

  // 引导页面
  onboarding: {
    welcome: '欢迎使用 AI助手',
    feature1Title: '智能对话',
    feature1Desc: '与AI进行自然对话，获得智能回答',
    feature2Title: '知识管理',
    feature2Desc: '上传文档，构建个人知识库',
    feature3Title: '智能搜索',
    feature3Desc: '快速搜索文档内容和对话记录',
    getStarted: '开始使用',
    skip: '跳过',
  },

  // 错误消息
  errors: {
    networkError: '网络连接失败，请检查网络设置',
    uploadError: '文件上传失败，请重试',
    parseError: '文件解析失败，请检查文件格式',
    saveError: '保存失败，请重试',
    loadError: '加载失败，请重试',
    permissionError: '权限不足，请检查应用权限设置',
  },
} as const;