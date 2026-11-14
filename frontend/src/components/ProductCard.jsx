import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    setAdding(true);
    const success = await addToCart(product.id, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        backgroundColor: '#FFFFFF',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <Link to={`/products/${product.id}`} style={{ display: 'block', position: 'relative' }}>
        {/* Image Container */}
        <div style={{
          width: '100%',
          paddingTop: '85%', // 4:3.4 ratio
          position: 'relative',
          backgroundColor: '#F8FAFC',
          overflow: 'hidden'
        }}>
          <img
            src={imgError ? fallbackImage : (product.thumbnail || fallbackImage)}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
          />
        </div>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
          {product.discount_percent > 0 && (
            <span className="badge badge-discount">
              {product.discount_percent}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="badge badge-primary">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.2s ease'
          }}
          title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            size={18}
            color={isFavorited ? "#EF4444" : "#64748B"}
            fill={isFavorited ? "#EF4444" : "none"}
          />
        </button>
      </Link>

      {/* Card Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category Label */}
        {product.category && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            {product.category.name}
          </span>
        )}

        {/* Product Title */}
        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '0.975rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              lineHeight: '1.4',
              marginBottom: '6px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em'
            }}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-1" style={{ marginBottom: '10px' }}>
          <div className="flex items-center" style={{ color: '#F59E0B' }}>
            <Star size={14} fill="#F59E0B" />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {Number(product.rating || 0).toFixed(1)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({product.num_reviews || 0})
          </span>
          {product.stock <= 0 ? (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
              Out of stock
            </span>
          ) : product.stock <= 5 ? (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
              Only {product.stock} left!
            </span>
          ) : null}
        </div>

        {/* Price & Action Row */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                {Number(product.original_price) > Number(product.price) && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                    ₹{Number(product.original_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className={`btn ${added ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              style={{
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.825rem'
              }}
              title="Add to Cart"
            >
              {added ? (
                <>
                  <Check size={16} color="#10B981" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

