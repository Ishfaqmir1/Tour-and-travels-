'use client';

import React, { useState, useEffect } from 'react';
import ApiClient from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [cpw, setCpw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const api = new ApiClient();
      const res = await api.updateProfile(name, email, phone, address);
      if (res?.status === 'success') {
        setMessage('Profile updated successfully!');
        await refreshUser();
      } else {
        setMessage('Failed to update profile.');
      }
    } catch {
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpw.newPw !== cpw.confirm) { setPwMsg('Passwords do not match.'); return; }
    if (cpw.newPw.length < 6) { setPwMsg('Password must be at least 6 characters.'); return; }
    setSaving(true);
    try {
      const api = new ApiClient();
      const res = await api.changePassword(cpw.current, cpw.newPw);
      if (res?.status === 'success') {
        setPwMsg('Password changed successfully!');
        setCpw({ current: '', newPw: '', confirm: '' });
      } else {
        setPwMsg(res?.message || 'Failed to change password.');
      }
    } catch {
      setPwMsg('An error occurred.');
    } finally {
      setSaving(false);
      setTimeout(() => setPwMsg(''), 3000);
    }
  };

  return (
    <div className="admin-dashboard-content">
      <motion.div className="admin-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="admin-eyebrow">Account</p>
          <h2>Your Profile</h2>
          <p>Manage your admin account settings</p>
        </div>
        {user?.is_super_admin && (
          <div className="admin-owner-card">
            <span>👑 Super Admin</span>
          </div>
        )}
      </motion.div>

      <motion.div className="admin-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="admin-panel-header">
          <h3>Profile Information</h3>
        </div>
        {message && <div style={{ padding: '10px 14px', background: 'rgba(32,201,151,0.1)', borderRadius: 12, color: '#20c997', marginBottom: 16 }}>{message}</div>}
        <form onSubmit={handleSaveProfile}>
          <div className="admin-form">
            <div className="admin-form-group">
              <label>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label>Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      <motion.div className="admin-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="admin-panel-header">
          <h3>Change Password</h3>
        </div>
        {pwMsg && (
          <div style={{ padding: '10px 14px', background: pwMsg.includes('success') ? 'rgba(32,201,151,0.1)' : 'rgba(220,53,69,0.1)', borderRadius: 12, color: pwMsg.includes('success') ? '#20c997' : '#f8a8b8', marginBottom: 16 }}>
            {pwMsg}
          </div>
        )}
        <form onSubmit={handleChangePassword}>
          <div className="admin-form">
            <div className="admin-form-group">
              <label>Current Password</label>
              <input type="password" value={cpw.current} onChange={e => setCpw(prev => ({ ...prev, current: e.target.value }))} required />
            </div>
            <div className="admin-form-group">
              <label>New Password</label>
              <input type="password" value={cpw.newPw} onChange={e => setCpw(prev => ({ ...prev, newPw: e.target.value }))} required />
            </div>
            <div className="admin-form-group">
              <label>Confirm New Password</label>
              <input type="password" value={cpw.confirm} onChange={e => setCpw(prev => ({ ...prev, confirm: e.target.value }))} required />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
