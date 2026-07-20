'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { Label } from '@/components/ui/label';
import '../../styles/login.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, isSuperAdmin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push(isSuperAdmin ? '/admin' : '/profile');
    }
  }, [isAuthenticated, isSuperAdmin, router]);

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setLoading(true);
    try {
      const response = await login(data.email.trim(), data.password);
      if (response?.status === 'success' && response?.authorisation?.token) {
        router.push(response?.user?.is_super_admin ? '/admin' : '/profile');
        return;
      }
      setError(response?.message || 'Login failed. Please try again.');
    } catch (err: any) {
      if (err?.response?.status === 401) setError('Invalid credentials. Please try again.');
      else if (err?.response?.status === 422) {
        const validationErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;
        const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
        setError(firstError || err?.response?.data?.message || 'Please check your input.');
      } else setError(err?.response?.data?.message || 'Cannot connect to the backend server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar theme="dark" />
      <div className="auth-bg">
        <div className="auth-bg-overlay"></div>
        <div className="travel-particles">
          <span>✈️</span><span>🌍</span><span>🏝️</span><span>⛵</span><span>🌅</span><span>🗺️</span><span>🏖️</span><span>🧭</span>
        </div>
      </div>

      <motion.div className="login-container" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <motion.div className="login-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <motion.div className="login-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="login-logo">
              <span className="logo-icon">🌍</span>
              <h1>THE VICEROY TOUR & TRAVELS</h1>
            </div>
            <h2>Welcome Back! 👋</h2>
            <p className="login-subtitle">Login to continue your adventure</p>
          </motion.div>

          {error && (
            <motion.div className="login-alert error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <span>⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <motion.div className={`form-group ${errors.email ? 'has-error' : ''}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input type="email" {...register('email')} placeholder="Email Address" className={errors.email ? 'error' : ''} id="login-email" autoComplete="email" />
                <Label htmlFor="login-email">Email Address</Label>
              </div>
              {errors.email && <motion.small className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.email.message}</motion.small>}
            </motion.div>

            <motion.div className={`form-group ${errors.password ? 'has-error' : ''}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Password" className={errors.password ? 'error' : ''} id="login-password" autoComplete="current-password" />
                <Label htmlFor="login-password">Password</Label>
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <motion.small className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{errors.password.message}</motion.small>}
            </motion.div>

            <motion.div className="form-options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <label className="remember-me">
                <input type="checkbox" {...register('rememberMe')} />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Remember Me</span>
              </label>
              <Link href="/forgot-password" className="forgot-password">Forgot Password? 🔑</Link>
            </motion.div>

            <motion.button type="submit" className="login-btn" disabled={loading} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
              {loading ? <span className="loading-spinner"></span> : <>Login 🚀</>}
            </motion.button>
          </form>

          <motion.div className="login-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <p>Don't have an account? <Link href="/signup">Sign Up</Link></p>
            <Link href="/" className="back-home">← Back to Homepage</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
