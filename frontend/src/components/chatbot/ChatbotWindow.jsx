import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Minus, RotateCcw, Sparkles } from 'lucide-react';
import { chatbotService } from '../../services/chatbotService';
import { useAuth } from '../../context/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';

export default function ChatbotWindow({ isOpen, onClose, onMinimize }) {
  const { user } = useAuth();

  const [conversationId, setConversationId] = useState(() => {
    return localStorage.getItem('shopbot_conversation_id') || `sb-${Date.now()}`;
  });

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      message: "Hi! I'm ShopBot, your personal shopping assistant. I can help you discover products, compare prices, track orders, and find the best deals. How can I help you today?",
      suggested_followups: [
        'Recommend Products',
        'Find Best Deals',
        'Compare Products',
        'Track My Order',
        'Help with Shopping'
      ]
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState([
    'Recommend Products',
    'Find Best Deals',
    'Compare Products',
    'Track My Order',
    'Help with Shopping'
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('shopbot_conversation_id', conversationId);
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Load contextual quick actions on mount or auth change
  useEffect(() => {
    chatbotService.getQuickActions().then((actions) => {
      if (actions && actions.length > 0) {
        setQuickActions(actions);
      }
    }).catch(console.error);
  }, [user]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      message: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(text, conversationId, {
        current_page: window.location.pathname
      });

      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        message: response.message,
        products: response.products || [],
        comparison: response.comparison || null,
        orders: response.orders || [],
        cart_summary: response.cart_summary || null,
        confirmation_required: response.confirmation_required || null,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Update follow-up quick action chips
      if (response.suggested_followups && response.suggested_followups.length > 0) {
        setQuickActions(response.suggested_followups);
      }
    } catch (err) {
      const fallbackMsg = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        message: "I'm having a brief connection issue. Please feel free to rephrase or explore our store catalog directly!"
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExecuteAction = async (action, payload) => {
    try {
      setIsTyping(true);
      const res = await chatbotService.executeAction(action, payload, conversationId);

      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        message: res.message,
        cart_summary: res.cart_summary || null
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setQuickActions(res.suggested_followups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = async () => {
    try {
      await chatbotService.resetConversation(conversationId);
      const newId = `sb-${Date.now()}`;
      setConversationId(newId);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'bot',
          message: "New conversation started! How can I assist you with your shopping today?",
          suggested_followups: [
            'Recommend Products',
            'Find Best Deals',
            'Compare Products',
            'Track My Order',
            'Help with Shopping'
          ]
        }
      ]);
      setQuickActions([
        'Recommend Products',
        'Find Best Deals',
        'Compare Products',
        'Track My Order',
        'Help with Shopping'
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '88px',
        right: '24px',
        width: '390px',
        maxWidth: 'calc(100vw - 32px)',
        height: '580px',
        maxHeight: 'calc(100vh - 110px)',
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        boxShadow: '0 12px 35px rgba(100, 38, 200, 0.2), 0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 9999,
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
      }}
      className="shopbot-window"
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #6426C8 50%, #2563EB 100%)',
          padding: '12px 16px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.3)',
            }}
          >
            <Bot size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              ShopBot
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', opacity: 0.9 }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#4ADE80',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #4ADE80',
                }}
              />
              <span>AI Shopping Assistant</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            title="Start New Chat"
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            className="chat-header-btn"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            title="Minimize"
            onClick={onMinimize}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            className="chat-header-btn"
          >
            <Minus size={16} />
          </button>

          <button
            type="button"
            title="Close"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            className="chat-header-btn"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="chat-messages-area"
      >
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={m}
            onExecuteAction={handleExecuteAction}
            onProductClick={onMinimize}
          />
        ))}

        {isTyping && <ChatMessage message={{ isTyping: true }} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Pills */}
      <QuickActions
        actions={quickActions}
        onSelectAction={handleSendMessage}
        disabled={isTyping}
      />

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isTyping}
      />
    </div>
  );
}

