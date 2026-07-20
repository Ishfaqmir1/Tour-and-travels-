'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { registerSchema, type RegisterFormData } from '@/lib/schemas';
import { Label } from '@/components/ui/label';
import '../../styles/register.css';

export default function SignupPage() {
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirmation: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      const response = await authRegister(data.name, data.email, data.password);
      if (response.status === 'success') {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => router.push('/profile'), 1500);
      } else setError(response.message || 'Something went wrong!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <Navbar theme="dark" />
      <div className="auth-background-image"></div>
      <div className="auth-background-overlay"></div>
      <div className="travel-elements">
        <span>✈️</span><span>🌍</span><span>🏝️</span><span>⛵</span><span>🌅</span>
      </div>

      <motion.div className="auth-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.div className="auth-right" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="form-box">
            <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2>Create Account 🌟</h2>
              <p className="subtitle">Register to start your journey</p>
            </motion.div>
            {success && <motion.div className="alert success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{success}</motion.div>}
            {error && <motion.div className="alert error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <motion.div className={`form-group ${errors.name ? 'has-error' : ''}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <input type="text" {...formRegister('name')} placeholder="Enter your full name" className={errors.name ? 'error' : ''} id="register-name" />
                <Label htmlFor="register-name">Full Name</Label>
                <span className="input-icon">👤</span>
                {errors.name && <small className="error-text">{errors.name.message}</small>}
              </motion.div>

              <motion.div className={`form-group ${errors.email ? 'has-error' : ''}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                <input type="email" {...formRegister('email')} placeholder="Enter your email" className={errors.email ? 'error' : ''} id="register-email" />
                <Label htmlFor="register-email">Email Address</Label>
                <span className="input-icon">📧</span>
                {errors.email && <small className="error-text">{errors.email.message}</small>}
              </motion.div>

              <motion.div className={`form-group password-group ${errors.password ? 'has-error' : ''}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                <input type={showPassword ? 'text' : 'password'} {...formRegister('password')} placeholder="Create a password" className={errors.password ? 'error' : ''} id="register-password" />
                <Label htmlFor="register-password">Password</Label>
                <span className="input-icon">🔒</span>
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                {errors.password && <small className="error-text">{errors.password.message}</small>}
              </motion.div>

              <motion.div className={`form-group password-group ${errors.passwordConfirmation ? 'has-error' : ''}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <input type={showConfirmPassword ? 'text' : 'password'} {...formRegister('passwordConfirmation')} placeholder="Confirm your password" className={errors.passwordConfirmation ? 'error' : ''} id="register-confirm-password" />
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <span className="input-icon">🔒</span>
                <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</span>
                {errors.passwordConfirmation && <small className="error-text">{errors.passwordConfirmation.message}</small>}
              </motion.div>

              <motion.button type="submit" className="btn-login" disabled={loading} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {loading ? 'Registering...' : 'Register'}
              </motion.button>
            </form>

            <motion.div className="bottom-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
              <p>Already have an account? <Link href="/login">Login</Link></p>
              <Link href="/" className="back-home">← Back to Homepage</Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
