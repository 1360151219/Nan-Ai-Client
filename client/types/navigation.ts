// 导航类型定义
export type RootStackParamList = {
  splash: undefined;
  onboarding: undefined;
  MainTabs: undefined;
  // 文档相关页面
  DocumentUpload: undefined;
  DocumentDetail: {
    document: {
      id: string;
      title: string;
      type: string;
      lastModified: string;
      readTime: string;
      category: string;
    };
  };
  // 设置相关页面  
  Settings: undefined;
  PrivacySettings: undefined;
  Help: undefined;
  Feedback: undefined;
  // 搜索页面
  Search: undefined;
};

export type MainTabParamList = {
  Chat: undefined;
  Knowledge: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}