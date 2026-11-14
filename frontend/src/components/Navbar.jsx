import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const categories = [
    { name: 'All Products', slug: '' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Beauty', slug: 'beauty' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Books', slug: 'books' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Top Banner Notice */}
      <div style={{
        backgroundColor: 'var(--secondary)',
        color: '#FFFFFF',
        fontSize: '0.8rem',
        padding: '6px 0',
        textAlign: 'center',
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Tag size={14} color="#F59E0B" />
        <span>MEGA SALE IS LIVE: Use code <b>SALE50</b> for up to 50% off select products!</span>
      </div>

      {/* Main Navigation */}
      <div className="container" style={{ padding: '0.85rem 1.25rem' }}>
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(100, 38, 200, 0.3)'
            }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <span style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1
              }}>
                E-Commerce <span style={{ color: 'var(--primary)' }}>Website</span>
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                ONLINE STORE
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleSearch} 
            className="flex items-center" 
            style={{ 
              flex: 1, 
              maxWidth: '520px', 
              position: 'relative',
              margin: '0 1rem'
            }}
          >
            <input
              type="text"
              placeholder="Search products, brands, electronics, fashion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                borderRadius: '9999px',
                paddingLeft: '1.25rem',
                paddingRight: '3.2rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border-light)'
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(100, 38, 200, 0.3)'
              }}
              title="Search"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Desktop Nav Links & Actions */}
          <div className="flex items-center gap-3">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="btn btn-secondary btn-sm"
              style={{ position: 'relative', borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
              title="Wishlist"
            >
              <Heart size={20} color={wishlist.item_count > 0 ? '#EF4444' : 'var(--text-main)'} fill={wishlist.item_count > 0 ? '#EF4444' : 'none'} />
              {wishlist.item_count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlist.item_count}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="btn btn-secondary btn-sm flex items-center gap-2"
              style={{
                position: 'relative',
                borderRadius: '9999px',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderColor: 'transparent',
                fontWeight: 600
              }}
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              <span style={{ fontSize: '0.9rem' }}>Cart</span>
              {cart.item_count > 0 && (
                <span style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  minWidth: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px'
                }}>
                  {cart.item_count}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div style={{ position: 'relative' }}>
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 btn btn-secondary btn-sm"
                    style={{ borderRadius: '9999px', padding: '0.45rem 0.85rem' }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '115%',
                        width: '210px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-light)',
                        padding: '0.5rem',
                        zIndex: 200
                      }}
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.35rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-secondary'}`} style={{ marginTop: '4px', fontSize: '0.65rem' }}>
                          {user.role}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2"
                          style={{
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            backgroundColor: 'var(--primary-light)',
                            marginBottom: '4px'
                          }}
                        >
                          <ShieldCheck size={18} />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2"
                        style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.875rem' }}
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2"
                        style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.875rem' }}
                      >
                        <Package size={16} />
                        <span>Order History</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          color: 'var(--danger)',
                          fontSize: '0.875rem',
                          borderTop: '1px solid var(--border-light)',
                          marginTop: '4px'
                        }}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ display: 'none' }}
              className="mobile-toggle"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navbar */}
        <div className="flex items-center gap-6" style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)', fontSize: '0.9rem', fontWeight: 500 }}>
          <Link 
            to="/" 
            style={{ 
              color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: location.pathname === '/' ? 700 : 500 
            }}
          >
            Home
          </Link>

          <Link 
            to="/products" 
            style={{ 
              color: location.pathname === '/products' && !location.search ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: location.pathname === '/products' && !location.search ? 700 : 500 
            }}
          >
            All Products
          </Link>

          {categories.slice(1).map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              style={{
                color: location.search.includes(cat.slug) ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: location.search.includes(cat.slug) ? 700 : 500,
                transition: 'color var(--transition-fast)'
              }}
            >
              {cat.name}
            </Link>
          ))}

          <Link
            to="/products?is_featured=true"
            className="flex items-center gap-1"
            style={{ color: '#F59E0B', fontWeight: 700, marginLeft: 'auto' }}
          >
            <Tag size={15} />
            <span>Hot Deals</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

