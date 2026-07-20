'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  package: { id: number; title: string; slug: string; image: string } | null;
  user: { id: number; name: string; email: string } | null;
  travel_date: string;
  travelers: number;
  amount: number;
  status: string;
  created_at: string;
  transaction_id: string;
  special_requests: string;
}

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getBookings({ all: 'true' });
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const api = new ApiClient();
      await api.updateBooking(id, { status });
      fetchData();
    } catch { alert('Failed to update status'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this booking?')) return;
    try {
      const api = new ApiClient();
      await api.deleteBooking(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const getStatusClass = (status: string) => {
    if (status === 'confirmed') return '';
    if (status === 'pending') return 'pending';
    if (status === 'cancelled') return 'cancelled';
    return '';
  };

  if (loading) return <div className="admin-state-card">Loading...</div>;
  if (error) return <div className="admin-state-card error">{error}</div>;

  return (
    <div className="admin-dashboard-content">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h3>Bookings</h3>
            <p>Manage bookings ({items.length})</p>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No bookings yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.customer_name || item.user?.name || '—'}</strong>
                      <br /><small style={{ opacity: 0.6 }}>{item.customer_email || item.user?.email}</small>
                    </td>
                    <td>{item.package?.title || '—'}</td>
                    <td>{item.travel_date ? new Date(item.travel_date).toLocaleDateString() : '—'}</td>
                    <td>{item.travelers || 1}</td>
                    <td>${Number(item.amount || 0).toLocaleString()}</td>
                    <td>
                      <select
                        value={item.status || 'pending'}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#f8fcff', fontFamily: 'inherit', cursor: 'pointer' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', marginRight: 6 }} onClick={() => setSelected(item)}>View</button>
                      <button className="admin-btn admin-btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(item.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>Booking #{selected.id}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, color: '#d7e6f3' }}>
                <div><strong>Customer:</strong> {selected.customer_name || selected.user?.name || '—'}</div>
                <div><strong>Email:</strong> {selected.customer_email || selected.user?.email}</div>
                <div><strong>Package:</strong> {selected.package?.title || '—'}</div>
                <div><strong>Travel Date:</strong> {selected.travel_date ? new Date(selected.travel_date).toLocaleDateString() : '—'}</div>
                <div><strong>Travelers:</strong> {selected.travelers || 1}</div>
                <div><strong>Total:</strong> ${Number(selected.amount || 0).toLocaleString()}</div>
                <div><strong>Status:</strong> <span className={`admin-pill ${getStatusClass(selected.status)}`}>{selected.status}</span></div>
                <div><strong>Created:</strong> {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="admin-btn admin-btn-secondary" onClick={() => setSelected(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .admin-modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .admin-modal { background: #0d2039; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 28px; width: min(600px, 100%); max-height: 90vh; overflow-y: auto; }
        select option { background: #0d2039; color: #f8fcff; }
      `}</style>
    </div>
  );
}
