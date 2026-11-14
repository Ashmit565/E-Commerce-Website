import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const loadOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await orderService.getAdminOrders({
        page: pageNum,
        limit: 15,
        status: statusFilter || undefined,
        search: search.trim() || undefined
      });
      setOrders(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders(1);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders(page);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      toast.info('Downloading PDF invoice...');
      const blob = await orderService.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Invoice downloaded!');
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return <span className="badge badge-primary">Confirmed</span>;
      case 'processing': return <span className="badge badge-warning">Processing</span>;
      case 'shipped': return <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>Shipped</span>;
      case 'delivered': return <span className="badge badge-success">Delivered</span>;
      case 'cancelled': return <span className="badge badge-discount">Cancelled</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-surface)', padding: '2.5rem', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track order fulfillments, update delivery stages, and inspect payment transactions
          </p>
        </div>

        {/* Filter controls */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
          <div className="flex justify-between items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} className="flex gap-2" style={{ flex: 1, maxWidth: '400px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search by Order # or Customer..."
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
            </form>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: '180px' }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <LoadingSpinner message="Fetching orders..." />
        ) : (
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: '1rem' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 800 }}>{o.order_number}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {o.items?.length || 0} items
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        ₹{Number(o.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>
                          {o.payment_method}
                        </span>
                        <span className={`badge ${o.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="form-select"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            width: '130px'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedOrder(o); setDetailsModalOpen(true); }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px' }}
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(o.id, o.order_number)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px' }}
                            title="Download PDF Invoice"
                          >
                            <Download size={15} />
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
              onPageChange={(p) => loadOrders(p)}
            />
          </div>
        )}
      </main>

      {/* Inspect Order Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedOrder ? `Order: ${selectedOrder.order_number}` : 'Order Details'}
        maxWidth="650px"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="flex justify-between items-center" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* Address */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Shipping Address Snapshot:</h4>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {selectedOrder.shipping_address_snapshot}
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Ordered Items:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center" style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
                    <div className="flex items-center gap-2">
                      <img src={item.product_image} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.product_name} &times; {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{Number(item.total_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount:</span><span>- ₹{Number(selectedOrder.discount_amount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery:</span><span>₹{Number(selectedOrder.delivery_charge).toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px', marginTop: '6px', fontWeight: 800 }}>
                <span>Final Total:</span>
                <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setDetailsModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

