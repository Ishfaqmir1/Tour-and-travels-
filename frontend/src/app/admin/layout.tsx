'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/admin-dashboard.css';

const sidebarItems = [
  { key: '', label: 'Dashboard', icon: '📊' },
  { key: 'packages', label: 'Packages', icon: '🎫' },
  { key: 'destinations', label: 'Destinations', icon: '📍' },
  { key: 'hotels', label: 'Hotels', icon: '🏨' },
  { key: 'tour-guides', label: 'Tour Guides', icon: '🧑‍🏫' },
  { key: 'taxis', label: 'Taxi', icon: '🚕' },
  { key: 'gallery', label: 'Gallery', icon: '🖼️' },
  { key: 'bookings', label: 'Bookings', icon: '📋' },
  { key: 'messages', label: 'Messages', icon: '✉️' },
  { key: 'testimonials', label: 'Testimonials', icon: '⭐' },
  { key: 'blog', label: 'Blog', icon: '📝' },
  { key: 'faqs', label: 'FAQs', icon: '❓' },
  { key: 'website-settings', label: 'Settings', icon: '⚙️' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'roles', label: 'Roles', icon: '🔐' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isSuperAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentSection = pathname.split('/admin/')[1] || '';

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!isSuperAdmin) {
    router.push('/profile');
    return null;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <motion.aside
          className="admin-sidebar"
          animate={{ width: sidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3 }}
        >
          <div className="admin-brand">
            <div className="admin-brand-badge">VT</div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <h1>Viceroy</h1>
                <p>Admin Panel</p>
              </motion.div>
            )}
            <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {sidebarOpen && (
            <div className="admin-user-chip">
              <small>Signed in as</small>
              <strong>{user?.name || 'Admin'}</strong>
              <span>{user?.email || ''}</span>
            </div>
          )}

          <nav className="admin-nav">
            {sidebarItems.map((item) => (
              <Link
                key={item.key}
                href={`/admin${item.key ? `/${item.key}` : ''}`}
                className={`admin-nav-item ${currentSection === item.key ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="admin-sidebar-footer">
              <Link href="/" className="admin-back-link">← Back to Website</Link>
              <button className="admin-logout-btn" onClick={async () => { await logout(); router.push('/login'); }}>
                🚪 Logout
              </button>
            </div>
          )}
        </motion.aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
