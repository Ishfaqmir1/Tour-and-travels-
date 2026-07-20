'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string;
  isSystem: boolean;
  _count?: { users: number };
}

export default function AdminRolesPage() {
  const [items, setItems] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Role> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getRoles();
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing({ name: '', description: '', permissions: '[]', isSystem: false }); setShowModal(true); };
  const openEdit = (item: Role) => { setEditing({ ...item }); setShowModal(true); };

  const handleDelete = async (id: number) => {
    const role = items.find(r => r.id === id);
    if (role?.isSystem) { alert('System roles cannot be deleted.'); return; }
    if (!confirm('Delete this role?')) return;
    try {
      const api = new ApiClient();
      await api.deleteRole(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const api = new ApiClient();
      if (editing.id) {
        await api.updateRole(editing.id, editing);
      } else {
        await api.createRole(editing);
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
            <h3>Roles</h3>
            <p>Manage user roles ({items.length})</p>
          </div>
          <div className="admin-panel-header-actions">
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Role</button>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="admin-empty">No roles yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Users</th>
                  <th>System</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description || '—'}</td>
                    <td>{item._count?.users || 0}</td>
                    <td>{item.isSystem ? <span className="admin-pill">System</span> : <span style={{ opacity: 0.4 }}>—</span>}</td>
                    <td>
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', marginRight: 6 }} onClick={() => openEdit(item)}>Edit</button>
                      {!item.isSystem && (
                        <button className="admin-btn admin-btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(item.id)}>Del</button>
                      )}
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
              <h3 style={{ marginBottom: 18, color: '#f8fcff' }}>{editing?.id ? 'Edit Role' : 'Create Role'}</h3>
              <div className="admin-form">
                <div className="admin-form-group"><label>Name</label><input value={editing?.name || ''} onChange={e => setEditing(prev => ({ ...prev!, name: e.target.value }))} /></div>
                <div className="admin-form-group full-width"><label>Description</label><textarea value={editing?.description || ''} onChange={e => setEditing(prev => ({ ...prev!, description: e.target.value }))} rows={2} /></div>
                <div className="admin-form-group full-width"><label>Permissions (JSON array)</label><textarea value={editing?.permissions || '[]'} onChange={e => setEditing(prev => ({ ...prev!, permissions: e.target.value }))} rows={3} placeholder='["read:packages","write:packages"]' /></div>
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
