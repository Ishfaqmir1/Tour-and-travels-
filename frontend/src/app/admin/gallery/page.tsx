'use client';

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  type: string;
  album: string;
  destinationName: string;
  isActive: boolean;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [albums, setAlbums] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getGalleries({ all: 'true' });
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlbums = useCallback(async () => {
    try {
      const api = new ApiClient();
      const res = await api.getGalleryAlbums();
      setAlbums(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchAlbums(); }, [fetchData, fetchAlbums]);

  const openCreate = () => { setEditing({ url: '', title: '', type: 'photo', album_id: undefined, isActive: true }); setShowModal(true); };
  const openEdit = (item: any) => {
    const { album, ...rest } = item;
    setEditing({ ...rest, album_id: album?.id });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    try {
      const api = new ApiClient();
      await api.deleteGalleryItem(id);
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
      const endpoint = editing?.type === 'video' ? 'video' : 'image';
      const res = await api.http.post(`/api/upload/${endpoint}`, formData);
      if (res.data?.status === 'success' && res.data?.url) {
        setEditing(prev => ({ ...prev!, url: res.data.url }));
      } else {
        alert('Upload failed');
      }
    } catch (err: any) {
      alert('Upload error: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.url?.trim()) { alert('Image/Video URL is required'); return; }
    setSaving(true);
    try {
      const api = new ApiClient();
      if (editing.id) {
        await api.updateGalleryItem(editing.id, editing);
      } else {
        await api.createGalleryItem(editing);
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
            <h3>Gallery</h3>
            <p>Manage gallery items ({items.length})</p>
          </div>
          <div className="admin-panel-header-actions">
            <button className="admin-btn admin-btn-secondary" style={{ marginRight: 8 }} onClick={() => setView(view === 'grid' ? 'table' : 'grid')}>{view === 'grid' ? '📋 Table' : '📷 Grid'}</button>
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Item</button>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No gallery items yet.</div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {items.map(item => (
              <motion.div key={item.id} style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} whileHover={{ y: -4, scale: 1.02 }}>
                {item.type === 'video' ? (
                  <div style={{ width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>🎬</div>
                ) : (
                  <img src={item.url || item.src} alt={item.title || item.alt} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div style={{ padding: 12 }}>
                  <strong style={{ color: '#f8fcff', fontSize: '0.9rem' }}>{item.title || item.alt}</strong>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {item.type && <span className="admin-pill" style={{ fontSize: '0.7rem' }}>{item.type}</span>}
                    {(item.album?.title || item.album) && <span className="admin-pill" style={{ fontSize: '0.7rem', background: 'rgba(111,66,193,0.15)', color: '#b38cf0' }}>{item.album?.title || item.album}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button className="admin-btn admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => openEdit(item)}>Edit</button>
                    <button className="admin-btn admin-btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(item.id)}>Del</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Alt Text</th>
                  <th>Type</th>
                  <th>Album</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.type === 'video' ? <span>🎬</span> : <img src={item.url || item.src} alt="" style={{ width: 60, height: 40, borderRadius: 6, objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}</td>
                    <td>{item.title || item.alt}</td>
                    <td><span className="admin-pill">{item.type || 'photo'}</span></td>
                    <td>{item.album?.title || item.album || '—'}</td>
                    <td><span className={`admin-pill ${item.isActive !== false ? '' : 'cancelled'}`}>{item.isActive !== false ? 'Active' : 'Inactive'}</span></td>
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
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>{editing?.id ? 'Edit Item' : 'Add Gallery Item'}</h3>
              <div className="admin-form">
                <div className="admin-form-group full-width">
                  <label>Image / Video</label>
                  <div className="admin-file-input-wrap">
                    <input type="file" accept={editing?.type === 'video' ? 'video/*' : 'image/*'} id="gallery-file-upload" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => document.getElementById('gallery-file-upload')?.click()} disabled={uploading}>
                      {uploading ? '⏳ Uploading...' : '📁 Choose File'}
                    </button>
                    {editing?.url && <span className="admin-upload-status">✅ Uploaded</span>}
                  </div>
                  {editing?.url && editing?.type !== 'video' && (
                    <div className="admin-upload-preview">
                      <img src={editing.url.startsWith('http') ? editing.url : `http://localhost:8080${editing.url}`} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button className="admin-array-remove" onClick={() => setEditing(prev => ({ ...prev!, url: '' }))}>✕ Remove</button>
                    </div>
                  )}
                  {editing?.url && editing?.type === 'video' && (
                    <div className="admin-upload-preview">
                      <span className="admin-video-filename">🎬 {editing.url.split('/').pop()}</span>
                      <button className="admin-array-remove" onClick={() => setEditing(prev => ({ ...prev!, url: '' }))}>✕ Remove</button>
                    </div>
                  )}
                </div>
                <div className="admin-form-group"><label>Title</label><input value={editing?.title || ''} onChange={e => setEditing(prev => ({ ...prev!, title: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Type</label>
                  <select value={editing?.type || 'photo'} onChange={e => setEditing(prev => ({ ...prev!, type: e.target.value }))}>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="admin-form-group"><label>Album</label><select value={editing?.album_id || ''} onChange={e => setEditing(prev => ({ ...prev!, album_id: e.target.value ? Number(e.target.value) : undefined }))}><option value="">No album</option>{albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
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
        .admin-video-filename { font-size: 0.85rem; color: #c8d8e4; background: rgba(255,255,255,0.06); padding: 6px 12px; border-radius: 8px; }
        select { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #f8fcff; font-family: inherit; font-size: 0.95rem; }
        select option { background: #0d2039; color: #f8fcff; }
      `}</style>
    </div>
  );
}
