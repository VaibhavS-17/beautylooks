'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Supabase Auth integration coming soon! Account created successfully.');
  };

  return (
    <div className="w-full min-h-[90vh] bg-[#FCFBF9] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md glass-card p-8 border border-[#EFECE6] bg-white space-y-8 relative overflow-hidden text-left shadow-lg">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C9A94E] rounded-full filter blur-[80px] opacity-10" />

        {/* Brand/Logo */}
        <div className="text-center space-y-2">
          <Image
            src="/images/brand/logo.png"
            alt="Beauty Looks Mumbai"
            width={60}
            height={60}
            className="rounded-full border border-[#C9A94E] mx-auto shadow-sm"
          />
          <h2 className="font-display font-semibold text-2xl text-[#9A7B2F] tracking-wider">Create Account</h2>
          <p className="text-xs text-[#706A60]">Join our premium cosmetics & skincare family</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-xs text-[#5C554D] mb-1 font-medium">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Priya Sharma"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full input-dark text-sm pl-10"
              />
              <User className="absolute left-3.5 top-3 text-[#8A8177]" size={16} />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-xs text-[#5C554D] mb-1 font-medium">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="e.g. priya@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full input-dark text-sm pl-10"
              />
              <Mail className="absolute left-3.5 top-3 text-[#8A8177]" size={16} />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-xs text-[#5C554D] mb-1 font-medium">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full input-dark text-sm pl-10"
              />
              <Phone className="absolute left-3.5 top-3 text-[#8A8177]" size={16} />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-xs text-[#5C554D] mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full input-dark text-sm pl-10 pr-10"
              />
              <Lock className="absolute left-3.5 top-3 text-[#8A8177]" size={16} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#8A8177] hover:text-[#9A7B2F]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label className="text-xs text-[#5C554D] mb-1 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full input-dark text-sm pl-10"
              />
              <Lock className="absolute left-3.5 top-3 text-[#8A8177]" size={16} />
            </div>
          </div>

          <button type="submit" className="btn-gold w-full flex items-center justify-center space-x-2 py-3.5 text-sm mt-6 shadow-sm">
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
        </form>

        {/* Footer link */}
        <p className="text-xs text-center text-[#706A60] pt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-[#9A7B2F] hover:underline font-semibold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
