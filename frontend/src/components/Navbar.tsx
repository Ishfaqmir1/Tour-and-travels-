'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import './Navbar.css';

interface NavbarProps {
  theme?: 'default' | 'about' | 'dark';
}

export default function Navbar({ theme = 'default' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [clickedLink, setClickedLink] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isSuperAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (clickedLink) {
      const timer = setTimeout(() => setClickedLink(null), 300);
      return () => clearTimeout(timer);
    }
  }, [clickedLink]);

  const handleLinkClick = (name: string) => setClickedLink(name);

  const navLinks = [
    { name: 'Home', path: '/', className: 'home-link' },
    { name: 'About Us', path: '/about', className: 'about-link' },
    { name: 'Tour Guide', path: '/tourguide', className: 'tour-link' },
    { name: 'Contact', path: '/contact', className: 'contact-link' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navbarClass = `modern-navbar ${scrolled ? 'scrolled' : ''} ${theme === 'about' ? 'theme-about' : ''} ${theme === 'dark' ? 'theme-dark' : ''}`;

  const isActive = (path: string) => pathname === path;

  return (
    <motion.nav
      className={navbarClass}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        <motion.div
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Link href={isSuperAdmin ? '/admin/dashboard' : '/'}>
            <span className="logo-icon">🌍</span>
            <span className="logo-text">
              <span className="logo-travel">Travel</span>
              <span className="logo-world">World</span>
            </span>
          </Link>
        </motion.div>

        <ul className="navbar-links">
          {isSuperAdmin ? (
            <>
              <motion.li
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Link
                  href="/admin/dashboard"
                  className={`admin-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                  onClick={() => handleLinkClick('Admin Dashboard')}
                >
                  Admin Dashboard
                </Link>
              </motion.li>
              <motion.li
                className="admin-profile-chip"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <span>Super Admin</span>
                <strong>{user?.name || 'THE VICEROY TOUR & TRAVELS Super Admin'}</strong>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <button type="button" className="admin-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </motion.li>
            </>
          ) : (
            <>
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                >
                  <Link
                    href={link.path}
                    className={`${link.className} ${isActive(link.path) ? 'active' : ''} ${clickedLink === link.name ? 'clicked' : ''}`}
                    onClick={() => handleLinkClick(link.name)}
                  >
                    {link.name}
                    <span className="link-underline"></span>
                  </Link>
                </motion.li>
              ))}
              {!isAuthenticated ? (
                <>
                  <motion.li
                    className="login-link"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <Link
                      href="/login"
                      className={`login-link ${clickedLink === 'Login' ? 'clicked' : ''}`}
                      onClick={() => handleLinkClick('Login')}
                    >
                      Login
                    </Link>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <Link
                      href="/signup"
                      className={`register-btn ${clickedLink === 'Register' ? 'clicked' : ''}`}
                      onClick={() => handleLinkClick('Register')}
                    >
                      Register
                    </Link>
                  </motion.li>
                </>
              ) : null}
              <motion.li
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.65 }}
              >
                <Link
                  href="/profile"
                  className={`profile-btn ${clickedLink === 'Profile' ? 'clicked' : ''}`}
                  onClick={() => handleLinkClick('Profile')}
                >
                  👤 Profile
                </Link>
              </motion.li>
            </>
          )}
        </ul>

        <motion.button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          whileTap={{ scale: 0.95 }}
        >
          <span></span>
          <span></span>
          <span></span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="mobile-links">
              {isSuperAdmin ? (
                <>
                  <motion.li initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <Link href="/admin/dashboard" className="admin-link" onClick={() => handleLinkClick('Admin Dashboard')}>
                      Admin Dashboard
                    </Link>
                  </motion.li>
                  <motion.li initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <button type="button" className="admin-logout-btn mobile-admin-logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </motion.li>
                </>
              ) : (
                <>
                  {navLinks.map((link, index) => (
                    <motion.li key={link.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Link
                        href={link.path}
                        className={`${link.className} ${isActive(link.path) ? 'active' : ''}`}
                        onClick={() => handleLinkClick(link.name)}
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                  {!isAuthenticated ? (
                    <>
                      <motion.li initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Link href="/login" className="login-link" onClick={() => handleLinkClick('Login')}>Login</Link>
                      </motion.li>
                      <motion.li initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                        <Link href="/signup" className="register-btn" onClick={() => handleLinkClick('Register')}>Register</Link>
                      </motion.li>
                    </>
                  ) : null}
                  <motion.li initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
                    <Link href="/profile" className="profile-btn" onClick={() => handleLinkClick('Profile')}>👤 Profile</Link>
                  </motion.li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
