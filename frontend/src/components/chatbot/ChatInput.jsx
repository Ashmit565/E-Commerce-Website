import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled = false, placeholder = "Ask ShopBot about products, deals, orders..." }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (disabled || !text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    // Auto-adjust height up to 100px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
      }}
    >
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={1000}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '0.825rem',
            lineHeight: 1.4,
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            outline: 'none',
            resize: 'none',
            maxHeight: '100px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            color: 'var(--text-main, #0F172A)',
            backgroundColor: disabled ? '#F8FAFC' : '#FFFFFF',
          }}
          className="chat-textarea"
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: text.trim() && !disabled ? 'var(--primary, #6426C8)' : '#E2E8F0',
          color: text.trim() && !disabled ? '#FFFFFF' : '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: text.trim() && !disabled ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </div>
  );
}

