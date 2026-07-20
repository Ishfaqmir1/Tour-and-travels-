'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { profileSchema, changePasswordSchema, type ProfileFormData, type ChangePasswordFormData } from '@/lib/schemas';
import { useMyProfile, useMyPayments, useUpdateProfile, useChangePassword } from '@/lib/hooks';
import toast from 'react-hot-toast';
import '../../styles/profile.css';

export default function ProfilePageContent() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: hiredBookings = [], isLoading: bookingsLoading } = useMyPayments();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const onProfileSave = async (data: ProfileFormData) => {
    try {
      const response = await updateProfileMutation.mutateAsync({
        name: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || '',
        address: data.address?.trim() || '',
      });
      if (response?.status === 'success') {
        toast.success('Profile updated successfully.');
        setIsEditing(false);
      } else {
        toast.error(response?.message || 'Failed to update profile.');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile.');
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      const response = await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (response?.status === 'success') {
        toast.success('Password changed successfully.');
        setShowPasswordModal(false);
        resetPassword();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (profileLoading) {
    return (
      <div className="profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Navbar theme="dark" />
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar theme="dark" />
      <div className="profile-bg"></div>
      <div className="profile-overlay"></div>
      <div className="travel-elements">
        <span>✈️</span><span>🌍</span><span>🏝️</span><span>🗺️</span><span>🌄</span><span>🏔️</span>
      </div>

      <div className="profile-content">
        <motion.div className="profile-header-card" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="profile-header-bg"></div>
          <div className="profile-header-content">
            <div className="profile-avatar">
              {profile?.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="Profile" onError={(e) => { (e.target as HTMLImageElement).src = '/images/img.jpg'; }} />
              ) : (
                <div className="profile-avatar-placeholder">👤</div>
              )}
            </div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>{profile?.name || user?.name || 'User'}</motion.h1>
            <motion.div className="profile-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <button className="btn-change-password" onClick={() => setShowPasswordModal(true)}>🔐 Change Password</button>
              <button className="btn-logout-profile" onClick={handleLogout}>🚪 Logout</button>
            </motion.div>
          </div>
        </motion.div>

        <div className="profile-grid">
          <motion.div className="profile-card personal-info-card" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="card-header">
              <h2>👤 Personal Information</h2>
              <div className="card-header-actions">
                {isEditing && <span className="editing-badge">Editing</span>}
                <button type="button" className="btn-edit-inline" onClick={() => { if (isEditing) resetProfile(); setIsEditing(!isEditing); }} disabled={updateProfileMutation.isPending}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>
            <form onSubmit={handleProfileSubmit(onProfileSave)}>
              <div className="card-body">
                <div className={`info-group ${profileErrors.fullName ? 'has-error' : ''}`}>
                  <label>Full Name</label>
                  {isEditing ? (
                    <>
                      <input type="text" {...profileRegister('fullName')} className={`edit-input ${profileErrors.fullName ? 'error' : ''}`} />
                      {profileErrors.fullName && <small className="error-text">{profileErrors.fullName.message}</small>}
                    </>
                  ) : <p>{profile?.name || ''}</p>}
                </div>
                <div className={`info-group ${profileErrors.email ? 'has-error' : ''}`}>
                  <label>Email Address</label>
                  {isEditing ? (
                    <>
                      <input type="email" {...profileRegister('email')} className={`edit-input ${profileErrors.email ? 'error' : ''}`} />
                      {profileErrors.email && <small className="error-text">{profileErrors.email.message}</small>}
                    </>
                  ) : <p>{profile?.email || ''}</p>}
                </div>
                <div className={`info-group ${profileErrors.phone ? 'has-error' : ''}`}>
                  <label>Phone Number</label>
                  {isEditing ? (
                    <>
                      <input type="text" {...profileRegister('phone')} className={`edit-input ${profileErrors.phone ? 'error' : ''}`} placeholder="Add phone number" />
                      {profileErrors.phone && <small className="error-text">{profileErrors.phone.message}</small>}
                    </>
                  ) : <p>{profile?.phone || 'Not set'}</p>}
                </div>
                <div className={`info-group ${profileErrors.address ? 'has-error' : ''}`}>
                  <label>Address</label>
                  {isEditing ? (
                    <>
                      <input type="text" {...profileRegister('address')} className={`edit-input ${profileErrors.address ? 'error' : ''}`} placeholder="Add address" />
                      {profileErrors.address && <small className="error-text">{profileErrors.address.message}</small>}
                    </>
                  ) : <p>{profile?.address || 'Not set'}</p>}
                </div>
                {isEditing && (
                  <motion.button type="submit" className="btn-save" disabled={updateProfileMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {updateProfileMutation.isPending ? 'Saving...' : '💾 Save Changes'}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div className="profile-card history-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="card-header">
              <h2>🧳 Hired Tour Guides</h2>
              <span className="view-all">{hiredBookings.length} Booking{hiredBookings.length === 1 ? '' : 's'}</span>
            </div>
            <div className="card-body">
              {bookingsLoading ? (
                <div className="bookings-empty-state">Loading hired guides...</div>
              ) : hiredBookings.length === 0 ? (
                <div className="bookings-empty-state">
                  <p>You haven't hired any guide yet.</p>
                  <Link href="/tourguide" className="btn-bookings-retry">Hire a Guide</Link>
                </div>
              ) : (
                <div className="booking-list">
                  {hiredBookings.map((booking: any, index: number) => (
                    <motion.div key={booking.id} className="booking-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.08 }}>
                      <div className="booking-top-row">
                        <div className="travel-icon">🛫</div>
                        <div className="travel-details">
                          <h4>{booking.guide?.name || 'Tour Guide'}</h4>
                          <p>{booking.guide?.location || 'Location not available'}</p>
                        </div>
                        <span className="travel-status completed">{booking.status || 'completed'}</span>
                      </div>
                      <div className="booking-meta-grid">
                        <div><span className="booking-label">Booked On</span><p>{formatDate(booking.paid_at)}</p></div>
                        <div><span className="booking-label">Days</span><p>{booking.days} day{booking.days > 1 ? 's' : ''}</p></div>
                        <div><span className="booking-label">Total Cost</span><p>${Number(booking.amount || 0).toFixed(2)}</p></div>
                        <div><span className="booking-label">Transaction</span><p>{booking.transaction_id}</p></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => { setShowPasswordModal(false); resetPassword(); }}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Change Password</h3>
            {changePasswordMutation.isError && (
              <div className="password-error-text">{(changePasswordMutation.error as any)?.response?.data?.message || 'Failed to change password.'}</div>
            )}
            <form onSubmit={handlePasswordSubmit(onChangePassword)}>
              <div className={`form-group ${passwordErrors.currentPassword ? 'has-error' : ''}`}>
                <label>Current Password</label>
                <input type="password" {...passwordRegister('currentPassword')} className={passwordErrors.currentPassword ? 'error' : ''} />
                {passwordErrors.currentPassword && <small className="error-text">{passwordErrors.currentPassword.message}</small>}
              </div>
              <div className={`form-group ${passwordErrors.newPassword ? 'has-error' : ''}`}>
                <label>New Password</label>
                <input type="password" {...passwordRegister('newPassword')} className={passwordErrors.newPassword ? 'error' : ''} />
                {passwordErrors.newPassword && <small className="error-text">{passwordErrors.newPassword.message}</small>}
              </div>
              <div className={`form-group ${passwordErrors.confirmPassword ? 'has-error' : ''}`}>
                <label>Confirm New Password</label>
                <input type="password" {...passwordRegister('confirmPassword')} className={passwordErrors.confirmPassword ? 'error' : ''} />
                {passwordErrors.confirmPassword && <small className="error-text">{passwordErrors.confirmPassword.message}</small>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowPasswordModal(false); resetPassword(); }}>Cancel</button>
                <button type="submit" className="btn-confirm" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
