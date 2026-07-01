'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'product-query',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'product-query',
      message: '',
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#EFECE6] pb-6 mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-gold-gradient">
            Get In Touch
          </h1>
          <p className="text-xs text-[#8A8177] mt-2 font-light">
            We are here to assist you with order placement, product selection, or consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-6 sm:p-8 border border-[#EFECE6] bg-white space-y-6 shadow-sm">
              <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase border-b border-[#EFECE6] pb-3">
                Send Us a Message
              </h3>

              {submitted && (
                <div className="p-4 bg-[#4CAF5010] border border-[#4CAF50] rounded-xl flex items-center space-x-3 text-xs text-[#2E7D32] animate-fade-in">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold">Message sent successfully! We will get back to you shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col">
                    <label className="text-xs text-[#5C554D] mb-1 font-medium">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Aditi Rao"
                      className="input-dark text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col">
                    <label className="text-xs text-[#5C554D] mb-1 font-medium">Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 9876558071"
                      className="input-dark text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-xs text-[#5C554D] mb-1 font-medium">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. aditi@example.com"
                    className="input-dark text-sm"
                  />
                </div>

                {/* Subject */}
                <div className="flex flex-col">
                  <label className="text-xs text-[#5C554D] mb-1 font-medium">Inquiry Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="input-dark text-sm"
                  >
                    <option value="product-query">Product Recommendation & Query</option>
                    <option value="order-status">Order Status Tracking</option>
                    <option value="partner">Business & Brand Partnerships</option>
                    <option value="other">General Feedback</option>
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col">
                  <label className="text-xs text-[#5C554D] mb-1 font-medium">Message Body *</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe your skincare concern or questions..."
                    className="w-full bg-[#FCFBF9] border border-[#E2DDD5] rounded-lg p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C9A94E]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full flex items-center justify-center space-x-2 py-3.5 text-sm shadow-sm"
                >
                  <Send size={14} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Connect */}
            <div className="glass-card p-6 border border-[#EFECE6] bg-white space-y-4 shadow-sm">
              <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase border-b border-[#EFECE6] pb-3">
                Quick Info
              </h3>
              
              <div className="space-y-4 text-xs">
                {/* Phone */}
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#F9F7F3] rounded-lg text-[#9A7B2F] border border-[#EFECE6]">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8A8177] uppercase tracking-wider">Phone Calls</span>
                    <a href="tel:8879655807" className="font-semibold text-[#1A1A1A] hover:text-[#9A7B2F]">8879655807</a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#F9F7F3] rounded-lg text-[#9A7B2F] border border-[#EFECE6]">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8A8177] uppercase tracking-wider">WhatsApp Consultation</span>
                    <a
                      href="https://wa.me/918879655807"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#1A1A1A] hover:text-[#9A7B2F]"
                    >
                      Chat Live with Curator
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#F9F7F3] rounded-lg text-[#9A7B2F] border border-[#EFECE6]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8A8177] uppercase tracking-wider">Email Inquiry</span>
                    <a href="mailto:hello@beautylooksmumbai.com" className="font-semibold text-[#1A1A1A] hover:text-[#9A7B2F]">hello@beautylooksmumbai.com</a>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#F9F7F3] rounded-lg text-[#9A7B2F] border border-[#EFECE6]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8A8177] uppercase tracking-wider">Instagram</span>
                    <a
                      href="https://www.instagram.com/beauty.looks.mumbai?igsh=MTRjdHh6dDZjZ3UydQ=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#1A1A1A] hover:text-[#9A7B2F]"
                    >
                      @beauty.looks.mumbai
                    </a>
                  </div>
                </div>

                {/* MapPin */}
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#F9F7F3] rounded-lg text-[#9A7B2F] border border-[#EFECE6]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8A8177] uppercase tracking-wider">Office Address</span>
                    <span className="font-semibold text-[#1A1A1A]">Mumbai, Maharashtra, India</span>
                  </div>
                </div>

                {/* Clock */}
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#F9F7F3] rounded-lg text-[#9A7B2F] border border-[#EFECE6]">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#8A8177] uppercase tracking-wider">Business Hours</span>
                    <span className="font-semibold text-[#1A1A1A]">Mon - Sat: 10:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
