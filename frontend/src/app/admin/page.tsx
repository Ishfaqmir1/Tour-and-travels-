'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const statsCards = [
    { label: 'Total Packages', value: '—', icon: '🎫', color: '#ffb347', link: '/admin/packages' },
    { label: 'Destinations', value: '—', icon: '📍', color: '#20c997', link: '/admin/destinations' },
    { label: 'Bookings', value: '—', icon: '📋', color: '#6f42c1', link: '/admin/bookings' },
    { label: 'Messages', value: '—', icon: '✉️', color: '#fd7e14', link: '/admin/messages' },
    { label: 'Users', value: '—', icon: '👥', color: '#0d6efd', link: '/admin/users' },
    { label: 'Testimonials', value: '—', icon: '⭐', color: '#d63384', link: '/admin/testimonials' },
  ];

  const quickActions = [
    { label: 'Add Package', icon: '➕', link: '/admin/packages' },
    { label: 'Add Destination', icon: '📍', link: '/admin/destinations' },
    { label: 'Add Hotel', icon: '🏨', link: '/admin/hotels' },
    { label: 'Gallery', icon: '🖼️', link: '/admin/gallery' },
    { label: 'Website Settings', icon: '⚙️', link: '/admin/website-settings' },
    { label: 'Blog', icon: '📝', link: '/admin/blog' },
  ];

  return (
    <div className="admin-dashboard-content">
      <div className="admin-hero">
        <div>
          <p className="admin-eyebrow">Dashboard Overview</p>
          <h2>Welcome Back</h2>
          <p>Manage your travel agency from one central panel</p>
          <div className="admin-owner-card">
            <span>THE VICEROY TOUR & TRAVELS</span>
          </div>
        </div>
      </div>

      <div className="admin-stats-grid">
        {statsCards.map((card, i) => (
          <Link href={card.link} key={i}>
            <motion.div
              className="admin-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <span className="stat-icon" style={{ background: `${card.color}22`, color: card.color }}>{card.icon}</span>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="admin-actions-grid">
          {quickActions.map((action, i) => (
            <Link href={action.link} key={i}>
              <motion.div
                className="admin-action-card"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="action-icon">{action.icon}</span>
                <span>{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
