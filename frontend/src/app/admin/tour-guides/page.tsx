'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface TourGuide {
  id: number;
  name: string;
  photo: string;
  description: string;
  rating: number;
  location: string;
  experience_years: number;
  languages: string;
  hire_cost: number;
  phone: string;
  email: string;
  destination_id: number | null;
  destination?: { id: number; title: string } | null;
}

interface Destination {
  id: number;
  title: string;
}

export default function AdminTourGuidesPage() {
  const [items, setItems] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<TourGuide> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getTourGuides();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDestinations = useCallback(async () => {
    try {
      const api = new ApiClient();
      const res = await api.getDestinations();
      setDestinations(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchDestinations(); }, [fetchData, fetchDestinations]);

  const openCreate = () => {
    setEditing({ name: '', photo: '', description: '', rating: 5, location: '', experience_years: 0, languages: '', hire_cost: 0, phone: '', email: '', destination_id: null });
    setShowModal(true);
  };

  const openEdit = (item: TourGuide) => {
    setEditing({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tour guide?')) return;
    try {
      const api = new ApiClient();
      await api.http.delete(`/api/tour-guides/${id}`);
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
        setEditing(prev => ({ ...prev!, photo: res.data.url }));
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
      const payload = {
        name: editing.name,
        photo: editing.photo || '',
        description: editing.description || '',
        rating: String(editing.rating || 5),
        location: editing.location || '',
        experience_years: String(editing.experience_years || 0),
        languages: editing.languages || '',
        hire_cost: editing.hire_cost ? String(editing.hire_cost) : null,
        phone: editing.phone || null,
        email: editing.email || null,
        destination_id: editing.destination_id ? String(editing.destination_id) : null,
      };

      if (editing.id) {
        await api.http.put(`/api/tour-guides/${editing.id}`, payload);
      } else {
        await api.http.post('/api/tour-guides', payload);
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
            <h3>Tour Guides</h3>
            <p>Manage tour guides ({items.length})</p>
          </div>
          <div className="admin-panel-header-actions">
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Guide</button>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No tour guides yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Experience</th>
                  <th>Hire Cost</th>
                  <th>Destination</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.photo ? <img src={item.photo.startsWith('http') ? item.photo : `http://localhost:8080${item.photo}`} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span style={{ opacity: 0.4 }}>—</span>}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.location}</td>
                    <td>⭐ {item.rating}/5</td>
                    <td>{item.experience_years} yrs</td>
                    <td>₹{item.hire_cost}/day</td>
                    <td>{item.destination?.title || '—'}</td>
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
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>{editing?.id ? 'Edit Guide' : 'Create Guide'}</h3>
              <div className="admin-form">
                <div className="admin-form-group"><label>Name</label><input value={editing?.name || ''} onChange={e => setEditing(prev => ({ ...prev!, name: e.target.value }))} /></div>
                <div className="admin-form-group">
                  <label>Photo</label>
                  <div className="admin-file-input-wrap">
                    <input type="file" accept="image/*" id="guide-photo-upload" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => document.getElementById('guide-photo-upload')?.click()} disabled={uploading}>
                      {uploading ? '⏳ Uploading...' : '📁 Choose Photo'}
                    </button>
                    {editing?.photo && <span className="admin-upload-status">✅ Uploaded</span>}
                  </div>
                  {editing?.photo && (
                    <div className="admin-upload-preview">
                      <img src={editing.photo.startsWith('http') ? editing.photo : `http://localhost:8080${editing.photo}`} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button className="admin-array-remove" onClick={() => setEditing(prev => ({ ...prev!, photo: '' }))}>✕ Remove</button>
                    </div>
                  )}
                </div>
                <div className="admin-form-group full-width"><label>Description</label><textarea value={editing?.description || ''} onChange={e => setEditing(prev => ({ ...prev!, description: e.target.value }))} rows={3} /></div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Location</label><input value={editing?.location || ''} onChange={e => setEditing(prev => ({ ...prev!, location: e.target.value }))} placeholder="e.g. Srinagar, Kashmir" /></div>
                  <div className="admin-form-group"><label>Languages</label><input value={editing?.languages || ''} onChange={e => setEditing(prev => ({ ...prev!, languages: e.target.value }))} placeholder="e.g. Hindi, English, Kashmiri" /></div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" value={editing?.rating || 5} onChange={e => setEditing(prev => ({ ...prev!, rating: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label>Experience (years)</label><input type="number" min="0" value={editing?.experience_years || 0} onChange={e => setEditing(prev => ({ ...prev!, experience_years: Number(e.target.value) }))} /></div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Hire Cost (₹/day)</label><input type="number" min="0" value={editing?.hire_cost || 0} onChange={e => setEditing(prev => ({ ...prev!, hire_cost: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label>Destination</label>
                    <select value={editing?.destination_id || ''} onChange={e => setEditing(prev => ({ ...prev!, destination_id: e.target.value ? Number(e.target.value) : null }))}>
                      <option value="">— None —</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Phone</label><input value={editing?.phone || ''} onChange={e => setEditing(prev => ({ ...prev!, phone: e.target.value }))} /></div>
                  <div className="admin-form-group"><label>Email</label><input type="email" value={editing?.email || ''} onChange={e => setEditing(prev => ({ ...prev!, email: e.target.value }))} /></div>
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
        .admin-modal { background: #0d2039; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 28px; width: min(700px, 100%); max-height: 90vh; overflow-y: auto; }
        .admin-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
        @media (max-width: 640px) { .admin-form-row { grid-template-columns: 1fr; } }
        .admin-file-input-wrap { display: flex; align-items: center; gap: 10px; }
        .admin-upload-status { font-size: 0.8rem; color: #20c997; font-weight: 600; }
        .admin-upload-preview { margin-top: 8px; display: flex; align-items: center; gap: 10px; }
        .admin-upload-preview img { width: 60px; height: 60px; object-fit: cover; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); }
        .admin-array-remove { background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 1rem; padding: 2px 6px; border-radius: 6px; transition: background 0.2s; }
        .admin-array-remove:hover { background: rgba(255,107,107,0.15); }
        .admin-btn-sm { padding: 6px 14px !important; font-size: 0.85rem !important; }
        select { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #f8fcff; font-family: inherit; font-size: 0.95rem; }
        select option { background: #0d2039; color: #f8fcff; }
      `}</style>
    </div>
  );
}
