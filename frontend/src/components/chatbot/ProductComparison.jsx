import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function ProductComparison({ comparison, onProductClick }) {
  const { addToCart } = useCart();
  const toast = useToast();

  if (!comparison || !comparison.products || comparison.products.length < 2) {
    return null;
  }

  const { products, verdict } = comparison;

  const handleAdd = async (p) => {
    try {
      await addToCart(p.id, 1);
      toast.success(`Added ${p.name} to cart!`);
    } catch (err) {
      toast.error('Could not add to cart');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        padding: '1rem',
        marginTop: '0.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
        <Award size={16} color="var(--primary, #6426C8)" />
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
          Side-by-Side Comparison
        </span>
      </div>

      {/* Product Mini Header Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${products.length}, 1fr)`, gap: '8px', marginBottom: '1rem' }}>
        {products.map((p) => {
          const priceNum = parseFloat(p.price) || 0;
          return (
            <div
              key={p.id}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                padding: '8px',
                textAlign: 'center',
                border: '1px solid #EDF2F7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={p.thumbnail}
                alt={p.name}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2rem',
                  lineHeight: 1.2,
                }}
              >
                {p.name}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary, #6426C8)', marginTop: '4px' }}>
                ₹{priceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', margin: '2px 0 6px' }}>
                <Star size={11} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{parseFloat(p.rating || 4.5).toFixed(1)}</span>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(p)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: '0.68rem',
                  borderRadius: '6px',
                  marginTop: 'auto',
                }}
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Metrics Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #EDF2F7' }}>
              <td style={{ padding: '6px 8px', color: '#64748B', fontWeight: 600 }}>Discount</td>
              {products.map((p) => (
                <td key={p.id} style={{ padding: '6px 8px', fontWeight: 700, color: '#EF4444' }}>
                  {p.discount_percent}% OFF
                </td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: '#F8FAFC' }}>
              <td style={{ padding: '6px 8px', color: '#64748B', fontWeight: 600 }}>Availability</td>
              {products.map((p) => (
                <td key={p.id} style={{ padding: '6px 8px', fontWeight: 600, color: p.stock > 0 ? '#16A34A' : '#EF4444' }}>
                  {p.stock > 0 ? `${p.stock} units` : 'Out of stock'}
                </td>
              ))}
            </tr>
            {comparison.compared_attributes.map((attr, idx) => (
              <tr key={attr} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                <td style={{ padding: '6px 8px', color: '#64748B', fontWeight: 600 }}>{attr}</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '6px 8px', color: '#1E293B' }}>
                    {p.specs_dict?.[attr] || 'Standard'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Recommendation Verdict */}
      {verdict && (
        <div
          style={{
            marginTop: '0.85rem',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: '#F3E8FF',
            border: '1px solid #E9D5FF',
            fontSize: '0.75rem',
            lineHeight: 1.45,
            color: '#4C1D95',
          }}
        >
          {verdict}
        </div>
      )}
    </div>
  );
}

