'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import { contactSchema, type ContactFormData } from '@/lib/schemas';
import { useSubmitContactMessage } from '@/lib/hooks';
import '../../styles/contact.css';

export default function ContactPage() {
  const mutation = useSubmitContactMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await mutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        message: data.message.trim(),
      });
      if (response?.status === 'success') {
        reset();
      }
    } catch (err: any) {
      // error handled by error state below
    }
  };

  return (
    <div className="contact-container">
      <Navbar theme="dark" />
      <div className="contact-left">
        <h1>Contact THE VICEROY TOUR & TRAVELS ✈️</h1>
        <p>Have questions about destinations, bookings or tour guides? We're here to help you plan your perfect journey.</p>
        <div className="contact-info">
          📧 Email: support@viceroytravels.com <br />
          📞 Phone: +880 1234-567890 <br />
          📍 Location: Dhaka, Bangladesh
        </div>
        <Link href="/" className="btn-home">← Back to Homepage</Link>
      </div>

      <div className="contact-right">
        <div className="form-box">
          <h2>Send Us a Message</h2>
          <p>We'll get back to you as soon as possible.</p>
          {mutation.isSuccess && <div className="alert success">{mutation.data?.message || 'Message sent successfully!'}</div>}
          {mutation.isError && <div className="alert error">{(mutation.error as any)?.response?.data?.message || 'Something went wrong!'}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label>Your Name</label>
              <input type="text" {...register('name')} maxLength={255} className={errors.name ? 'error' : ''} />
              {errors.name && <small className="error-text">{errors.name.message}</small>}
            </div>
            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label>Your Email</label>
              <input type="email" {...register('email')} maxLength={255} className={errors.email ? 'error' : ''} />
              {errors.email && <small className="error-text">{errors.email.message}</small>}
            </div>
            <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
              <label>Your Message</label>
              <textarea {...register('message')} maxLength={2000} className={errors.message ? 'error' : ''}></textarea>
              {errors.message && <small className="error-text">{errors.message.message}</small>}
            </div>
            <button type="submit" className="btn-submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
