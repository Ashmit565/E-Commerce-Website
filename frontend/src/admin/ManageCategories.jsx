import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Layers, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80');
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setImageUrl(c.image_url || '');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined
      };

      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, payload);
        toast.success(`Category "${name}" updated!`);
      } else {
        await productService.createCategory(payload);
        toast.success(`Category "${name}" created!`);
      }

      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    try {
      setDeleting(true);
      await productService.deleteCategory(catToDelete.id);
      toast.success(`Category "${catToDelete.name}" deleted!`);
      setDeleteModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-surface)', padding: '2.5rem', overflowY: 'auto' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Categories</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create, curate, and organize storefront product categories
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{ gap: '6px', borderRadius: '10px' }}
          >
            <Plus size={18} />
            <span>Add New Category</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading categories..." />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {categories.map((cat) => (
              <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '150px', position: 'relative', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge badge-primary" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    {cat.product_count} Products
                  </span>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {cat.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                    <Link
                      to={`/products?category=${cat.slug}`}
                      className="flex items-center gap-1"
                      style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
                      target="_blank"
                    >
                      <span>View Products</span>
                      <ExternalLink size={14} />
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px' }}
                        title="Edit Category"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => { setCatToDelete(cat); setDeleteModalOpen(true); }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px', color: '#EF4444' }}
                        title="Delete Category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
      >
        <form onSubmit={handleSaveCategory} className="flex flex-col gap-3">
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input
              type="url"
              className="form-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Category Deletion"
      >
        <p style={{ fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Are you sure you want to delete category <b>{catToDelete?.name}</b>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirmDelete} disabled={deleting} className="btn btn-danger">
            {deleting ? 'Deleting...' : 'Delete Category'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

