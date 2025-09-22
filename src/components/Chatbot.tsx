'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi! I'm Career Disha, your AI career counselor. I can help you with career guidance, exam preparation, college selection, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a response from the server.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      const modelMessage: Message = { role: 'model', content: data.content };
      setMessages(prevMessages => [...prevMessages, modelMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      const errorResponse: Message = { 
        role: 'model', 
        content: `Sorry, I'm having trouble right now: ${errorMessage}. Please try again in a moment.` 
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: "Hi! I'm Career Disha, your AI career counselor. I can help you with career guidance, exam preparation, college selection, and more. What would you like to know?",
      },
    ]);
    setError(null);
  };

  return (
    <>
      <button className={styles.chatButton} onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <h3>Career Disha</h3>
              <span className={styles.status}>Online</span>
            </div>
            <div className={styles.headerRight}>
              <button onClick={clearChat} className={styles.clearButton} title="Clear chat">
                🗑️
              </button>
              <button onClick={() => setIsOpen(false)} className={styles.closeButton}>×</button>
            </div>
          </div>
          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? styles.userMessage : styles.modelMessage}>
                <div className={styles.messageContent}>
                  {msg.content}
                </div>
                <div className={styles.messageTime}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={styles.modelMessage}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {error && (
              <div className={styles.errorMessage}>
                ⚠️ {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className={styles.chatInputForm}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about careers, exams, colleges..."
              disabled={isLoading}
              maxLength={500}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}