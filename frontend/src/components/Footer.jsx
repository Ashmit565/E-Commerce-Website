import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      toast.success('Thank you for subscribing! Check your email for special offers.');
      setEmail('');
    }
  };

  return (
    <footer style={{ backgroundColor: '#0B132B', color: '#CBD5E1', marginTop: '4rem' }}>
      {/* Service Highlights Bar */}
      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="flex items-center gap-3">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(100, 38, 200, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
                <Truck size={24} />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>Free & Fast Delivery</h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>On all orders above Rs. 500</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(100, 38, 200, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>100% Genuine Products</h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Directly sourced from verified brands</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(100, 38, 200, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>Easy 7-Day Returns</h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Hassle-free replacement policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(100, 38, 200, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>Secure Payments</h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Cards, UPI, NetBanking & COD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <ShoppingBag size={20} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                E-Commerce <span style={{ color: '#A855F7' }}>Website</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#94A3B8', marginBottom: '1.5rem' }}>
              Your premium destination for fashion, cutting-edge electronics, home luxury, books, and fitness essentials.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div className="flex items-center gap-2">
                <MapPin size={16} color="#A855F7" />
                <span>MG Road, Bengaluru, Karnataka 560001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} color="#A855F7" />
                <span>+91 (080) 4567-8900</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} color="#A855F7" />
                <span>support@ecommercewebsite.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Categories */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem' }}>Shop Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/products?category=electronics" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Electronics & Gadgets</Link></li>
              <li><Link to="/products?category=fashion" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Men & Women Fashion</Link></li>
              <li><Link to="/products?category=home-living" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Home & Living</Link></li>
              <li><Link to="/products?category=beauty" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Beauty & Fragrances</Link></li>
              <li><Link to="/products?category=sports" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Sports & Fitness</Link></li>
              <li><Link to="/products?category=books" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Books & Literature</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/profile" style={{ color: '#94A3B8' }}>My Account</Link></li>
              <li><Link to="/orders" style={{ color: '#94A3B8' }}>Order Tracking</Link></li>
              <li><Link to="/wishlist" style={{ color: '#94A3B8' }}>My Wishlist</Link></li>
              <li><Link to="/cart" style={{ color: '#94A3B8' }}>Shopping Cart</Link></li>
              <li><span style={{ color: '#94A3B8' }}>Shipping Policy</span></li>
              <li><span style={{ color: '#94A3B8' }}>Returns & Refunds</span></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem' }}>Stay Updated</h4>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: '1.5' }}>
              Subscribe to get exclusive discounts, weekly coupons, and product launches right in your inbox.
            </p>
            {subscribed ? (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Check size={18} />
                <span>Subscribed! Welcome to E-Commerce Website VIP.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>
                  Subscribe Now
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748B'
        }}>
          <div>
            &copy; {new Date().getFullYear()} E-Commerce Website Inc. All rights reserved. Built with Python FastAPI, MySQL & React.
          </div>
          <div className="flex gap-4">
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Security</span>
            <span style={{ cursor: 'pointer' }}>Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

