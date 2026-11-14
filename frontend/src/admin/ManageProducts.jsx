import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  AlertTriangle, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Create/Edit Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        page: pageNum,
        limit: 10,
        search: search.trim() || undefined
      });
      setProducts(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load product catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts(1);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.id ? String(categories[0].id) : '');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStock('20');
    setFormThumbnail('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80');
    setFormDescription('');
    setFormSpecs('Brand: Certified Genuine\nWarranty: 1 Year Warranty\nReturn Policy: 7 Days');
    setFormFeatured(false);
    setFormTrending(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category_id ? String(p.category_id) : '');
    setFormPrice(String(p.price));
    setFormOriginalPrice(String(p.original_price));
    setFormStock(String(p.stock));
    setFormThumbnail(p.thumbnail);
    setFormDescription(p.description);
    setFormSpecs(p.specifications || '');
    setFormFeatured(p.is_featured);
    setFormTrending(p.is_trending);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName || !formPrice || !formStock) {
      toast.error('Please complete required fields');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formName.trim(),
        category_id: formCategory ? parseInt(formCategory, 10) : null,
        description: formDescription.trim(),
        specifications: formSpecs.trim(),
        price: parseFloat(formPrice),
        original_price: parseFloat(formOriginalPrice || formPrice),
        stock: parseInt(formStock, 10),
        thumbnail: formThumbnail.trim(),
        is_featured: formFeatured,
        is_trending: formTrending,
        images: [formThumbnail.trim()]
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        toast.success(`Updated "${formName}" successfully!`);
      } else {
        await productService.createProduct(payload);
        toast.success(`Created "${formName}" successfully!`);
      }

      setModalOpen(false);
      loadProducts(page);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete.id);
      toast.success(`Deleted "${productToDelete.name}" successfully!`);
      setDeleteModalOpen(false);
      loadProducts(page);
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-surface)', padding: '2.5rem', overflowY: 'auto' }}>
        {/* Top Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Products</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create, edit prices, monitor stock, and organize catalog SKUs
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
            style={{ gap: '6px', borderRadius: '10px' }}
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search products by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); loadProducts(1); }}
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Products Table */}
        {loading ? (
          <LoadingSpinner message="Loading products list..." />
        ) : (
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: '1rem' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>MRP (Original)</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail}
                            alt=""
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#F8FAFC' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.name}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Rating: {p.rating} ({p.num_reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{p.category?.name || 'Unassigned'}</span>
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: 'var(--text-light)', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                        ₹{Number(p.original_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        {p.stock <= 5 ? (
                          <span style={{ color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} /> {p.stock}
                          </span>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{p.stock}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${p.is_active ? 'badge-success' : 'badge-discount'}`}>
                          {p.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px' }}
                            title="Edit Product"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => { setProductToDelete(p); setDeleteModalOpen(true); }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px', color: '#EF4444' }}
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              pages={pages}
              onPageChange={(p) => loadProducts(p)}
            />
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Catalog'}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Available Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="form-input"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Original Price / MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formOriginalPrice}
                onChange={(e) => setFormOriginalPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://..."
              className="form-input"
              value={formThumbnail}
              onChange={(e) => setFormThumbnail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              rows="3"
              required
              className="form-textarea"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specifications (Key: Value per line)</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={formSpecs}
              onChange={(e) => setFormSpecs(e.target.value)}
            />
          </div>

          <div className="flex gap-4" style={{ margin: '4px 0' }}>
            <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Featured on Homepage</span>
            </label>
            <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={formTrending}
                onChange={(e) => setFormTrending(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Trending Product</span>
            </label>
          </div>

          <div className="flex justify-end gap-2" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : editingProduct ? 'Save Product Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Product Deletion"
      >
        <p style={{ fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Are you sure you want to permanently delete <b>{productToDelete?.name}</b>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirmDelete} disabled={deleting} className="btn btn-danger">
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

