import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Wishlist() {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleMoveToCart = async (productId) => {
    const success = await addToCart(productId, 1);
    if (success) {
      await toggleWishlist(productId);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your wishlist..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          color: '#EF4444',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <Heart size={36} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
          Please sign in to view and save your favorite products to your wishlist.
        </p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Sign In to Access Wishlist
        </Link>
      </div>
    );
  }

  if (!wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#F1F5F9',
          color: '#94A3B8',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <Heart size={40} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.75rem', lineHeight: '1.5' }}>
          Save your favorite products while browsing and come back to them anytime!
        </p>
        <Link to="/products" className="btn btn-primary btn-lg">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>My Wishlist</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {wishlist.item_count} {wishlist.item_count === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.75rem'
      }}>
        {wishlist.items.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to={`/products/${product.id}`} style={{ position: 'relative', display: 'block', paddingTop: '75%', backgroundColor: '#F8FAFC' }}>
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} color="#EF4444" />
                </button>
              </Link>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {product.category && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                    {product.category.name}
                  </span>
                )}
                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    lineHeight: 1.35,
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-baseline gap-2" style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {Number(product.original_price) > Number(product.price) && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                      ₹{Number(product.original_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={() => handleMoveToCart(product.id)}
                    disabled={product.stock <= 0}
                    className="btn btn-primary"
                    style={{ width: '100%', borderRadius: '10px', gap: '8px' }}
                  >
                    <ShoppingCart size={16} />
                    <span>{product.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

