import React, { useState, useEffect } from 'react';
import { Search, UserX, UserCheck, Shield, Users } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadCustomers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await orderService.getAdminCustomers({
        page: pageNum,
        limit: 15,
        search: search.trim() || undefined
      });
      setCustomers(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers(1);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await orderService.toggleCustomerStatus(id);
      toast.success(res.message);
      loadCustomers(page);
    } catch (err) {
      toast.error('Failed to change customer status');
    }
  };

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-surface)', padding: '2.5rem', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Customers</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Inspect registered customer profiles, access states, and account activities
          </p>
        </div>

        {/* Search */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2" style={{ maxWidth: '420px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search customers by name or email..."
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
                onClick={() => { setSearch(''); loadCustomers(1); }}
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Customer Table */}
        {loading ? (
          <LoadingSpinner message="Loading customer profiles..." />
        ) : (
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: '1rem' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}>
                            {c.full_name?.charAt(0) || 'U'}
                          </div>
                          <span style={{ fontWeight: 700 }}>{c.full_name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.email}</td>
                      <td>{c.phone_number || '-'}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${c.is_active ? 'badge-success' : 'badge-discount'}`}>
                          {c.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(c.id, c.is_active)}
                          className={`btn ${c.is_active ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          style={{
                            color: c.is_active ? '#EF4444' : '#FFFFFF',
                            gap: '4px',
                            padding: '4px 10px'
                          }}
                          title={c.is_active ? "Deactivate account" : "Activate account"}
                        >
                          {c.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          <span>{c.is_active ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              pages={pages}
              onPageChange={(p) => loadCustomers(p)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

