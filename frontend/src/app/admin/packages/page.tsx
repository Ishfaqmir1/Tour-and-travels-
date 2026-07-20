'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface PackageItem {
  id: number;
  title: string;
  slug: string;
  location: string;
  duration: string;
  price: number;
  discountPercent: number;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  destinationId: number | null;
}

export default function AdminPackagesPage() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<PackageItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getPackages({ all: 'true' });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing({ title: '', slug: '', location: '', duration: '', price: 0, discountPercent: 0, rating: 0, isFeatured: false, isActive: true }); setShowModal(true); };

  const openEdit = (item: PackageItem) => { setEditing({ ...item }); setShowModal(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this package?')) return;
    try {
      const api = new ApiClient();
      await api.deletePackage(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const api = new ApiClient();
      if (editing.id) {
        await api.updatePackage(editing.id, editing);
      } else {
        await api.createPackage(editing);
      }
      setShowModal(false);
      fetchData();
    } catch { alert('Failed to save'); } finally { setSaving(false); }
  };

  if (loading) return <div className="admin-state-card">Loading...</div>;
  if (error) return <div className="admin-state-card error">{error}</div>;

  return (
    <div className="admin-dashboard-content">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h3>Packages</h3>
            <p>Manage tour packages ({items.length})</p>
          </div>
          <div className="admin-panel-header-actions">
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Package</button>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No packages yet. Create your first one!</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.location}</td>
                    <td>{item.duration}</td>
                    <td>${item.price}</td>
                    <td>{item.discountPercent}%</td>
                    <td>⭐ {item.rating}</td>
                    <td><span className={`admin-pill ${item.isActive ? '' : 'cancelled'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', marginRight: 6 }} onClick={() => openEdit(item)}>Edit</button>
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
        {showModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>{editing?.id ? 'Edit Package' : 'Create Package'}</h3>
              <div className="admin-form">
                <div className="admin-form-group"><label>Title</label><input value={editing?.title || ''} onChange={e => setEditing(prev => ({ ...prev!, title: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Slug</label><input value={editing?.slug || ''} onChange={e => setEditing(prev => ({ ...prev!, slug: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Location</label><input value={editing?.location || ''} onChange={e => setEditing(prev => ({ ...prev!, location: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Duration</label><input value={editing?.duration || ''} onChange={e => setEditing(prev => ({ ...prev!, duration: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Price ($)</label><input type="number" value={editing?.price || 0} onChange={e => setEditing(prev => ({ ...prev!, price: Number(e.target.value) }))} /></div>
                <div className="admin-form-group"><label>Discount %</label><input type="number" value={editing?.discountPercent || 0} onChange={e => setEditing(prev => ({ ...prev!, discountPercent: Number(e.target.value) }))} /></div>
                <div className="admin-form-group"><label>Rating</label><input type="number" step="0.1" min="0" max="5" value={editing?.rating || 0} onChange={e => setEditing(prev => ({ ...prev!, rating: Number(e.target.value) }))} /></div>
                <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <label>Featured</label>
                  <input type="checkbox" checked={editing?.isFeatured || false} onChange={e => setEditing(prev => ({ ...prev!, isFeatured: e.target.checked }))} />
                </div>
                <div className="admin-form-actions">
                  <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .admin-modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .admin-modal { background: #0d2039; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 28px; width: min(600px, 100%); max-height: 90vh; overflow-y: auto; }
        input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; accent-color: #ffb347; }
      `}</style>
    </div>
  );
}
