'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { usePackage, useCreateBooking } from '@/lib/hooks';
import toast from 'react-hot-toast';
import '../../../../styles/booking.css';

const bookingFormSchema = z.object({
  customer_name: z.string().min(1, 'Name is required').max(255),
  customer_email: z.string().min(1, 'Email is required').email('Valid email required'),
  customer_phone: z.string().optional().or(z.literal('')),
  travelers: z.number().min(1, 'At least 1 traveler').max(50, 'Maximum 50 travelers'),
  travel_date: z.string().min(1, 'Travel date is required'),
  special_requests: z.string().optional().or(z.literal('')),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();
  const { data: pkg, isLoading: pkgLoading } = usePackage(slug);
  const bookingMutation = useCreateBooking();
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/packages/${slug}/book`);
    }
  }, [isAuthenticated, slug, router]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customer_name: user?.name || '',
      customer_email: user?.email || '',
      customer_phone: '',
      travelers: 1,
      travel_date: '',
      special_requests: '',
    },
  });

  const travelers = watch('travelers');
  const disc = pkg?.discount_percent || 0;
  const originalPrice = pkg?.price || 0;
  const discountedPrice = disc > 0 ? originalPrice - (originalPrice * disc / 100) : originalPrice;
  const totalCost = (discountedPrice || 0) * (travelers || 1);

  const onSubmit = async (data: BookingFormData) => {
    try {
      const response = await bookingMutation.mutateAsync({
        package_id: pkg.id,
        user_id: user?.id || 0,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone || undefined,
        travelers: data.travelers,
        travel_date: data.travel_date,
        special_requests: data.special_requests || undefined,
      });
      if (response?.status === 'success') {
        setSuccess(response.data);
        toast.success('Booking confirmed!');
      } else {
        toast.error(response?.message || 'Booking failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  if (pkgLoading) {
    return (
      <div className="booking-page">
        <Navbar theme="dark" />
        <div className="booking-shell"><div className="booking-loading">Loading package details...</div></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="booking-page">
        <Navbar theme="dark" />
        <div className="booking-shell">
          <div className="booking-error">
            <h2>Package not found</h2>
            <Link href="/packages">← Back to Packages</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="booking-page">
        <Navbar theme="dark" />
        <div className="booking-shell">
          <motion.div className="booking-success-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="booking-success-icon">✅</div>
            <h2>Booking Confirmed!</h2>
            <p className="booking-success-sub">Your package booking has been received.</p>
            <div className="booking-success-details">
              <div><span>Package</span><strong>{pkg.title}</strong></div>
              <div><span>Travelers</span><strong>{success.travelers || travelers}</strong></div>
              <div><span>Travel Date</span><strong>{success.travel_date || watch('travel_date')}</strong></div>
              <div><span>Status</span><strong className="booking-status-pending">{success.status || 'pending'}</strong></div>
            </div>
            <div className="booking-success-actions">
              <Link href="/profile" className="booking-btn-primary">View My Bookings</Link>
              <Link href="/packages" className="booking-btn-secondary">Browse More Packages</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Navbar theme="dark" />
      <div className="booking-shell">
        <div className="booking-breadcrumb">
          <Link href="/packages">← All Packages</Link>
          <span> / </span>
          <Link href={`/packages/${pkg.slug}`}>{pkg.title}</Link>
          <span> / Book</span>
        </div>

        <div className="booking-layout">
          {/* Booking Form */}
          <motion.div className="booking-form-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2>Book Your Package</h2>
            <p className="booking-subtitle">Fill in your details to confirm the booking.</p>

            {bookingMutation.isError && (
              <div className="booking-alert error">
                {(bookingMutation.error as any)?.response?.data?.message || 'Booking failed. Please try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={`booking-field ${errors.customer_name ? 'has-error' : ''}`}>
                <label>Full Name *</label>
                <input type="text" {...register('customer_name')} className={errors.customer_name ? 'error' : ''} />
                {errors.customer_name && <small>{errors.customer_name.message}</small>}
              </div>

              <div className={`booking-field ${errors.customer_email ? 'has-error' : ''}`}>
                <label>Email Address *</label>
                <input type="email" {...register('customer_email')} className={errors.customer_email ? 'error' : ''} />
                {errors.customer_email && <small>{errors.customer_email.message}</small>}
              </div>

              <div className={`booking-field ${errors.customer_phone ? 'has-error' : ''}`}>
                <label>Phone Number</label>
                <input type="text" {...register('customer_phone')} placeholder="Optional" />
              </div>

              <div className="booking-row">
                <div className={`booking-field ${errors.travelers ? 'has-error' : ''}`}>
                  <label>Travelers *</label>
                  <input type="number" min={1} max={50} {...register('travelers', { valueAsNumber: true })} className={errors.travelers ? 'error' : ''} />
                  {errors.travelers && <small>{errors.travelers.message}</small>}
                </div>

                <div className={`booking-field ${errors.travel_date ? 'has-error' : ''}`}>
                  <label>Travel Date *</label>
                  <input type="date" {...register('travel_date')} className={errors.travel_date ? 'error' : ''} />
                  {errors.travel_date && <small>{errors.travel_date.message}</small>}
                </div>
              </div>

              <div className={`booking-field ${errors.special_requests ? 'has-error' : ''}`}>
                <label>Special Requests</label>
                <textarea {...register('special_requests')} rows={3} placeholder="Any special requirements or preferences..." />
              </div>

              <motion.button
                type="submit"
                className="booking-submit-btn"
                disabled={bookingMutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {bookingMutation.isPending ? 'Processing...' : `Confirm Booking — ₹${totalCost.toLocaleString('en-IN')}`}
              </motion.button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div className="booking-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3>Booking Summary</h3>
            <div className="booking-summary-package">
              {pkg.image && <img src={pkg.image} alt={pkg.title} />}
              <div>
                <h4>{pkg.title}</h4>
                <p>📍 {pkg.location || pkg.country}</p>
                <p>📅 {pkg.duration || 'Flexible'}</p>
              </div>
            </div>
            <div className="booking-summary-divider"></div>
            <div className="booking-summary-row">
              <span>Package Price</span>
              <span>{disc > 0 ? (
                <><span style={{ textDecoration: 'line-through', opacity: 0.6 }}>₹{originalPrice.toLocaleString('en-IN')}</span> ₹{Math.round(discountedPrice).toLocaleString('en-IN')}</>
              ) : `₹${originalPrice.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="booking-summary-row">
              <span>Travelers</span>
              <span>x {travelers || 1}</span>
            </div>
            {disc > 0 && (
              <div className="booking-summary-row booking-summary-discount">
                <span>Discount</span>
                <span>-{disc}%</span>
              </div>
            )}
            <div className="booking-summary-divider"></div>
            <div className="booking-summary-row booking-summary-total">
              <span>Total</span>
              <strong>₹{totalCost.toLocaleString('en-IN')}</strong>
            </div>
            <p className="booking-summary-note">✓ No payment required now. We'll contact you to confirm.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
