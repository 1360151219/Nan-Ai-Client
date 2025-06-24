import React, { useState, useEffect, useRef } from 'react';
import './index.scss';
import { formatAssistantMeesgae, formatUserMeesgae, Message, parseMessage } from '@src/utils';
import { sendChatMessage } from '@src/utils/api';

/**
 * 主页组件，包含一个优化的聊天框应用和购物车区域
 */
const Home: React.FC = () => {
  // 初始欢迎消息
  const initialMessage = formatAssistantMeesgae("Hi you! 👋 Let's book your next vacation. Ask me anything.");

  // 存储聊天消息的状态，并设置初始消息
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  // 添加loading状态管理
  const [isLoading, setIsLoading] = useState(false);
  // 存储输入框内容的状态
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 自动滚动到最新的消息
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 处理发送消息的函数
   */
  const handleSend = async () => {
    if (inputMessage.trim()) {
      setIsLoading(true);
      const newUserMessage = formatUserMeesgae(inputMessage);
      setMessages((prevMessages) => {
        return [...prevMessages, newUserMessage];
      });
      setInputMessage('');

      const response = await sendChatMessage({
        query: inputMessage,
      });

      const botResponse = formatAssistantMeesgae(response.data);
      setIsLoading(false);
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }
  };
  console.log('消息列表：', messages);

  /**
   * 处理输入框内容变化的函数
   * @param e - 输入框变化事件
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  /**
   * 处理键盘事件，实现回车发送
   * @param e - 键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="home-container">
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role}`}>
              <div className={'message'}>{parseMessage(msg)}</div>
            </div>
          ))}
          {/* 加载中显示消息指示器 */}
          {isLoading && (
            <div className="message-wrapper assistant loading">
              <div className="message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Find me a nice hotel"
          />
          <button onClick={handleSend} className="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="cart-container">
        <p>No items booked yet. Your cart is empty.</p>
      </div>
    </div>
  );
};

export default Home;
