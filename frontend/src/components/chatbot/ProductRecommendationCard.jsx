import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function ProductRecommendationCard({ product, onProductClick }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const priceNum = parseFloat(product.price) || 0;
  const origPriceNum = parseFloat(product.original_price) || 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      toast.success(`Added ${product.name} to cart!`);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not add to cart';
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-light, #E2E8F0)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '210px',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      className="chatbot-product-card"
    >
      {/* Product Image */}
      <div style={{ position: 'relative', width: '100%', height: '125px', backgroundColor: '#F8FAFC' }}>
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        {product.discount_percent > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '9999px',
            }}
          >
            {product.discount_percent}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
          {product.category_name || 'Store Item'}
        </span>

        <h4
          title={product.name}
          style={{
            fontSize: '0.825rem',
            fontWeight: 700,
            color: 'var(--text-main, #0F172A)',
            margin: '0',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.1rem',
          }}
        >
          {product.name}
        </h4>

        {/* Rating and Stock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
              {parseFloat(product.rating || 4.5).toFixed(1)}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>({product.num_reviews || 0})</span>
          </div>

          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: product.stock > 0 ? '#16A34A' : '#EF4444',
            }}
          >
            {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
          </span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary, #6426C8)' }}>
            ₹{priceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {origPriceNum > priceNum && (
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', textDecoration: 'line-through' }}>
              ₹{origPriceNum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '8px' }}>
          <Link
            to={`/products/${product.id}`}
            onClick={onProductClick}
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '0.72rem',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Eye size={12} />
            <span>View</span>
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || product.stock <= 0}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '0.72rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: added ? '#16A34A' : 'var(--primary, #6426C8)',
            }}
          >
            {added ? (
              <>
                <Check size={12} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={12} />
                <span>Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

