'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas';
import { useRequestPasswordResetCode, useResetPassword } from '@/lib/hooks';
import '../../styles/reset-password.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  const resetPasswordMutation = useResetPassword();
  const resendMutation = useRequestPasswordResetCode();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: searchParams.get('email') || '', code: '', password: '', confirmPassword: '' },
  });

  const normalizeCode = (value: string) => value.replace(/\s+/g, '').trim().toLowerCase();

  const handleResendCode = async () => {
    setError('');
    setResendMsg('');
    const email = searchParams.get('email') || '';
    if (!email.trim()) { setError('No email found. Please go back and try again.'); return; }
    try {
      const response = await resendMutation.mutateAsync(email.trim());
      setResendMsg(response?.message || 'A new reset code has been sent to your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cannot connect to backend.');
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError('');
    setResendMsg('');
    const normalizedCode = normalizeCode(data.code);
    try {
      const response = await resetPasswordMutation.mutateAsync({
        email: data.email.trim(),
        code: normalizedCode,
        password: data.password,
      });
      setValue('code', '');
      setValue('password', '');
      setValue('confirmPassword', '');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err: any) {
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const errors = err.response.data.errors as Record<string, string[]>;
        setError(Object.values(errors)[0]?.[0] || 'Please check your input.');
      } else setError(err?.response?.data?.message || 'Cannot connect to backend.');
    }
  };

  return (
    <div className="reset-container">
      <Navbar theme="dark" />
      <div className="reset-card">
        <h2>Reset <span>Password</span></h2>
        <p className="subtitle">Create a new secure password</p>
        {error && <div className="alert error">{error}</div>}
        {resetPasswordMutation.isSuccess && <div className="alert success">{resetPasswordMutation.data?.message || 'Password reset successful! Redirecting...'}</div>}
        {resendMsg && <div className="alert success">{resendMsg}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <span className="input-icon">📧</span>
            <input type="email" {...register('email')} placeholder=" " className={errors.email ? 'error' : ''} />
            <label>Email Address</label>
            {errors.email && <small className="error-text">{errors.email.message}</small>}
          </div>
          <div className={`form-group ${errors.code ? 'has-error' : ''}`}>
            <span className="input-icon">🔢</span>
            <input type="text" {...register('code')} placeholder=" " onChange={(e) => { setValue('code', normalizeCode(e.target.value), { shouldValidate: true }); }} className={errors.code ? 'error' : ''} />
            <label>Reset Code</label>
            {errors.code && <small className="error-text">{errors.code.message}</small>}
          </div>
          <button type="button" className="btn-resend-code" onClick={handleResendCode} disabled={resendMutation.isPending || resetPasswordMutation.isPending}>
            {resendMutation.isPending ? 'Resending...' : 'Resend Code To Email'}
          </button>
          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <span className="input-icon">🔒</span>
            <input type="password" {...register('password')} placeholder=" " className={errors.password ? 'error' : ''} />
            <label>New Password</label>
            {errors.password && <small className="error-text">{errors.password.message}</small>}
          </div>
          <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
            <span className="input-icon">🔑</span>
            <input type="password" {...register('confirmPassword')} placeholder=" " className={errors.confirmPassword ? 'error' : ''} />
            <label>Confirm Password</label>
            {errors.confirmPassword && <small className="error-text">{errors.confirmPassword.message}</small>}
          </div>
          <button type="submit" className="btn-reset" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        <div className="bottom-text"><Link href="/login">Back to Login</Link></div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="reset-container"><Navbar theme="dark" /><div className="reset-card"><p>Loading...</p></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
