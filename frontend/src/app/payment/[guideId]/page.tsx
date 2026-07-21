'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { paymentSchema, type PaymentFormData } from '@/lib/schemas';
import { useTourGuide, useCreatePayment } from '@/lib/hooks';
import '../../../styles/payment.css';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const guideId = params.guideId as string;
  const numericId = Number(guideId);
  const { isAuthenticated } = useAuth();

  const { data: guide, isLoading, error: guideError } = useTourGuide(numericId);
  const paymentMutation = useCreatePayment();

  const [success, setSuccess] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { days: 1, nameOnCard: '', cardNumber: '', expiry: '', cvv: '' },
  });

  const days = watch('days');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/payment/${guideId}`);
    }
  }, [guideId, isAuthenticated, router]);

  const totalCost = guide?.hire_cost ? (Number(guide.hire_cost) * (days || 1)).toFixed(2) : '0.00';

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const response = await paymentMutation.mutateAsync({
        guide_id: numericId,
        days: data.days,
        name_on_card: data.nameOnCard,
        card_number: data.cardNumber,
        expiry: data.expiry,
        cvv: data.cvv,
      });
      if (response?.status === 'success') setSuccess(response.data);
    } catch (err: any) {
      // error handled by mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="payment-container">
        <Navbar theme="dark" />
        <div className="payment-card"><p>Loading guide details...</p></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="payment-container">
        <Navbar theme="dark" />
        <motion.div className="payment-card voucher-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="voucher-header">
            <span className="voucher-badge">✓ Payment Confirmed</span>
            <h2>Booking <span>Receipt</span></h2>
            <p className="subtitle">Transaction #{success.transaction_id}</p>
          </div>
          <div className="voucher-hero">
            <div>
              <p className="voucher-label">Tour Guide</p>
              <h3>{success.guide?.name || guide?.name}</h3>
              <p>📍 {success.guide?.location || guide?.location}</p>
            </div>
            <div className="voucher-stamp">Paid</div>
          </div>
          <div className="voucher-grid">
            <div className="voucher-item"><span>Duration</span><strong>{success.days || days} day{(success.days || days) > 1 ? 's' : ''}</strong></div>
            <div className="voucher-item"><span>Rate</span><strong>₹{Number(guide?.hire_cost || 0).toLocaleString('en-IN')} / day</strong></div>
            <div className="voucher-item"><span>Payment</span><strong>{success.card_brand || 'Card'} ****{success.card_last_four || '0000'}</strong></div>
            <div className="voucher-item total"><span>Total Charged</span><strong>₹{Number(success.amount || totalCost).toLocaleString('en-IN')}</strong></div>
          </div>
          <div className="voucher-note">A confirmation email has been sent to your registered email address.</div>
          <div className="voucher-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/profile" className="btn-pay" style={{ textDecoration: 'none', textAlign: 'center' }}>View My Bookings</Link>
            <Link href="/packages" className="btn-pay" style={{ textDecoration: 'none', textAlign: 'center', background: 'rgba(255,255,255,0.1)', color: '#fff', boxShadow: 'none' }}>Browse Travel Packages</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <Navbar theme="dark" />
      <motion.div className="payment-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h2>Hire <span>{guide?.name || 'Tour Guide'}</span></h2>
        <p className="subtitle">Complete your payment to secure your booking</p>

        {paymentMutation.isError && <div className="alert error">{(paymentMutation.error as any)?.response?.data?.message || 'Payment failed. Please try again.'}</div>}
        {guideError && <div className="alert error">{(guideError as any)?.message || 'Failed to load guide.'}</div>}
        {guide && (
          <div className="payment-details">
            <p>📍 <strong>{guide.location}</strong></p>
            <p>⭐ Rating: {guide.rating}/5 • {guide.experience_years} years exp.</p>
            <p>💰 <strong>₹{Number(guide.hire_cost || 0).toLocaleString('en-IN')}</strong> / day</p>
            <p>Total: <strong>₹{Number(totalCost).toLocaleString('en-IN')}</strong> for {days || 1} day{(days || 1) > 1 ? 's' : ''}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={`form-group ${errors.days ? 'has-error' : ''}`}>
            <label>Number of Days</label>
            <input type="number" min={1} max={30}
              onChange={(e) => setValue('days', Math.min(30, Math.max(1, parseInt(e.target.value) || 1)), { shouldValidate: true })}
              value={days || 1} />
            {errors.days && <small className="error-text">{errors.days.message}</small>}
          </div>
          <div className={`form-group ${errors.nameOnCard ? 'has-error' : ''}`}>
            <label>Name on Card</label>
            <input type="text" {...register('nameOnCard')} placeholder="John Doe" className={errors.nameOnCard ? 'error' : ''} />
            {errors.nameOnCard && <small className="error-text">{errors.nameOnCard.message}</small>}
          </div>
          <div className={`form-group ${errors.cardNumber ? 'has-error' : ''}`}>
            <label>Card Number</label>
            <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
              onChange={(e) => setValue('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16), { shouldValidate: true })}
              className={errors.cardNumber ? 'error' : ''} />
            {errors.cardNumber && <small className="error-text">{errors.cardNumber.message}</small>}
          </div>
          <div className="row">
            <div className={`form-group ${errors.expiry ? 'has-error' : ''}`} style={{ flex: 1 }}>
              <label>Expiry (MM/YY)</label>
              <input type="text" placeholder="12/28" maxLength={5}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  setValue('expiry', v, { shouldValidate: true });
                }}
                className={errors.expiry ? 'error' : ''} />
              {errors.expiry && <small className="error-text">{errors.expiry.message}</small>}
            </div>
            <div className={`form-group ${errors.cvv ? 'has-error' : ''}`} style={{ flex: 1 }}>
              <label>CVV</label>
              <input type="text" placeholder="123" maxLength={4}
                onChange={(e) => setValue('cvv', e.target.value.replace(/\D/g, '').slice(0, 4), { shouldValidate: true })}
                className={errors.cvv ? 'error' : ''} />
              {errors.cvv && <small className="error-text">{errors.cvv.message}</small>}
            </div>
          </div>
          <motion.button type="submit" className="btn-pay" disabled={paymentMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {paymentMutation.isPending ? 'Processing...' : `Pay ₹${Number(totalCost).toLocaleString('en-IN')}`}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
