'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas';
import { useRequestPasswordResetCode } from '@/lib/hooks';
import '../../styles/forgot-password.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const mutation = useRequestPasswordResetCode();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMsg('');
    try {
      const response = await mutation.mutateAsync(data.email.trim());
      router.push(`/reset-password?email=${encodeURIComponent(data.email.trim())}`);
    } catch (err: any) {
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const errors = err.response.data.errors as Record<string, string[]>;
        setErrorMsg(Object.values(errors)[0]?.[0] || 'Please check your email address.');
      } else setErrorMsg(err?.response?.data?.message || 'Cannot connect to backend.');
    }
  };

  return (
    <div className="auth-container">
      <Navbar theme="dark" />
      <div className="auth-left">
        <div className="auth-left-bg"></div>
        <div className="auth-left-overlay"></div>
        <div className="travel-elements">
          <span>✈️</span><span>🌍</span><span>🏝️</span><span>🗺️</span><span>🌅</span><span>🏙️</span>
        </div>
        <div className="brand-content">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>THE VICEROY TOUR & TRAVELS ✈️</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Forgot your password? No worries! Reset it and continue your journey with us.</motion.p>
          <motion.div className="brand-features" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="feature-item"><span>🌟</span> Premium Guides</div>
            <div className="feature-item"><span>🛡️</span> Safe Travel</div>
            <div className="feature-item"><span>💫</span> Unforgettable Experiences</div>
          </motion.div>
        </div>
      </div>

      <div className="auth-right">
        <div className="form-box">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2>Forgot <span>Password?</span></h2>
            <p className="subtitle">Enter your email to receive a reset code in your inbox</p>
          </motion.div>
          {mutation.isSuccess && <motion.div className="alert success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{mutation.data?.message || 'Reset code sent!'}</motion.div>}
          {errorMsg && <motion.div className="alert error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{errorMsg}</motion.div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <motion.div className={`form-group ${errors.email ? 'has-error' : ''}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <input type="email" {...register('email')} placeholder="Enter your email" className={errors.email ? 'error' : ''} id="forgot-email" />
              <label htmlFor="forgot-email">Email Address</label>
              <span className="input-icon">📧</span>
              {errors.email && <small className="error-text">{errors.email.message}</small>}
            </motion.div>
            <motion.button type="submit" className="btn-login" disabled={mutation.isPending} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {mutation.isPending ? 'Sending...' : 'Get Reset Code'}
            </motion.button>
            <motion.div className="bottom-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <p>Remembered your password? <Link href="/login">Login</Link></p>
              <Link href="/" className="back-home">← Back to Homepage</Link>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}
