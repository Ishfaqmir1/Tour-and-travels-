'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getUsers();
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAdmin = async (id: number, isSuperAdmin: boolean) => {
    try {
      const api = new ApiClient();
      await api.updateUser(id, { isSuperAdmin });
      fetchData();
    } catch { alert('Failed to update'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      const api = new ApiClient();
      await api.deleteUser(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Failed to delete'); }
  };

  if (loading) return <div className="admin-state-card">Loading...</div>;
  if (error) return <div className="admin-state-card error">{error}</div>;

  return (
    <div className="admin-dashboard-content">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h3>Users</h3>
            <p>Manage users ({items.length})</p>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.email}</td>
                    <td>{item.phone || '—'}</td>
                    <td>
                      <span className={`admin-pill ${item.isSuperAdmin ? '' : 'pending'}`}>
                        {item.isSuperAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', marginRight: 6 }} onClick={() => setSelected(item)}>View</button>
                      {!item.isSuperAdmin ? (
                        <button className="admin-btn" style={{ padding: '6px 12px', marginRight: 6, background: 'rgba(255,179,71,0.15)', color: '#ffb347', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toggleAdmin(item.id, true)}>Make Admin</button>
                      ) : (
                        <button className="admin-btn" style={{ padding: '6px 12px', marginRight: 6, background: 'rgba(220,53,69,0.15)', color: '#f8a8b8', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toggleAdmin(item.id, false)}>Revoke Admin</button>
                      )}
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
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>User Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, color: '#d7e6f3' }}>
                <div><strong>ID:</strong> {selected.id}</div>
                <div><strong>Name:</strong> {selected.name}</div>
                <div><strong>Email:</strong> {selected.email}</div>
                <div><strong>Phone:</strong> {selected.phone || '—'}</div>
                <div><strong>Role:</strong> <span className={`admin-pill ${selected.isSuperAdmin ? '' : 'pending'}`}>{selected.isSuperAdmin ? 'Admin' : 'User'}</span></div>
                <div><strong>Joined:</strong> {new Date(selected.createdAt).toLocaleDateString()}</div>
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
      `}</style>
    </div>
  );
}
