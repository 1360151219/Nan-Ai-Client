import React, { useState, useEffect, useRef } from 'react';
import { getAllSessions, getChatSessions, saveSessionInfo } from '@/api/chat';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ChatSession } from '@/api/chat';

interface ChatSidebarProps {
  visible: boolean;
  onClose: () => void;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  messages?: any[];
}

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.8;

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  visible,
  onClose,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // 加载会话列表
  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible]);

  // 动画效果
  useEffect(() => {
    console.log('slideAnim', visible, slideAnim);
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // 获取所有会话
  const loadSessions = async () => {
    try {
      setIsLoading(true);

      // 这里简化处理，实际项目中应该从后端API获取会话列表
      // 目前只显示当前会话ID
      const loadedSessions = await getChatSessions();
      setSessions(loadedSessions);
    } catch (error) {
      console.error('加载会话列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染会话项
  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === currentSessionId;

    return (
      <TouchableOpacity
        key={session.id}
        style={[styles.sessionItem, isActive && styles.activeSession]}
        onPress={() => {
          onSessionSelect(session.id);
          onClose();
        }}
      >
        <View style={styles.sessionContent}>
          <Text style={[styles.sessionTitle, isActive && styles.activeText]}>
            {session.id}
          </Text>
          {/* {session.lastMessage && (
            <Text
              style={[styles.sessionMessage, isActive && styles.activeText]}
              numberOfLines={1}
            >
              {session.lastMessage}
            </Text>
          )}
          <View style={styles.sessionMeta}>
            <Text style={[styles.sessionTime, isActive && styles.activeText]}>
              {session.updatedAt}
            </Text>
            {session.messageCount > 0 && (
              <Text
                style={[styles.messageCount, isActive && styles.activeText]}
              >
                {session.messageCount}条消息
              </Text>
            )}
          </View> */}
        </View>
        {isActive && (
          <View style={styles.activeIndicator}>
            <View style={styles.activeDot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 不使用条件渲染，而是通过动画控制显示/隐藏，确保关闭动画能够完整执行

  return (
    <View
      style={{
        ...styles.container,
        ...{
          pointerEvents: visible ? 'auto' : 'none',
        },
      }}
    >
      {/* 遮罩层 */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
            pointerEvents: visible ? 'auto' : 'none',
          },
        ]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
      </Animated.View>

      {/* 侧边栏 */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>会话列表</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* 新建会话按钮 */}
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={() => {
            onNewSession();
            onClose();
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={Colors.textSecondary}
          />
          <Text style={styles.newSessionText}>新建会话</Text>
        </TouchableOpacity>

        {/* 会话列表 */}
        <ScrollView style={styles.sessionList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.textSecondary} />
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>暂无会话</Text>
              <Text style={styles.emptySubtext}>开始一个新的对话吧</Text>
            </View>
          ) : (
            sessions.map(renderSessionItem)
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    margin: 15,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newSessionText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.border,
    fontWeight: '500',
  },
  sessionList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sessionItem: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeSession: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sessionMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  messageCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activeText: {
    color: '#FFFFFF',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default ChatSidebar;
