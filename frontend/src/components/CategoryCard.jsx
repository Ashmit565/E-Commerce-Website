import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="card"
      style={{
        display: 'block',
        position: 'relative',
        textDecoration: 'none',
        borderRadius: '16px',
        overflow: 'hidden',
        height: '200px',
        backgroundColor: '#F8FAFC'
      }}
      onMouseEnter={(e) => {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={(e) => {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      }}
    >
      <img
        src={category.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80'}
        alt={category.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.4s ease'
        }}
      />
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '1.25rem'
      }}>
        <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>
          {category.name}
        </h3>
        <div className="flex items-center justify-between" style={{ color: '#E2E8F0', fontSize: '0.8rem' }}>
          <span>{category.product_count || 0} Products</span>
          <div className="flex items-center gap-1" style={{ color: '#C084FC', fontWeight: 600 }}>
            <span>Explore</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}

