import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  ShoppingBag,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Reports() {
  const [period, setPeriod] = useState('monthly'); // 'daily' or 'monthly'
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchReports = async (p = 'monthly') => {
    try {
      setLoading(true);
      const data = await orderService.getAdminReports(p);
      setReport(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const summary = report?.summary || {};
  const items = report?.items || [];

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-surface)', padding: '2.5rem', overflowY: 'auto' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Financial & Sales Reports</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Historical performance, revenue breakdown, and discount auditing
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex gap-2" style={{ backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <button
              onClick={() => setPeriod('daily')}
              className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '8px' }}
            >
              Daily (Last 30 Days)
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`btn btn-sm ${period === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '8px' }}
            >
              Monthly (Past Year)
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Confirmed Orders</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '6px' }}>
              {summary.total_orders || 0}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gross Product Sales</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
              ₹{Number(summary.total_gross_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Discounts Given</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A', marginTop: '6px' }}>
              - ₹{Number(summary.total_discounts || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Settled Revenue</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
              ₹{Number(summary.total_net_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Reports Breakdown Table */}
        {loading ? (
          <LoadingSpinner message="Aggregating sales figures..." />
        ) : (
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Revenue Performance by {period === 'daily' ? 'Day' : 'Month'}
            </h3>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Orders Count</th>
                    <th>Gross Sales</th>
                    <th>Discounts</th>
                    <th>Net Realized Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{row.period}</td>
                        <td>{row.orders_count} orders</td>
                        <td>₹{Number(row.gross_sales).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ color: '#16A34A' }}>
                          - ₹{Number(row.discount_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{Number(row.net_sales).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No orders recorded during this timeframe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

