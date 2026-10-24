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
    supabase.auth.getUser();
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
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-primary">
      {/* Left Side: Hero Image */}
      <div className="hidden md:block md:w-1/2 relative min-h-screen">
        <Image
          src="/images/hero-beauty.png"
          alt="Beauty Looks Mumbai Cosmetics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-dark/40 backdrop-brightness-90" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 text-white">
          <div className="relative w-20 h-20 mb-6 rounded-full overflow-hidden border border-accent/40 shadow-xl bg-brand-dark/30">
            <Image
              src="/images/brand/logo.png"
              alt="Beauty Looks Logo"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-2">
            Professional Salon Formulations
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-normal mb-4 tracking-tight text-white">
            Beauty Looks Mumbai
          </h1>
          <p className="text-sm lg:text-base font-light tracking-wide max-w-sm text-white/80 leading-relaxed">
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
                <div className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center text-accent mb-4 shadow-xs">
                  <KeyRound size={22} />
                </div>
                <p className="text-xs uppercase tracking-widest text-accent font-medium">Security</p>
                <h2 className="font-serif text-3xl font-normal text-text-main tracking-tight">
                  Set New Password
                </h2>
                <p className="text-sm text-text-muted">
                  Please enter your new password below to reset your account access.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm animate-in fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs text-text-muted font-medium tracking-wider uppercase">
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
                      className="w-full text-sm pl-11 pr-12 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                    />
                    <Lock className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-text-muted/60 hover:text-text-main transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs text-text-muted font-medium tracking-wider uppercase">
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
                      className="w-full text-sm pl-11 pr-12 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                    />
                    <Lock className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-text-muted/60 hover:text-text-main transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5 text-sm font-medium tracking-wide mt-4 rounded-sm shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
            <div className="bg-white border border-border rounded-lg p-8 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-serif font-normal text-2xl text-text-main mb-2">
                Password Reset Successful
              </h3>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                Your password has been securely updated. You can now use your new password to sign in.
              </p>
              <Link
                href="/login"
                className="btn-primary w-full py-3.5 text-sm font-medium rounded-sm shadow-sm flex items-center justify-center"
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
