'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion } from 'framer-motion';

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  group: string;
  label: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = new ApiClient();
      const res = await api.getWebsiteSettings();
      setSettings(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateSetting = async (key: string, value: string) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const api = new ApiClient();
      await api.updateWebsiteSetting(key, { value, type: settings.find(s => s.key === key)?.type || 'text', group: settings.find(s => s.key === key)?.group || 'general', label: settings.find(s => s.key === key)?.label || key });
      await fetchData();
    } catch { alert('Failed to save'); } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const addSetting = async () => {
    const key = prompt('Enter setting key:');
    if (!key) return;
    const value = prompt('Enter value:');
    if (value === null) return;
    const group = prompt('Enter group (e.g. general, hero, social):') || 'general';
    const label = prompt('Enter display label:') || key;
    const type = prompt('Enter type (text, color, image, textarea):') || 'text';
    try {
      const api = new ApiClient();
      await api.updateWebsiteSetting(key, { value, type, group, label });
      await fetchData();
    } catch { alert('Failed to add setting'); }
  };

  const deleteSetting = async (id: number) => {
    if (!confirm('Delete this setting?')) return;
    try {
      const api = new ApiClient();
      await api.http.delete(`/api/website-settings/${id}`);
      setSettings(prev => prev.filter(s => s.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const groups = [...new Set(settings.map(s => s.group))];

  if (loading) return <div className="admin-state-card">Loading settings...</div>;
  if (error) return <div className="admin-state-card error">{error}</div>;

  return (
    <div className="admin-dashboard-content">
      <motion.div className="admin-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="admin-eyebrow">Configuration</p>
          <h2>Website Settings</h2>
          <p>Manage all site-wide settings. Changes appear instantly on the website.</p>
        </div>
        <div className="admin-panel-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={addSetting}>+ Add Setting</button>
        </div>
      </motion.div>

      {groups.length === 0 ? (
        <div className="admin-panel">
          <div className="admin-empty">No settings configured. Add your first setting above.</div>
        </div>
      ) : (
        groups.map(group => (
          <motion.div key={group} className="admin-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="admin-panel-header">
              <h3 style={{ textTransform: 'capitalize' }}>{group.replace('_', ' ')}</h3>
            </div>
            <div className="admin-form">
              {settings.filter(s => s.group === group).map(setting => (
                <div key={setting.id} className="admin-form-group" style={{ position: 'relative' }}>
                  <label title={setting.key}>{setting.label} <small style={{ opacity: 0.5, display: 'block', fontSize: '0.7rem' }}>{setting.key}</small></label>
                  {setting.type === 'textarea' ? (
                    <textarea
                      defaultValue={setting.value || ''}
                      onBlur={e => updateSetting(setting.key, e.target.value)}
                      rows={3}
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#f8fcff', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%', resize: 'vertical' }}
                    />
                  ) : setting.type === 'color' ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="color"
                        defaultValue={setting.value || '#000000'}
                        onChange={e => updateSetting(setting.key, e.target.value)}
                        style={{ width: 50, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }}
                      />
                      <span style={{ color: '#9eb6c9', fontSize: '0.85rem' }}>{setting.value}</span>
                    </div>
                  ) : (
                    <input
                      type={setting.type === 'image' ? 'url' : 'text'}
                      defaultValue={setting.value || ''}
                      onBlur={e => updateSetting(setting.key, e.target.value)}
                      placeholder={`Enter ${setting.label.toLowerCase()}`}
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#f8fcff', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%' }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, justifyContent: 'flex-end' }}>
                    {saving[setting.key] && <span style={{ fontSize: '0.75rem', color: '#ffb347' }}>saving...</span>}
                    <button
                      onClick={() => deleteSetting(setting.id)}
                      style={{ background: 'none', border: 'none', color: '#f8a8b8', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0 }}
                    >
                      remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
