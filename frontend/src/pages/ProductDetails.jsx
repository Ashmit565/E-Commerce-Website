import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Check, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Share2, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
        setSelectedImage(data.images?.[0]?.image_url || data.thumbnail);
        setQuantity(1);

        // Fetch reviews
        const revData = await productService.getReviews(id);
        setReviews(revData);

        // Fetch related products in the same category
        if (data.category_id) {
          const related = await productService.getProducts({
            category_id: data.category_id,
            limit: 4
          });
          setRelatedProducts(related.items.filter((p) => p.id !== data.id));
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    setAddingToCart(true);
    const success = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to submit a review.');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      const newRev = await productService.addReview(product.id, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim()
      });
      setReviews([newRev, ...reviews.filter(r => r.id !== newRev.id)]);
      setReviewComment('');
      setReviewTitle('');
      toast.success('Your review was posted successfully!');
      
      // Refresh product aggregate rating
      const updated = await productService.getProductById(product.id);
      setProduct(updated);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          The product you are looking for may have been removed or is unavailable.
        </p>
        <Link to="/products" className="btn btn-primary">
          Back to Store
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'inherit' }}>Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category.slug}`} style={{ color: 'inherit' }}>
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main Product Showcase Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem',
        alignItems: 'start'
      }}>
        {/* Left: Product Images Gallery */}
        <div>
          <div style={{
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1rem',
            position: 'relative',
            aspectRatio: '1 / 1'
          }}>
            <img
              src={selectedImage || product.thumbnail}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '1.5rem',
                backgroundColor: '#FFFFFF'
              }}
            />
            {product.discount_percent > 0 && (
              <span className="badge badge-discount" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.85rem' }}>
                {product.discount_percent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: selectedImage === img.image_url ? '2.5px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: '#FFFFFF',
                    padding: '4px',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Info */}
        <div>
          {product.category && (
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              {product.category.name}
            </span>
          )}

          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
            <div className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating || 0) ? '#F59E0B' : 'none'}
                  color={i < Math.floor(product.rating || 0) ? '#F59E0B' : '#CBD5E1'}
                />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {Number(product.rating || 0).toFixed(1)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              ({product.num_reviews} verified reviews)
            </span>
          </div>

          {/* Price Block */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            border: '1px solid var(--border-light)'
          }}>
            <div className="flex items-baseline gap-3">
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              {Number(product.original_price) > Number(product.price) && (
                <span style={{ fontSize: '1.15rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₹{Number(product.original_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '1rem' }}>
                  Save ₹{(Number(product.original_price) - Number(product.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Inclusive of all taxes. Free shipping on this order.
            </p>
          </div>

          {/* Stock Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            {product.stock > 10 ? (
              <span className="badge badge-success">In Stock ({product.stock} units available)</span>
            ) : product.stock > 0 ? (
              <span className="badge badge-warning">Low Stock: Only {product.stock} left in stock!</span>
            ) : (
              <span className="badge badge-discount">Currently Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.975rem', lineHeight: '1.65', color: '#475569', marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Quantity & CTA Row */}
          <div className="flex items-center gap-4" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Quantity Controls */}
            <div className="flex items-center" style={{
              border: '1.5px solid var(--border-light)',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || product.stock <= 0}
                style={{ padding: '0.65rem 0.95rem', color: 'var(--text-main)' }}
              >
                <Minus size={16} />
              </button>
              <span style={{ padding: '0.65rem 1rem', fontWeight: 700, fontSize: '1rem', minWidth: '40px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock || product.stock <= 0}
                style={{ padding: '0.65rem 0.95rem', color: 'var(--text-main)' }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock <= 0}
              className={`btn ${added ? 'btn-secondary' : 'btn-primary'} btn-lg`}
              style={{ flex: 1, minWidth: '180px' }}
            >
              {added ? (
                <>
                  <Check size={20} color="#10B981" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="btn btn-secondary btn-lg"
              style={{
                borderRadius: '12px',
                padding: '0.85rem',
                borderColor: isFavorited ? '#EF4444' : 'var(--border-light)'
              }}
              title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart
                size={22}
                color={isFavorited ? "#EF4444" : "var(--text-main)"}
                fill={isFavorited ? "#EF4444" : "none"}
              />
            </button>
          </div>

          {/* Guarantees Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)'
          }}>
            <div className="flex items-center gap-2">
              <Truck size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Standard Dispatch in 24 hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>1-Year Comprehensive Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>7-Day Replacement Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginTop: '3rem' }}>
        {/* Specifications */}
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Product Specifications</h3>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            overflow: 'hidden'
          }}>
            {product.specifications ? (
              product.specifications.split('\n').map((line, idx) => {
                const [key, ...rest] = line.split(':');
                return (
                  <div
                    key={idx}
                    className="flex justify-between"
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: idx % 2 === 0 ? 'var(--bg-surface)' : '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{key?.trim()}</span>
                    <span style={{ color: 'var(--text-main)', textAlign: 'right' }}>{rest.join(':').trim()}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>Standard specifications apply.</div>
            )}
          </div>
        </div>

        {/* Customer Reviews & Submit Form */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Customer Reviews ({reviews.length})</h3>
          </div>

          {/* Add Review Box */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
            marginBottom: '2rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Write a Review</h4>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="form-label">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{ color: '#F59E0B', padding: '4px' }}
                      >
                        <Star
                          size={24}
                          fill={star <= reviewRating ? '#F59E0B' : 'none'}
                          color={star <= reviewRating ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '6px' }}>
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Review title (e.g. Excellent build quality!)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="form-input"
                />

                <textarea
                  rows="3"
                  required
                  placeholder="Share your detailed experience with this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-textarea"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Please sign in to your account to share your verified review.
                </p>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    padding: '1.25rem'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center" style={{ color: '#F59E0B' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? '#F59E0B' : 'none'}
                            color={i < rev.rating ? '#F59E0B' : '#CBD5E1'}
                          />
                        ))}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.title || 'Verified Purchase'}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', marginBottom: '8px' }}>
                    {rev.comment}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    By {rev.user?.full_name || 'Customer'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>
            Related Products You Might Like
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

