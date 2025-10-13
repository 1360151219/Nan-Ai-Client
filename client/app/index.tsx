import { SafeAreaContainer } from '@/components/SafeAreaContainer';
import {
  formatApiMessage,
  getChatHistory,
  getCurrentSessionId,
  parseSSEData,
  saveSessionId,
  sendChatMessage,
} from '@/api/chat';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import type { ChatMessage } from '@/types/chat';
import type { MainTabParamList } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = NativeStackScreenProps<MainTabParamList, 'Chat'>;

const { width } = Dimensions.get('window');

interface TypingIndicatorProps {
  visible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const animateSequence = () => {
        const timing = (dot: Animated.Value, delay: number) =>
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              useNativeDriver: false,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 600,
              useNativeDriver: false,
            }),
          ]);

        Animated.loop(
          Animated.parallel([
            timing(dot1, 0),
            timing(dot2, 200),
            timing(dot3, 400),
          ])
        ).start();
      };
      animateSequence();
    }
  }, [visible, dot1, dot2, dot3]);

  if (!visible) return null;

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
      <Text style={styles.typingText}>AI 正在思考...</Text>
    </View>
  );
};

const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '你好！我是你的AI助手，有什么可以帮助你的吗？',
      isUser: false,
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // 获取历史消息
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);

        // 获取会话ID
        const sessionId = await getCurrentSessionId();
        if (!sessionId) {
          setIsLoadingHistory(false);
          return;
        }

        // 请求历史消息
        const historyData = await getChatHistory(sessionId);

        if (historyData.history && historyData.history.length > 0) {
          // 转换历史消息格式
          const formattedMessages: ChatMessage[] =
            historyData.history.map(formatApiMessage);

          // 如果有历史消息，替换默认消息
          if (formattedMessages.length > 0) {
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error('加载历史消息失败:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, []);

  const handleSend = async () => {
    if (message.trim()) {
      setMessage('');
      setIsTyping(true);
      console.log('======start send message========');

      try {
        // 获取当前会话ID
        const sessionId = await getCurrentSessionId();

        // 发送消息并获取SSE响应
        const eventSource = await sendChatMessage({
          message: message.trim(),
          session_id: sessionId || '',
        });

        if (!eventSource) {
          throw new Error('无法读取响应流');
        }

        // 读取SSE流
        eventSource.addEventListener('message', async (event) => {
          try {
            const parsedData = parseSSEData(event);
            console.log('====event', parsedData);
            const { type, send_type, session_id, message } = parsedData ?? {};
            if (type === 'message_done') {
              setIsTyping(false);
              eventSource.removeAllEventListeners();
              eventSource.close();
              return;
            }
            if (type === 'message') {
              // 保存会话ID
              if (session_id) {
                await saveSessionId(session_id);
              }

              // 添加新消息
              const newMessage: ChatMessage = {
                id: (Date.now() + Math.random()).toString(),
                text: message || '',
                isUser: send_type === 'human',
                timestamp: new Date(),
              };

              setMessages((prev) => [...prev, newMessage]);
            }
          } catch (error) {
            console.error('读取SSE流失败:', error);
            // 添加错误消息
            const errorMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              text: '抱歉，我遇到了一些问题，请稍后再试。',
              isUser: false,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        });
        eventSource.addEventListener('close', () => {
          eventSource.removeAllEventListeners();
          eventSource.close();
        });
      } catch (error) {
        console.error('发送消息失败:', error);
        setIsTyping(false);

        // 添加错误消息
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: '抱歉，连接服务器失败，请检查网络连接。',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const showTimestamp =
      index === 0 ||
      (messages[index - 1] &&
        new Date(msg.timestamp).getTime() -
          new Date(messages[index - 1].timestamp).getTime() >
          5 * 60 * 1000);

    return (
      <View key={msg.id} style={styles.messageWrapper}>
        {showTimestamp && (
          <Text
            style={[
              styles.timestamp,
              msg.isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}
          >
            {formatTime(msg.timestamp)}
          </Text>
        )}
        <View
          style={[
            styles.messageContainer,
            msg.isUser
              ? styles.userMessageContainer
              : styles.aiMessageContainer,
          ]}
        >
          {!msg.isUser && (
            <View style={styles.aiAvatar}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.aiAvatar}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color={Colors.white}
                />
              </LinearGradient>
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              msg.isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            {msg.isUser ? (
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.userBubbleGradient}
              >
                <Text style={styles.userMessageText}>{msg.text}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.aiMessageText}>{msg.text}</Text>
            )}
          </View>

          {msg.isUser && (
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={16} color={Colors.primary} />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaContainer style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* <TouchableOpacity
              style={styles.backButton}
              // onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity> */}
            <View style={styles.headerInfo}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.headerAvatar}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color={Colors.white}
                />
              </LinearGradient>

              <View>
                <Text style={styles.headerTitle}>AI 助手</Text>
              </View>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.moreButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={Colors.text}
            />
          </TouchableOpacity> */}
        </View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={{ paddingBottom: Layout.spacing.xl }}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          >
            {isLoadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>正在加载历史消息...</Text>
              </View>
            ) : (
              <>
                {messages.map((msg, index) => renderMessage(msg, index))}

                {isTyping && (
                  <View style={styles.messageWrapper}>
                    <View
                      style={[
                        styles.messageContainer,
                        styles.aiMessageContainer,
                      ]}
                    >
                      <View style={styles.aiAvatar}>
                        <LinearGradient
                          colors={[Colors.primary, Colors.secondary]}
                          style={styles.aiAvatar}
                        >
                          <Ionicons
                            name="chatbubble-ellipses"
                            size={16}
                            color={Colors.white}
                          />
                        </LinearGradient>
                      </View>
                      <View style={styles.aiBubble}>
                        <TypingIndicator visible={true} />
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={20} color={Colors.textSecondary} />
          </TouchableOpacity> */}

          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="输入消息..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              blurOnSubmit={false}
            />
            {message.length > 0 && (
              <Text style={styles.charCount}>{message.length}/1000</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons
              name="send"
              size={16}
              color={message.trim() ? Colors.white : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
};
export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  safeContainer: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  backButton: {
    marginRight: Layout.spacing.md,
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.full,
  },

  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: Layout.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },

  headerTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },

  headerStatus: {
    fontSize: Layout.fontSize.xs,
    color: Colors.secondary,
  },

  moreButton: {
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.full,
  },

  // Chat Messages
  chatContainer: {
    flex: 1,
  },

  messagesList: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
  },

  messageWrapper: {
    marginBottom: Layout.spacing.lg,
  },

  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  userMessageContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },

  aiMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: Layout.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.sm,
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: Layout.borderRadius.full,
    backgroundColor: Colors.chat.userAvatar,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Layout.spacing.sm,
  },

  messageBubble: {
    maxWidth: width * 0.65,
    borderRadius: 16,
  },

  userBubble: {
    borderTopRightRadius: 8,
  },

  aiBubble: {
    backgroundColor: Colors.chat.aiBackground,
    borderWidth: 1,
    borderColor: Colors.chat.aiBorder,
    borderTopLeftRadius: 8,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },

  userBubbleGradient: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 16,
    borderTopRightRadius: 8,
  },

  userMessageText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.white,
    lineHeight: Layout.lineHeight.xs,
  },

  aiMessageText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    lineHeight: Layout.lineHeight.xs,
  },

  timestamp: {
    fontSize: Layout.fontSize.xs,
    color: Colors.chat.timestamp,
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },

  userTimestamp: {
    textAlign: 'right',
    marginRight: 40,
  },

  aiTimestamp: {
    textAlign: 'left',
    marginLeft: 40,
  },

  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.chat.typingDot,
    marginRight: Layout.spacing.xs,
  },

  typingText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.secondary,
    marginLeft: Layout.spacing.sm,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },

  loadingText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.sm,
  },

  // Input Area - 修复边框问题
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  attachButton: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    marginRight: Layout.spacing.md,
  },

  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.chat.inputBackground,
    borderRadius: 20,
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.sm,
    maxHeight: 120,
    position: 'relative',
  },

  inputWrapperFocused: {
    backgroundColor: Colors.chat.inputBackgroundFocused,
    // 在React Native中，outline属性不生效，通过背景色变化来表示聚焦状态
  },

  textInput: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    lineHeight: Layout.lineHeight.xs,
    minHeight: 20,
    maxHeight: 80,
    paddingBottom: Layout.spacing.sm,
    outlineWidth: 0,
  },

  charCount: {
    fontSize: Layout.fontSize.xs,
    color: Colors.chat.timestamp,
    position: 'absolute',
    bottom: 4,
    right: 12,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
    marginLeft: Layout.spacing.md,
  },

  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
});
