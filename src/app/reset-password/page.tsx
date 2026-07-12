'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { updatePassword } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Ensure any URL hash access tokens from recovery links are picked up by Supabase client
    const supabase = createClient();
    supabase.auth.getSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);

    const result = await updatePassword(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#FCFBF9]">
      {/* Left Side: Hero Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="/images/hero-beauty.png"
          alt="Premium Cosmetics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 text-white">
          <Image
            src="/images/brand/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="rounded-full border-2 border-[#C9A94E] mb-6 shadow-xl"
          />
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4 tracking-wide text-white">
            Beauty Looks Mumbai
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wide max-w-md text-white/90">
            Secure your account with a new password and enjoy our luxury cosmetic collection.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative min-h-screen md:min-h-0">
        <div className="w-full max-w-md space-y-8 relative z-10">
          {!success ? (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#FCFBF9] border border-[#EFECE6] flex items-center justify-center text-[#C9A94E] mb-4 shadow-sm">
                  <KeyRound size={24} />
                </div>
                <h2 className="font-display font-semibold text-3xl text-[#9A7B2F] tracking-wider">
                  Set New Password
                </h2>
                <p className="text-sm text-[#706A60]">
                  Please enter your new password below to reset your account access.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg animate-in fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs text-[#5C554D] font-semibold tracking-wide uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full input-dark text-sm pl-11 pr-12 py-3 bg-white border-[#EFECE6] focus:border-[#C9A94E] focus:ring-[#C9A94E] rounded-lg transition-all text-[#38332C]"
                    />
                    <Lock className="absolute left-4 top-3.5 text-[#8A8177]" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-[#8A8177] hover:text-[#9A7B2F] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs text-[#5C554D] font-semibold tracking-wide uppercase">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full input-dark text-sm pl-11 pr-12 py-3 bg-white border-[#EFECE6] focus:border-[#C9A94E] focus:ring-[#C9A94E] rounded-lg transition-all text-[#38332C]"
                    />
                    <Lock className="absolute left-4 top-3.5 text-[#8A8177]" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-[#8A8177] hover:text-[#9A7B2F] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full flex items-center justify-center space-x-2 py-4 text-sm font-semibold mt-4 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="bg-white border border-[#EFECE6] rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-display font-semibold text-2xl text-[#38332C] mb-2">
                Password Reset Successful
              </h3>
              <p className="text-sm text-[#5C554D] mb-6">
                Your password has been securely updated. You can now use your new password to sign in.
              </p>
              <Link
                href="/login"
                className="btn-gold w-full py-3.5 text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center"
              >
                Sign In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
