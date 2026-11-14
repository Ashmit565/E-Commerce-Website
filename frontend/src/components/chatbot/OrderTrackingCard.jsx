import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function OrderTrackingCard({ order, onActionClick }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { bg: '#E0E7FF', color: '#4338CA', icon: <CheckCircle2 size={12} /> };
      case 'processing':
        return { bg: '#FEF3C7', color: '#B45309', icon: <Clock size={12} /> };
      case 'shipped':
        return { bg: '#E0F2FE', color: '#0369A1', icon: <Truck size={12} /> };
      case 'delivered':
        return { bg: '#DCFCE7', color: '#15803D', icon: <CheckCircle2 size={12} /> };
      case 'cancelled':
        return { bg: '#FEE2E2', color: '#B91C1C', icon: <AlertTriangle size={12} /> };
      default:
        return { bg: '#F1F5F9', color: '#475569', icon: <Clock size={12} /> };
    }
  };

  const badge = getStatusBadge(order.status);
  const amountNum = parseFloat(order.total_amount) || 0;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '0.85rem',
        marginTop: '0.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block' }}>Order Reference</span>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>
            {order.order_number}
          </span>
        </div>

        <span
          style={{
            backgroundColor: badge.bg,
            color: badge.color,
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {badge.icon}
          <span>{order.status}</span>
        </span>
      </div>

      {/* Info Line */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#64748B',
          padding: '6px 0',
          borderTop: '1px dashed #E2E8F0',
          borderBottom: '1px dashed #E2E8F0',
          marginBottom: '8px',
        }}
      >
        <span>Placed on {order.created_at}</span>
        <span>Payment: <b style={{ textTransform: 'capitalize', color: '#1E293B' }}>{order.payment_status}</b></span>
      </div>

      {/* Items preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
            {item.product_image && (
              <img
                src={item.product_image}
                alt={item.product_name}
                style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
              />
            )}
            <span
              style={{
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#334155',
              }}
            >
              {item.quantity}x {item.product_name}
            </span>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>
              ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
        {order.items.length > 2 && (
          <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontStyle: 'italic' }}>
            +{order.items.length - 2} more item(s)
          </span>
        )}
      </div>

      {/* Footer / Total & Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
        <div>
          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Total: </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary, #6426C8)' }}>
            ₹{amountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <Link
          to="/orders"
          onClick={onActionClick}
          style={{
            fontSize: '0.72rem',
            color: 'var(--primary, #6426C8)',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <span>Track in Orders</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

