import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Award, 
  Zap, 
  Percent, 
  ShieldCheck, 
  Truck, 
  Headphones 
} from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [cats, feat, trend, best] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ is_featured: true, limit: 8 }),
          productService.getProducts({ is_trending: true, limit: 8 }),
          productService.getProducts({ sort_by: 'popularity', limit: 8 }),
        ]);

        setCategories(cats);
        setFeaturedProducts(feat.items);
        setTrendingProducts(trend.items);
        setBestSellers(best.items);
      } catch (err) {
        console.error('Error loading home data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Curating premium collections for you..." />;
  }

  return (
    <div>
      {/* Hero Promotional Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #2E0854 0%, #6426C8 50%, #7C3AED 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        padding: '4rem 0 5rem'
      }}>
        {/* Abstract background shapes */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3rem'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#E9D5FF',
                marginBottom: '1.25rem'
              }}>
                <Sparkles size={16} color="#F59E0B" />
                <span>SUMMER MEGA SALE IS LIVE</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                letterSpacing: '-0.02em'
              }}>
                Elevate Your Shopping <br />
                <span style={{
                  background: 'linear-gradient(to right, #FDE047, #F472B6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Up to 50% Off
                </span>
              </h1>

              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: '#E2E8F0',
                maxWidth: '520px',
                marginBottom: '2rem'
              }}>
                Discover premium electronics, Italian designer fashion, smart home aesthetics, bestsellers, and wellness essentials delivered straight to your doorstep.
              </p>

              <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
                <Link
                  to="/products"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                  }}
                >
                  <span>Shop Collection</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/products?is_trending=true"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontWeight: 600
                  }}
                >
                  <Flame size={18} color="#F59E0B" />
                  <span>Trending Deals</span>
                </Link>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-6" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>10k+</div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Happy Customers</div>
                </div>
                <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>100%</div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Authentic Brands</div>
                </div>
                <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>24/7</div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>VIP Assistance</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Mockup */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '4px solid rgba(255, 255, 255, 0.15)',
                maxWidth: '460px',
                width: '100%'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Premium Audio Headphones"
                  style={{ width: '100%', height: '380px', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#A855F7', fontWeight: 700, textTransform: 'uppercase' }}>DEAL OF THE DAY</span>
                    <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', margin: '2px 0' }}>Sony WH-1000XM5</h4>
                    <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 700 }}>₹26,990.00 (23% OFF)</span>
                  </div>
                  <Link to="/products/1" className="btn btn-primary btn-sm" style={{ borderRadius: '8px' }}>
                    View Deal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="container" style={{ padding: '4rem 1.25rem 2rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Browse by Category</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select your preferred category to view premium curations</p>
          </div>
          <Link to="/products" className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem'
        }}>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container" style={{ padding: '3rem 1.25rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Award size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Featured Products</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Hand-picked recommendations with stellar customer ratings</p>
            </div>
          </div>
          <Link to="/products?is_featured=true" className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            <span>See More</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {featuredProducts.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Promotional Mid-Page Banner */}
      <section className="container" style={{ padding: '2rem 1.25rem' }}>
        <div style={{
          background: 'linear-gradient(100deg, #0F172A 0%, #1E1B4B 100%)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          color: '#FFFFFF',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          alignItems: 'center',
          gap: '2rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div>
            <span className="badge badge-warning" style={{ marginBottom: '1rem', backgroundColor: '#F59E0B', color: '#000' }}>
              SPECIAL LIMITED OFFER
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '1rem' }}>
              Smart Living & Luxury Appliances
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Upgrade your home with automated espresso makers, cordless cyclone vacuums, and designer ergonomic recliners.
            </p>
            <Link to="/products?category=home-living" className="btn btn-primary btn-lg" style={{ borderRadius: '12px' }}>
              Explore Home Collection
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80"
              alt="Home Appliances"
              style={{
                borderRadius: '16px',
                maxHeight: '260px',
                width: '100%',
                objectFit: 'cover',
                boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="container" style={{ padding: '3rem 1.25rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444'
            }}>
              <Flame size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Trending Now</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>What shoppers in your region are loving this week</p>
            </div>
          </div>
          <Link to="/products?is_trending=true" className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            <span>View All Trending</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {trendingProducts.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Best-Selling Products Section */}
      <section className="container" style={{ padding: '3rem 1.25rem 4rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A'
            }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Best Sellers</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>All-time customer favorites with top verified reviews</p>
            </div>
          </div>
          <Link to="/products?sort_by=popularity" className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            <span>Explore All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {bestSellers.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

