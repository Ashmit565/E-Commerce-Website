import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Search, 
  Star,
  Check
} from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States from URL or Defaults
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort_by') || 'newest';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const minRating = searchParams.get('min_rating') || '';
  const inStockOnly = searchParams.get('in_stock_only') === 'true';

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Temporary local state for price inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSearch, setLocalSearch] = useState(search);

  // Fetch categories on mount
  useEffect(() => {
    productService.getCategories().then((data) => setCategories(data)).catch(console.error);
  }, []);

  // Sync inputs when URL changes
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalSearch(search);
  }, [minPrice, maxPrice, search]);

  // Fetch products whenever searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 12,
          sort_by: sortBy,
        };
        if (search) params.search = search;
        if (categorySlug) params.category = categorySlug;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (minRating) params.min_rating = minRating;
        if (inStockOnly) params.in_stock_only = true;

        const data = await productService.getProducts(params);
        setProducts(data.items);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // reset to page 1 on filter change
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('min_price', localMinPrice);
    else next.delete('min_price');

    if (localMaxPrice) next.set('max_price', localMaxPrice);
    else next.delete('max_price');

    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', localSearch);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  const hasActiveFilters = categorySlug || search || minPrice || maxPrice || minRating || inStockOnly || sortBy !== 'newest';

  const filterSidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Category Filter */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Categories</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => updateParam('category', '')}
            style={{
              textAlign: 'left',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: !categorySlug ? 700 : 400,
              color: !categorySlug ? 'var(--primary)' : 'var(--text-main)',
              backgroundColor: !categorySlug ? 'var(--primary-light)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>All Categories</span>
            {!categorySlug && <Check size={16} />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              style={{
                textAlign: 'left',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: categorySlug === cat.slug ? 700 : 400,
                color: categorySlug === cat.slug ? 'var(--primary)' : 'var(--text-main)',
                backgroundColor: categorySlug === cat.slug ? 'var(--primary-light)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{cat.name}</span>
              {categorySlug === cat.slug && <Check size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Price Range (₹)</h4>
        <form onSubmit={handlePriceApply} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="form-input"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="form-input"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '4px' }}>
            Apply Price
          </button>
        </form>
      </div>

      {/* Minimum Rating */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Customer Ratings</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => updateParam('min_rating', minRating === r.toString() ? '' : r.toString())}
              className="flex items-center gap-2"
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                backgroundColor: minRating === r.toString() ? 'var(--primary-light)' : 'transparent',
                color: minRating === r.toString() ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: minRating === r.toString() ? 700 : 500
              }}
            >
              <div className="flex items-center" style={{ color: '#F59E0B' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < r ? '#F59E0B' : 'none'}
                    color={i < r ? '#F59E0B' : '#CBD5E1'}
                  />
                ))}
              </div>
              <span>& Above</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Availability</h4>
        <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('in_stock_only', e.target.checked ? 'true' : '')}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="btn btn-outline btn-sm flex items-center justify-center gap-2"
          style={{ width: '100%', borderColor: '#EF4444', color: '#EF4444' }}
        >
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Top Header & Search Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {categorySlug 
              ? `${categorySlug.replace('-', ' ').toUpperCase()} COLLECTION`
              : search 
              ? `Search Results for "${search}"`
              : 'All Products'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Showing {products.length} of {total} products
          </p>
        </div>

        {/* Sort & Search Controls */}
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {/* Inline Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search in results..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="form-input"
              style={{
                borderRadius: '8px',
                padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                fontSize: '0.85rem',
                width: '210px'
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
          </form>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => updateParam('sort_by', e.target.value)}
            className="form-select"
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              width: '180px',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="popularity">Sort by: Popularity</option>
            <option value="rating">Sort by: High Rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Grid with Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
        
        {/* Desktop Sidebar Filters */}
        <aside style={{
          backgroundColor: '#FFFFFF',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: '110px'
        }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div className="flex items-center gap-2">
              <Filter size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Filter Catalog</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}
              >
                Clear
              </button>
            )}
          </div>
          {filterSidebarContent}
        </aside>

        {/* Product Cards Grid */}
        <main>
          {loading ? (
            <LoadingSpinner message="Loading products..." />
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-light)'
            }}>
              <Search size={48} color="var(--text-light)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No products match your criteria
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Try adjusting or resetting your category, price range, or rating filters to explore more items.
              </p>
              <button onClick={clearAllFilters} className="btn btn-primary">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem'
              }}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={page}
                pages={pages}
                onPageChange={(p) => updateParam('page', p.toString())}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

