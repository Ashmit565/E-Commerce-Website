import React, { useState } from 'react';
import { Bot, MessageSquare, X, Sparkles } from 'lucide-react';
import ChatbotWindow from './ChatbotWindow';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    setHasInteracted(true);
  };

  const handleMinimize = () => {
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chatbot Window */}
      <ChatbotWindow
        isOpen={isOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />

      {/* Floating Launcher Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Subtle greeting bubble if user has not interacted */}
        {!isOpen && !hasInteracted && (
          <div
            onClick={toggleOpen}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              animation: 'bounce 3s infinite',
            }}
            className="chatbot-greeting-pill"
          >
            <Sparkles size={13} color="#8B5CF6" />
            <span>Need shopping help?</span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleOpen}
          aria-label={isOpen ? 'Close ShopBot Assistant' : 'Open ShopBot Assistant'}
          title="ShopBot – AI Shopping Assistant"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6426C8 0%, #2563EB 100%)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(100, 38, 200, 0.4), 0 2px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
          }}
          className="chatbot-launcher-btn"
        >
          {isOpen ? (
            <X size={24} />
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={28} />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                  border: '2px solid #FFFFFF',
                }}
              />
            </div>
          )}
        </button>
      </div>
    </>
  );
}

