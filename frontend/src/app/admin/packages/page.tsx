'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface PackageDay {
  id?: number;
  day_number: number;
  title: string;
  description: string;
  activities: string[];
  meals: string;
  hotel: string;
}

interface PackageItem {
  id: number;
  title: string;
  slug: string;
  location: string;
  country: string;
  category: string;
  duration: string;
  price: number;
  discountPercent: number;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  destinationId: number | null;
  destination?: { id: number; title: string; slug: string } | null;
  image: string;
  video: string;
  overview: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  days: PackageDay[];
}

interface Destination {
  id: number;
  title: string;
  slug: string;
}

export default function AdminPackagesPage() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<PackageItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'image' | 'video' | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);

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

  const fetchDestinations = useCallback(async () => {
    try {
      const api = new ApiClient();
      const res = await api.getDestinations();
      const data = Array.isArray(res.data) ? res.data : [];
      setDestinations(data);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchDestinations(); }, [fetchData, fetchDestinations]);

  const openCreate = () => {
    setEditing({
      title: '', slug: '', location: '', country: 'India', duration: '',
      price: 0, discountPercent: 0, rating: 0, image: '', video: '',
      category: '', overview: '', highlights: [], included: [], excluded: [],
      isFeatured: false, isActive: true, destinationId: null, days: [],
    });
    setShowModal(true);
  };

  const openEdit = async (item: PackageItem) => {
    // Fetch full details including days, highlights, included, excluded
    try {
      const api = new ApiClient();
      const res = await api.getPackage(item.slug);
      if (res?.status === 'success' && res?.data) {
        const pkg = res.data;
        setEditing({
          id: pkg.id,
          title: pkg.title,
          slug: pkg.slug,
          location: pkg.location || '',
          country: pkg.country || 'India',
          duration: pkg.duration || '',
          price: pkg.price || 0,
          discountPercent: pkg.discount_percent || 0,
          rating: pkg.rating || 0,
          image: pkg.image || '',
          video: pkg.video || '',
          category: pkg.category || '',
          overview: pkg.overview || '',
          highlights: Array.isArray(pkg.highlights) ? pkg.highlights : [],
          included: Array.isArray(pkg.included) ? pkg.included : [],
          excluded: Array.isArray(pkg.excluded) ? pkg.excluded : [],
          isFeatured: pkg.is_featured || false,
          isActive: pkg.is_active !== false,
          destinationId: pkg.destination?.id || null,
          days: Array.isArray(pkg.days) ? pkg.days.map((d: any) => ({
            id: d.id,
            day_number: d.day_number,
            title: d.title || '',
            description: d.description || '',
            activities: Array.isArray(d.activities) ? d.activities : [],
            meals: d.meals || '',
            hotel: d.hotel || '',
          })) : [],
        });
        setShowModal(true);
      }
    } catch {
      alert('Failed to load full package details. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this package?')) return;
    try {
      const api = new ApiClient();
      await api.deletePackage(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Failed to delete'); }
  };

  // Helpers for array fields
  const addArrayItem = (field: 'highlights' | 'included' | 'excluded') => {
    if (!editing) return;
    const val = prompt(`Add ${field.slice(0, -1)}:`);
    if (val) {
      setEditing(prev => ({ ...prev!, [field]: [...(prev![field] as string[] || []), val] }));
    }
  };

  const removeArrayItem = (field: 'highlights' | 'included' | 'excluded', index: number) => {
    if (!editing) return;
    const arr = [...(editing[field] as string[] || [])];
    arr.splice(index, 1);
    setEditing(prev => ({ ...prev!, [field]: arr }));
  };

  // Day-wise helpers
  const addDay = () => {
    if (!editing) return;
    const days = editing.days || [];
    setEditing(prev => ({
      ...prev!,
      days: [...days, { day_number: days.length + 1, title: '', description: '', activities: [], meals: '', hotel: '' }],
    }));
  };

  const removeDay = (index: number) => {
    if (!editing) return;
    const days = [...(editing.days || [])];
    days.splice(index, 1);
    // Re-number
    days.forEach((d, i) => d.day_number = i + 1);
    setEditing(prev => ({ ...prev!, days }));
  };

  const updateDay = (index: number, field: string, value: any) => {
    if (!editing) return;
    const days = [...(editing.days || [])];
    (days[index] as any)[field] = value;
    setEditing(prev => ({ ...prev!, days }));
  };

  const addDayActivity = (dayIndex: number) => {
    if (!editing) return;
    const val = prompt('Add activity:');
    if (val) {
      const days = [...(editing.days || [])];
      days[dayIndex].activities = [...(days[dayIndex].activities || []), val];
      setEditing(prev => ({ ...prev!, days }));
    }
  };

  // File upload handler
  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    if (!editing) return;
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const api = new ApiClient();
      const endpoint = type === 'image' ? 'image' : 'video';
      const res = await api.http.post(`/api/upload/${endpoint}`, formData);
      if (res.data?.status === 'success' && res.data?.url) {
        if (type === 'image') {
          setEditing(prev => ({ ...prev!, image: res.data.url }));
        } else {
          setEditing(prev => ({ ...prev!, video: res.data.url }));
        }
      } else {
        alert('Upload failed');
      }
    } catch (err: any) {
      alert('Upload error: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUploading(null);
    }
  };

  const removeDayActivity = (dayIndex: number, activityIndex: number) => {
    if (!editing) return;
    const days = [...(editing.days || [])];
    const acts = [...(days[dayIndex].activities || [])];
    acts.splice(activityIndex, 1);
    days[dayIndex].activities = acts;
    setEditing(prev => ({ ...prev!, days }));
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) { alert('Title is required'); return; }
    setSaving(true);
    try {
      const api = new ApiClient();
      const payload: any = {
        title: editing.title,
        slug: editing.slug,
        location: editing.location,
        country: editing.country,
        duration: editing.duration,
        price: String(editing.price || 0),
        discount_percent: editing.discountPercent || 0,
        rating: editing.rating || 0,
        image: editing.image || '',
        video: editing.video || '',
        overview: editing.overview || '',
        category: editing.category || '',
        highlights: editing.highlights || [],
        included: editing.included || [],
        excluded: editing.excluded || [],
        is_featured: !!editing.isFeatured,
        is_active: editing.isActive !== false,
        destination_id: editing.destinationId ? String(editing.destinationId) : null,
        days: (editing.days || []).map((d: PackageDay) => ({
          day_number: d.day_number,
          title: d.title || '',
          description: d.description || '',
          activities: d.activities || [],
          meals: d.meals || '',
          hotel: d.hotel || '',
        })),
      };

      if (editing.id) {
        await api.updatePackage(editing.id, payload);
      } else {
        await api.createPackage(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert('Failed to save: ' + (err?.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  if (loading) return <div className="admin-state-card">Loading...</div>;
  if (error) return <div className="admin-state-card error">{error}</div>;

  const displayPrice = (price: number, disc: number) => {
    if (disc > 0) {
      const discounted = price - (price * disc / 100);
      return <><span style={{ textDecoration: 'line-through', opacity: 0.6 }}>₹{price}</span> <strong>₹{Math.round(discounted)}</strong></>;
    }
    return <strong>₹{price}</strong>;
  };

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
                  <th>Destination</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Media</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong><br /><small style={{ opacity: 0.5 }}>{item.location}</small></td>
                    <td>{item.destination?.title || '—'}</td>
                    <td>{item.duration}</td>
                    <td>{displayPrice(item.price, item.discountPercent)}</td>
                    <td>{item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}</td>
                    <td>
                      {item.image ? <span title="Has image">📷</span> : ''}
                      {item.video ? <span title="Has video" style={{ marginLeft: 4 }}>🎬</span> : ''}
                    </td>
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
            <motion.div className="admin-modal admin-modal-wide" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: 18, color: '#f8fcff', fontSize: '1.3rem' }}>
                {editing?.id ? '✏️ Edit Package' : '➕ Create Package'}
              </h3>
              <div className="admin-form" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                {/* Basic Info */}
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Title *</label><input value={editing?.title || ''} onChange={e => setEditing(prev => ({ ...prev!, title: e.target.value }))} placeholder="e.g. Kashmir Grand Tour" /></div>
                  <div className="admin-form-group"><label>Slug</label><input value={editing?.slug || ''} onChange={e => setEditing(prev => ({ ...prev!, slug: e.target.value }))} placeholder="Auto-generated if empty" /></div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Location</label><input value={editing?.location || ''} onChange={e => setEditing(prev => ({ ...prev!, location: e.target.value }))} placeholder="e.g. Srinagar" /></div>
                  <div className="admin-form-group"><label>Country</label><input value={editing?.country || ''} onChange={e => setEditing(prev => ({ ...prev!, country: e.target.value }))} placeholder="India" /></div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Category</label>
                    <select value={editing?.category || ''} onChange={e => setEditing(prev => ({ ...prev!, category: e.target.value }))}>
                      <option value="">— Select Category —</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Honeymoon">Honeymoon</option>
                      <option value="Family">Family</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Trekking">Trekking</option>
                      <option value="Religious">Religious</option>
                      <option value="Wildlife">Wildlife</option>
                      <option value="Beach">Beach</option>
                      <option value="Wellness">Wellness</option>
                    </select>
                  </div>
                  <div className="admin-form-group"><label>Duration</label><input value={editing?.duration || ''} onChange={e => setEditing(prev => ({ ...prev!, duration: e.target.value }))} placeholder="e.g. 5 Days / 4 Nights" /></div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Destination</label>
                    <select value={editing?.destinationId || ''} onChange={e => setEditing(prev => ({ ...prev!, destinationId: e.target.value ? Number(e.target.value) : null }))}>
                      <option value="">— None —</option>
                      {destinations.map(d => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <h4 className="admin-form-section-title">💰 Pricing</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group"><label>Price (₹)</label><input type="number" min="0" value={editing?.price || 0} onChange={e => setEditing(prev => ({ ...prev!, price: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label>Discount %</label><input type="number" min="0" max="100" value={editing?.discountPercent || 0} onChange={e => setEditing(prev => ({ ...prev!, discountPercent: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label>Rating</label><input type="number" step="0.1" min="0" max="5" value={editing?.rating || 0} onChange={e => setEditing(prev => ({ ...prev!, rating: Number(e.target.value) }))} /></div>
                </div>

                {/* Media */}
                <h4 className="admin-form-section-title">📸 Media</h4>
                <div className="admin-upload-grid">
                  <div className="admin-upload-box">
                    <label>Package Image</label>
                    <div className="admin-file-input-wrap">
                      <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'image');
                          e.target.value = '';
                        }}
                      />
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={uploading === 'image'}
                      >
                        {uploading === 'image' ? '⏳ Uploading...' : '📁 Choose Image'}
                      </button>
                      {editing?.image && (
                        <span className="admin-upload-status">✅ Uploaded</span>
                      )}
                    </div>
                    {editing?.image && (
                      <div className="admin-upload-preview">
                        <img src={editing.image.startsWith('http') ? editing.image : `http://localhost:8080${editing.image}`} alt="preview"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <button className="admin-array-remove" onClick={() => setEditing(prev => ({ ...prev!, image: '' }))}>✕ Remove</button>
                      </div>
                    )}
                  </div>
                  <div className="admin-upload-box">
                    <label>Package Video</label>
                    <div className="admin-file-input-wrap">
                      <input
                        type="file"
                        accept="video/*"
                        id="video-upload"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'video');
                          e.target.value = '';
                        }}
                      />
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => document.getElementById('video-upload')?.click()}
                        disabled={uploading === 'video'}
                      >
                        {uploading === 'video' ? '⏳ Uploading...' : '🎬 Choose Video'}
                      </button>
                      {editing?.video && (
                        <span className="admin-upload-status">✅ Uploaded</span>
                      )}
                    </div>
                    {editing?.video && (
                      <div className="admin-upload-preview">
                        <span className="admin-video-filename">🎬 {editing.video.split('/').pop()}</span>
                        <button className="admin-array-remove" onClick={() => setEditing(prev => ({ ...prev!, video: '' }))}>✕ Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <h4 className="admin-form-section-title">📝 Description</h4>
                <div className="admin-form-group"><label>Overview / Description</label>
                  <textarea rows={5} value={editing?.overview || ''} onChange={e => setEditing(prev => ({ ...prev!, overview: e.target.value }))} placeholder="Describe the tour package..." style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#f8fcff', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }} />
                </div>

                {/* Highlights */}
                <h4 className="admin-form-section-title">⭐ Highlights</h4>
                <div className="admin-array-field">
                  {(editing?.highlights || []).map((item: string, i: number) => (
                    <div key={i} className="admin-array-item">
                      <span>{item}</span>
                      <button onClick={() => removeArrayItem('highlights', i)} className="admin-array-remove">✕</button>
                    </div>
                  ))}
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => addArrayItem('highlights')}>+ Add Highlight</button>
                </div>

                {/* Included */}
                <h4 className="admin-form-section-title">✅ Included</h4>
                <div className="admin-array-field">
                  {(editing?.included || []).map((item: string, i: number) => (
                    <div key={i} className="admin-array-item">
                      <span>✅ {item}</span>
                      <button onClick={() => removeArrayItem('included', i)} className="admin-array-remove">✕</button>
                    </div>
                  ))}
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => addArrayItem('included')}>+ Add Included</button>
                </div>

                {/* Excluded */}
                <h4 className="admin-form-section-title">❌ Excluded</h4>
                <div className="admin-array-field">
                  {(editing?.excluded || []).map((item: string, i: number) => (
                    <div key={i} className="admin-array-item">
                      <span>❌ {item}</span>
                      <button onClick={() => removeArrayItem('excluded', i)} className="admin-array-remove">✕</button>
                    </div>
                  ))}
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => addArrayItem('excluded')}>+ Add Excluded</button>
                </div>

                {/* Day-wise Itinerary */}
                <h4 className="admin-form-section-title">📅 Day-wise Itinerary</h4>
                <div className="admin-days-field">
                  {(editing?.days || []).map((day: PackageDay, i: number) => (
                    <div key={i} className="admin-day-card">
                      <div className="admin-day-header">
                        <strong>Day {day.day_number}</strong>
                        <button className="admin-btn admin-btn-danger admin-btn-xs" onClick={() => removeDay(i)}>Remove Day</button>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group"><label>Title</label><input value={day.title} onChange={e => updateDay(i, 'title', e.target.value)} placeholder="e.g. Arrival in Srinagar" /></div>
                        <div className="admin-form-group"><label>Meals</label><input value={day.meals} onChange={e => updateDay(i, 'meals', e.target.value)} placeholder="e.g. Breakfast, Dinner" /></div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group"><label>Hotel</label><input value={day.hotel} onChange={e => updateDay(i, 'hotel', e.target.value)} placeholder="e.g. Dal View Hotel" /></div>
                      </div>
                      <div className="admin-form-group"><label>Description</label>
                        <textarea rows={3} value={day.description} onChange={e => updateDay(i, 'description', e.target.value)} placeholder="What happens on this day..." style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#f8fcff', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }} />
                      </div>
                      <div className="admin-day-activities">
                        <label style={{ fontSize: '0.85rem', color: '#8ba4b8', marginBottom: 4, display: 'block' }}>Activities</label>
                        {(day.activities || []).map((act: string, ai: number) => (
                          <span key={ai} className="admin-activity-tag">
                            {act}
                            <button onClick={() => removeDayActivity(i, ai)} className="admin-array-remove" style={{ marginLeft: 6 }}>✕</button>
                          </span>
                        ))}
                        <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => addDayActivity(i)}>+ Activity</button>
                      </div>
                    </div>
                  ))}
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addDay} style={{ marginTop: 8 }}>
                    + Add Day
                  </button>
                </div>

                {/* Status */}
                <h4 className="admin-form-section-title">⚙️ Settings</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <label>Active</label>
                    <input type="checkbox" checked={editing?.isActive !== false} onChange={e => setEditing(prev => ({ ...prev!, isActive: e.target.checked }))} />
                  </div>
                  <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <label>Featured</label>
                    <input type="checkbox" checked={editing?.isFeatured || false} onChange={e => setEditing(prev => ({ ...prev!, isFeatured: e.target.checked }))} />
                  </div>
                </div>

                <div className="admin-form-actions" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : editing?.id ? 'Update Package' : 'Create Package'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .admin-modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .admin-modal-wide { background: #0d2039; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 28px; width: min(800px, 100%); max-height: 92vh; overflow-y: auto; }
        .admin-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
        @media (max-width: 640px) { .admin-form-row { grid-template-columns: 1fr; } }
        .admin-form-section-title { color: #ffb347; font-size: 0.95rem; font-weight: 700; margin: 20px 0 12px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .admin-array-field { margin-bottom: 4px; }
        .admin-array-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 8px 14px; margin-bottom: 6px; font-size: 0.9rem; color: #c8d8e4; }
        .admin-array-remove { background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 1rem; padding: 2px 6px; border-radius: 6px; transition: background 0.2s; }
        .admin-array-remove:hover { background: rgba(255,107,107,0.15); }
        .admin-btn-sm { padding: 6px 14px !important; font-size: 0.85rem !important; }
        .admin-btn-xs { padding: 4px 10px !important; font-size: 0.8rem !important; border-radius: 8px !important; }
        .admin-days-field { max-height: 500px; overflow-y: auto; }
        .admin-day-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; margin-bottom: 12px; }
        .admin-day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .admin-day-header strong { color: #f8fcff; font-size: 1rem; }
        input[type=\"checkbox\"] { width: 20px; height: 20px; cursor: pointer; accent-color: #ffb347; }
        .admin-activity-tag { display: inline-flex; align-items: center; background: rgba(255,180,70,0.12); color: #ffb347; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; margin: 0 6px 6px 0; }
        select { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #f8fcff; font-family: inherit; font-size: 0.95rem; }
        select option { background: #0d2039; color: #f8fcff; }
        .admin-upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 4px; }
        @media (max-width: 640px) { .admin-upload-grid { grid-template-columns: 1fr; } }
        .admin-upload-box { background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); border-radius: 16px; padding: 16px; }
        .admin-upload-box label { display: block; font-size: 0.85rem; color: #8ba4b8; margin-bottom: 10px; font-weight: 600; }
        .admin-file-input-wrap { display: flex; align-items: center; gap: 10px; }
        .admin-upload-status { font-size: 0.8rem; color: #20c997; font-weight: 600; }
        .admin-upload-preview { margin-top: 10px; display: flex; align-items: center; gap: 10px; }
        .admin-upload-preview img { width: 100px; height: 70px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }
        .admin-video-filename { font-size: 0.85rem; color: #c8d8e4; background: rgba(255,255,255,0.06); padding: 6px 12px; border-radius: 8px; }
      `}</style>
    </div>
  );
}
