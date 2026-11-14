import React from 'react';
import { Bot, User as UserIcon, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import ProductRecommendationCard from './ProductRecommendationCard';
import ProductComparison from './ProductComparison';
import OrderTrackingCard from './OrderTrackingCard';

export default function ChatMessage({ message, onExecuteAction, onProductClick }) {
  const isUser = message.sender === 'user';

  if (message.isTyping) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '8px 0' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary, #6426C8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <Bot size={16} />
        </div>
        <div
          style={{
            backgroundColor: '#F1F5F9',
            padding: '10px 14px',
            borderRadius: '16px',
            borderTopLeftRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary, #6426C8)' }} />
          <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary, #6426C8)', animationDelay: '0.2s' }} />
          <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary, #6426C8)', animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  // Format simple markdown bold and linebreaks
  const formatText = (text) => {
    if (!text) return null;
    const parts = text.split('\n').map((line, idx) => {
      // Bold **text**
      const boldSegments = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} style={{ display: 'block', minHeight: line.trim() ? 'auto' : '8px' }}>
          {boldSegments.map((seg, sIdx) => {
            if (seg.startsWith('**') && seg.endsWith('**')) {
              return <strong key={sIdx}>{seg.slice(2, -2)}</strong>;
            }
            return seg;
          })}
        </span>
      );
    });
    return parts;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        margin: '10px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
          maxWidth: '88%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: isUser ? '#3B82F6' : 'var(--primary, #6426C8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          {isUser ? <UserIcon size={14} /> : <Bot size={16} />}
        </div>

        {/* Text bubble */}
        <div
          style={{
            backgroundColor: isUser ? 'var(--primary, #6426C8)' : '#FFFFFF',
            color: isUser ? '#FFFFFF' : 'var(--text-main, #0F172A)',
            padding: '10px 14px',
            borderRadius: '16px',
            borderTopRightRadius: isUser ? '4px' : '16px',
            borderTopLeftRadius: !isUser ? '4px' : '16px',
            fontSize: '0.825rem',
            lineHeight: 1.45,
            border: isUser ? 'none' : '1px solid #E2E8F0',
            boxShadow: isUser ? '0 2px 6px rgba(100, 38, 200, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
            wordBreak: 'break-word',
          }}
        >
          {formatText(message.message)}
        </div>
      </div>

      {/* Product Recommendations Horizontal Scroll */}
      {message.products && message.products.length > 0 && (
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            display: 'flex',
            gap: '10px',
            padding: '10px 4px 6px',
            scrollbarWidth: 'thin',
          }}
        >
          {message.products.map((p) => (
            <ProductRecommendationCard key={p.id} product={p} onProductClick={onProductClick} />
          ))}
        </div>
      )}

      {/* Product Comparison Matrix */}
      {message.comparison && (
        <div style={{ width: '100%', maxWidth: '98%' }}>
          <ProductComparison comparison={message.comparison} onProductClick={onProductClick} />
        </div>
      )}

      {/* Orders Tracking Cards */}
      {message.orders && message.orders.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {message.orders.map((ord) => (
            <OrderTrackingCard key={ord.id} order={ord} onActionClick={onProductClick} />
          ))}
        </div>
      )}

      {/* Action Confirmation Dialog Box (e.g. Add to Cart confirmation) */}
      {message.confirmation_required && (
        <div
          style={{
            backgroundColor: '#F3E8FF',
            border: '1px solid #D8B4FE',
            borderRadius: '12px',
            padding: '10px 14px',
            marginTop: '8px',
            maxWidth: '88%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <AlertCircle size={15} color="var(--primary, #6426C8)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#581C87' }}>
              {message.confirmation_required.title}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6B21A8', margin: '0 0 8px 0' }}>
            {message.confirmation_required.description}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onExecuteAction('confirm_add_to_cart', message.confirmation_required.payload)}
              className="btn btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: '0.72rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Check size={12} />
              <span>{message.confirmation_required.confirm_label}</span>
            </button>
            <button
              type="button"
              onClick={() => onExecuteAction('cancel_action', {})}
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.72rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <X size={12} />
              <span>{message.confirmation_required.cancel_label}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

