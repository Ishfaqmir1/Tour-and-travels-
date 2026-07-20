'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getBlogPosts({ all: 'true' });
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing({ title: '', slug: '', excerpt: '', content: '', author: '', coverImage: '', published: false }); setShowModal(true); };
  const openEdit = (item: BlogPost) => { setEditing({ ...item }); setShowModal(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this post?')) return;
    try {
      const api = new ApiClient();
      await api.deleteBlogPost(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const togglePublish = async (id: number, published: boolean) => {
    try {
      const api = new ApiClient();
      await api.updateBlogPost(id, { published });
      fetchData();
    } catch { alert('Failed to toggle publish'); }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const api = new ApiClient();
      if (editing.id) {
        await api.updateBlogPost(editing.id, editing);
      } else {
        await api.createBlogPost(editing);
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
            <h3>Blog</h3>
            <p>Manage blog posts ({items.length})</p>
          </div>
          <div className="admin-panel-header-actions">
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Post</button>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No blog posts yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.author || '—'}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`admin-pill ${item.published ? '' : 'pending'}`}>{item.published ? 'Published' : 'Draft'}</span>
                    </td>
                    <td>
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', marginRight: 6 }} onClick={() => openEdit(item)}>Edit</button>
                      <button className="admin-btn" style={{ padding: '6px 12px', marginRight: 6, background: 'rgba(32,201,151,0.15)', color: '#20c997', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => togglePublish(item.id, !item.published)}>{item.published ? 'Unpublish' : 'Publish'}</button>
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
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>{editing?.id ? 'Edit Post' : 'Create Post'}</h3>
              <div className="admin-form">
                <div className="admin-form-group"><label>Title</label><input value={editing?.title || ''} onChange={e => setEditing(prev => ({ ...prev!, title: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Slug</label><input value={editing?.slug || ''} onChange={e => setEditing(prev => ({ ...prev!, slug: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Author</label><input value={editing?.author || ''} onChange={e => setEditing(prev => ({ ...prev!, author: e.target.value }))} /></div>
                <div className="admin-form-group full-width"><label>Excerpt</label><textarea value={editing?.excerpt || ''} onChange={e => setEditing(prev => ({ ...prev!, excerpt: e.target.value }))} rows={2} /></div>
                <div className="admin-form-group full-width"><label>Content (HTML supported)</label><textarea value={editing?.content || ''} onChange={e => setEditing(prev => ({ ...prev!, content: e.target.value }))} rows={6} /></div>
                <div className="admin-form-group"><label>Cover Image URL</label><input value={editing?.coverImage || ''} onChange={e => setEditing(prev => ({ ...prev!, coverImage: e.target.value }))} /></div>
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
      `}</style>
    </div>
  );
}
