import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner message="Calculating cart totals..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Cart is Waiting</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
          Please sign in to view your saved items, calculate shipping, and proceed to secure checkout.
        </p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Sign In to Access Cart
        </Link>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
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
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.75rem', lineHeight: '1.5' }}>
          Looks like you haven't added any items to your cart yet. Explore our top categories and grab summer deals!
        </p>
        <Link to="/products" className="btn btn-primary btn-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  const freeDeliveryThreshold = 500;
  const subtotalNum = Number(cart.subtotal);
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotalNum);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Shopping Cart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Trash2 size={16} />
          <span>Clear Cart</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'flex-start'
      }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Free Shipping Alert Box */}
          <div style={{
            backgroundColor: remainingForFree === 0 ? '#DCFCE7' : 'var(--primary-light)',
            color: remainingForFree === 0 ? '#15803D' : 'var(--primary-dark)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Truck size={20} />
            <span>
              {remainingForFree === 0
                ? 'Congratulations! You qualify for FREE Delivery!'
                : `Add ₹${remainingForFree.toFixed(2)} more of eligible items to enjoy FREE Delivery!`}
            </span>
          </div>

          {cart.items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                gap: '1.25rem',
                alignItems: 'center'
              }}
            >
              {/* Product Thumbnail */}
              <Link to={`/products/${item.product_id}`} style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#F8FAFC', display: 'block', height: '100px' }}>
                <img
                  src={item.product?.thumbnail}
                  alt={item.product?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>

              {/* Title & Info */}
              <div>
                <Link to={`/products/${item.product_id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {item.product?.name}
                  </h3>
                </Link>
                {item.product?.category && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {item.product.category.name}
                  </span>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2" style={{ marginTop: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                    ₹{Number(item.product?.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {Number(item.product?.original_price) > Number(item.product?.price) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                      ₹{Number(item.product?.original_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {/* Mobile quantity controls */}
                <div className="flex items-center gap-3" style={{ marginTop: '12px' }}>
                  <div className="flex items-center" style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '4px 8px', color: 'var(--text-main)' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '4px 10px', fontWeight: 700, fontSize: '0.9rem' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product?.stock}
                      style={{ padding: '4px 8px', color: 'var(--text-main)' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Total Item Price */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{Number(item.item_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                {Number(item.item_discount) > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                    Saved ₹{Number(item.item_discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.925rem' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Original MRP</span>
                <span>₹{Number(cart.original_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {Number(cart.discount_amount) > 0 && (
                <div className="flex justify-between" style={{ color: '#16A34A' }}>
                  <span>Product Discount</span>
                  <span>- ₹{Number(cart.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>₹{Number(cart.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery</span>
                <span>
                  {Number(cart.delivery_charge) === 0 ? (
                    <span style={{ color: '#16A34A', fontWeight: 700 }}>FREE</span>
                  ) : (
                    `₹${Number(cart.delivery_charge).toFixed(2)}`
                  )}
                </span>
              </div>

              <div style={{
                borderTop: '1.5px solid var(--border-light)',
                paddingTop: '1rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Amount</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{Number(cart.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.5rem', borderRadius: '12px' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} color="var(--primary)" />
                <span>Safe and Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} color="var(--primary)" />
                <span>7 Days Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

