import React from 'react';
import { Sparkles, Tag, Layers, Package, HelpCircle } from 'lucide-react';

export default function QuickActions({ actions = [], onSelectAction, disabled = false }) {
  if (!actions || actions.length === 0) return null;

  const getActionIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('recommend') || l.includes('suggest') || l.includes('top')) {
      return <Sparkles size={12} color="#8B5CF6" />;
    }
    if (l.includes('deal') || l.includes('offer') || l.includes('discount')) {
      return <Tag size={12} color="#EF4444" />;
    }
    if (l.includes('compare')) {
      return <Layers size={12} color="#0EA5E9" />;
    }
    if (l.includes('track') || l.includes('order')) {
      return <Package size={12} color="#10B981" />;
    }
    return <HelpCircle size={12} color="#6366F1" />;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '0.5rem 0.75rem',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
      }}
    >
      {actions.map((act, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelectAction(act)}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '9999px',
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#334155',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            whiteSpace: 'nowrap',
          }}
          className="quick-action-pill"
        >
          {getActionIcon(act)}
          <span>{act}</span>
        </button>
      ))}
    </div>
  );
}

