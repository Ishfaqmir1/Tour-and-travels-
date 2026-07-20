'use client';

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Taxi {
  id: number;
  name: string;
  slug: string;
  type: string;
  location: string;
  capacity: number;
  pricePerKm: number;
  image: string;
  driverName: string;
  driverPhone: string;
  isActive: boolean;
}

export default function AdminTaxisPage() {
  const [items, setItems] = useState<Taxi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Taxi> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getTaxis({ all: 'true' });
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing({ name: '', slug: '', type: 'car', location: '', capacity: 4, pricePerKm: 0, image: '', driverName: '', driverPhone: '', isActive: true }); setShowModal(true); };
  const openEdit = (item: Taxi) => { setEditing({ ...item }); setShowModal(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this taxi?')) return;
    try {
      const api = new ApiClient();
      await api.deleteTaxi(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleFileUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const api = new ApiClient();
      const res = await api.http.post('/api/upload/image', formData);
      if (res.data?.status === 'success' && res.data?.url) {
        setEditing(prev => ({ ...prev!, image: res.data.url }));
      } else { alert('Upload failed'); }
    } catch (err: any) {
      alert('Upload error: ' + (err?.response?.data?.message || err.message));
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      const api = new ApiClient();
      if (editing.id) {
        await api.updateTaxi(editing.id, editing);
      } else {
        await api.createTaxi(editing);
      }
      setShowModal(false);
      fetchData();
    } catch { alert('Failed to save'); } finally { setSaving(false); }
  };

  if (loading) return <div className="admin-state-card">Loading...</div>;
  if (error) return <div className="admin-state-card error">{error}</div>;

  const types = ['car', 'van', 'bus', 'luxury'];

  return (
    <div className="admin-dashboard-content">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h3>Taxi / Transport</h3>
            <p>Manage taxi & transport services ({items.length})</p>
          </div>
          <div className="admin-panel-header-actions">
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Vehicle</button>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No vehicles yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Price/km</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.image ? <img src={item.image.startsWith('http') ? item.image : `http://localhost:8080${item.image}`} alt="" style={{ width: 60, height: 40, borderRadius: 6, objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span style={{ opacity: 0.4 }}>—</span>}</td>
                    <td><strong>{item.name}</strong></td>
                    <td><span className="admin-pill">{item.type}</span></td>
                    <td>{item.location}</td>
                    <td>{item.capacity} seats</td>
                    <td>₹{item.pricePerKm}/km</td>
                    <td>{item.driverName}<br /><small style={{ opacity: 0.6 }}>{item.driverPhone}</small></td>
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
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>{editing?.id ? 'Edit Vehicle' : 'Create Vehicle'}</h3>
              <div className="admin-form">
                <div className="admin-form-group"><label>Name</label><input value={editing?.name || ''} onChange={e => setEditing(prev => ({ ...prev!, name: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Slug</label><input value={editing?.slug || ''} onChange={e => setEditing(prev => ({ ...prev!, slug: e.target.value }))} /></div>
                <div className="admin-form-group">
                  <label>Image</label>
                  <div className="admin-file-input-wrap">
                    <input type="file" accept="image/*" id="taxi-image-upload" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => document.getElementById('taxi-image-upload')?.click()} disabled={uploading}>
                      {uploading ? '⏳ Uploading...' : '📁 Choose Image'}
                    </button>
                    {editing?.image && <span className="admin-upload-status">✅ Uploaded</span>}
                  </div>
                  {editing?.image && (
                    <div className="admin-upload-preview">
                      <img src={editing.image.startsWith('http') ? editing.image : `http://localhost:8080${editing.image}`} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button className="admin-array-remove" onClick={() => setEditing(prev => ({ ...prev!, image: '' }))}>✕ Remove</button>
                    </div>
                  )}
                </div>
                <div className="admin-form-group"><label>Type</label><select value={editing?.type || 'car'} onChange={e => setEditing(prev => ({ ...prev!, type: e.target.value }))}>{types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                <div className="admin-form-group"><label>Location</label><input value={editing?.location || ''} onChange={e => setEditing(prev => ({ ...prev!, location: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Capacity (seats)</label><input type="number" value={editing?.capacity || 4} onChange={e => setEditing(prev => ({ ...prev!, capacity: Number(e.target.value) }))} /></div>
                <div className="admin-form-group"><label>Price/km (₹)</label><input type="number" step="0.01" value={editing?.pricePerKm || 0} onChange={e => setEditing(prev => ({ ...prev!, pricePerKm: Number(e.target.value) }))} /></div>
                <div className="admin-form-group"><label>Driver Name</label><input value={editing?.driverName || ''} onChange={e => setEditing(prev => ({ ...prev!, driverName: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Driver Phone</label><input value={editing?.driverPhone || ''} onChange={e => setEditing(prev => ({ ...prev!, driverPhone: e.target.value }))} /></div>
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
        .admin-file-input-wrap { display: flex; align-items: center; gap: 10px; }
        .admin-upload-status { font-size: 0.8rem; color: #20c997; font-weight: 600; }
        .admin-upload-preview { margin-top: 8px; display: flex; align-items: center; gap: 10px; }
        .admin-upload-preview img { width: 100px; height: 70px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }
        .admin-array-remove { background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 1rem; padding: 2px 6px; border-radius: 6px; transition: background 0.2s; }
        .admin-array-remove:hover { background: rgba(255,107,107,0.15); }
        .admin-btn-sm { padding: 6px 14px !important; font-size: 0.85rem !important; }
      `}</style>
    </div>
  );
}
