import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowRight,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { orderService } from '../services/orderService';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await orderService.getAdminDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex" style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        <main style={{ flex: 1, backgroundColor: 'var(--bg-surface)' }}>
          <LoadingSpinner message="Calculating real-time database KPIs..." />
        </main>
      </div>
    );
  }

  const kpi = stats?.kpi || {};

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
        {/* Top Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Admin Analytics Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Live metrics and sales performance queried directly from the MySQL database
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/products" className="btn btn-primary btn-sm">
              Manage Catalog
            </Link>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">
              Process Orders
            </Link>
          </div>
        </div>

        {/* 6 KPI Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          {/* Card 1: Total Sales */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Sales</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              ₹{Number(kpi.total_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <ArrowUpRight size={14} /> Confirmed Revenue
            </span>
          </div>

          {/* Card 2: Total Orders */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Orders</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {kpi.total_orders || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              All-time completed orders
            </span>
          </div>

          {/* Card 3: Total Customers */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Customers</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {kpi.total_customers || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Registered customer accounts
            </span>
          </div>

          {/* Card 4: Total Products */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Catalog Items</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {kpi.total_products || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Active live SKUs
            </span>
          </div>

          {/* Card 5: Pending Orders */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pending Orders</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: kpi.pending_orders > 0 ? '#DC2626' : 'var(--text-main)' }}>
              {kpi.pending_orders || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Requires shipping fulfillment
            </span>
          </div>

          {/* Card 6: Low Stock Products */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Low Stock Alert</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: kpi.low_stock_products > 0 ? '#D97706' : 'var(--text-main)' }}>
              {kpi.low_stock_products || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Inventory &le; 5 units left
            </span>
          </div>
        </div>

        {/* Charts & Analytics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Sales Daily Chart / Overview */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Revenue Overview (Last 14 Days)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily completed order sales values</span>
              </div>
              <Link to="/admin/reports" className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                <span>Reports</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Custom Bar Chart Visualizer */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', paddingTop: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              {stats?.sales_overview && stats.sales_overview.length > 0 ? (
                stats.sales_overview.map((pt, i) => {
                  const maxSale = Math.max(...stats.sales_overview.map(x => Number(x.sales) || 1), 1000);
                  const heightPercent = Math.min(100, Math.max(12, ((Number(pt.sales) || 0) / maxSale) * 100));

                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '24px',
                          height: `${heightPercent}%`,
                          backgroundColor: 'var(--primary)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.4s ease'
                        }}
                        title={`${pt.date}: ₹${Number(pt.sales).toFixed(2)} (${pt.orders} orders)`}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>
                        {pt.date.slice(5)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent sales data recorded.</div>
              )}
            </div>
          </div>

          {/* Category Sales Distribution */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>Category Distribution</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1.5rem' }}>
              Revenue contribution across categories
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats?.category_distribution && stats.category_distribution.length > 0 ? (
                stats.category_distribution.map((cat, i) => {
                  const totalCatSales = stats.category_distribution.reduce((acc, c) => acc + Number(c.sales), 0) || 1;
                  const pct = Math.round((Number(cat.sales) / totalCatSales) * 100);

                  return (
                    <div key={i}>
                      <div className="flex justify-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{cat.category_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>₹{Number(cat.sales).toLocaleString('en-IN')} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: i % 2 === 0 ? 'var(--primary)' : '#A855F7', borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>No category sales recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Grid: Recent Orders & Top Selling Products */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Recent Orders */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                    stats.recent_orders.map((o) => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700 }}>
                          <Link to="/admin/orders" style={{ color: 'var(--primary)' }}>{o.order_number}</Link>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td>{getStatusBadge(o.status)}</td>
                        <td style={{ fontWeight: 700 }}>₹{Number(o.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders placed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Top Products</h3>
              <Link to="/admin/products" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                Inventory
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats?.top_selling_products && stats.top_selling_products.length > 0 ? (
                stats.top_selling_products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail}
                        alt=""
                        style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Stock: {p.stock} units left
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                      ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No top products recorded.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

