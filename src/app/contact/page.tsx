'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Message sent! Our team will get back to you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-brand-light py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent block mb-3">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-bold tracking-tight">
            Contact Beauty Looks Mumbai
          </h1>
          <p className="text-sm text-text-muted mt-4 max-w-xl mx-auto font-light leading-relaxed">
            Have a question about a formulation, shipping update, or beauty consultation? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-text-main mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="text-sm font-bold text-text-main mb-1">Flagship Studio</h3>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                Bandra West, Mumbai<br />Maharashtra 400050, India
              </p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-text-main mb-4">
                <Mail size={20} />
              </div>
              <h3 className="text-sm font-bold text-text-main mb-1">Email Support</h3>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                support@beautylooksmumbai.com<br />orders@beautylooksmumbai.com
              </p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-text-main mb-4">
                <Clock size={20} />
              </div>
              <h3 className="text-sm font-bold text-text-main mb-1">Business Hours</h3>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                Monday – Saturday: 10:00 AM – 7:00 PM IST<br />Sunday: Closed
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2">Message Received</h3>
                <p className="text-sm text-text-muted font-light max-w-md mx-auto">
                  Thank you for reaching out, {formData.name}. Our Mumbai support specialists will reply via email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-lg font-serif font-bold text-text-main mb-4">Send Us a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-main mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Priya Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:border-text-main"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-main mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="priya@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:border-text-main"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-main mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Order Inquiry / Skincare Recommendation"
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:border-text-main"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-main mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you today?"
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:border-text-main resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-text-main text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
