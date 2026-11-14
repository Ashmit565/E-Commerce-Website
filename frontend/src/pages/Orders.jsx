import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Download, 
  XCircle, 
  ExternalLink, 
  Clock, 
  Truck, 
  CheckCircle2, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Cancel order modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders({ page: pageNum, limit: 8 });
      setOrders(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      toast.info('Preparing PDF invoice...');
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

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('Found a better price elsewhere');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      setCancelling(true);
      await orderService.cancelOrder(orderToCancel.id, cancelReason);
      toast.success(`Order ${orderToCancel.order_number} has been cancelled.`);
      setCancelModalOpen(false);
      fetchOrders(page);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <span className="badge badge-primary">Confirmed</span>;
      case 'processing':
        return <span className="badge badge-warning">Processing</span>;
      case 'shipped':
        return <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>Shipped</span>;
      case 'delivered':
        return <span className="badge badge-success">Delivered</span>;
      case 'cancelled':
        return <span className="badge badge-discount">Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching your orders..." />;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Order History & Tracking</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Review past orders, track delivery milestones, and download invoices
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Package size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No orders placed yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            When you purchase products from E-Commerce Website, your real-time tracking and tax invoices will appear right here.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Store Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const isCancellable = ['Pending', 'Confirmed', 'Processing'].includes(order.status);

            return (
              <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                      title="Download PDF Invoice"
                    >
                      <Download size={15} />
                      <span>Invoice PDF</span>
                    </button>

                    {isCancellable && (
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#EF4444', color: '#EF4444', gap: '4px' }}
                      >
                        <XCircle size={15} />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status progress bar if active */}
                {order.status !== 'Cancelled' && (
                  <div style={{ padding: '1.25rem 0 0.75rem' }}>
                    <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Order Confirmed</span>
                      <span style={{ color: ['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'var(--primary)' : 'inherit' }}>Processing</span>
                      <span style={{ color: ['Shipped', 'Delivered'].includes(order.status) ? 'var(--primary)' : 'inherit' }}>Shipped</span>
                      <span style={{ color: order.status === 'Delivered' ? '#16A34A' : 'inherit' }}>Delivered</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: order.status === 'Delivered' ? '#16A34A' : 'var(--primary)',
                        width: order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '75%' : order.status === 'Processing' ? '50%' : '25%',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                )}

                {/* Cancel note if cancelled */}
                {order.status === 'Cancelled' && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    color: '#991B1B',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    margin: '10px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={16} />
                    <span>Cancellation Reason: {order.cancel_reason || 'Requested by customer'} (Inventory was restored)</span>
                  </div>
                )}

                {/* Order items list */}
                <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between" style={{ gap: '1rem' }}>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product_image}
                          alt=""
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#F8FAFC' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} &times; {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{Number(item.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary footer */}
                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Payment: <b style={{ textTransform: 'uppercase', color: 'var(--text-main)' }}>{order.payment_method}</b> ({order.payment_status})
                  </span>
                  <div>
                    <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Total Paid:</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <Pagination
            page={page}
            pages={pages}
            onPageChange={(p) => fetchOrders(p)}
          />
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order Confirmation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>
            Are you sure you want to cancel order <b>{orderToCancel?.order_number}</b>? Once cancelled, inventory is automatically restored and payment is marked for refund.
          </p>

          <div className="form-group">
            <label className="form-label">Please provide a reason for cancellation:</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-select"
            >
              <option value="Found a better price elsewhere">Found a better price elsewhere</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Shipping time is too long">Shipping time is too long</option>
              <option value="Need to change delivery address">Need to change delivery address</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
            <button
              onClick={() => setCancelModalOpen(false)}
              className="btn btn-secondary"
            >
              Keep Order
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="btn btn-danger"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

