'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Loader2 } from 'lucide-react';
import { signUp } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (formData: FormData) => {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-primary">
      {/* Left Side: Brand Editorial Image (Hidden on mobile) */}
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
            Join salon professionals and beauty enthusiasts accessing direct authentic cosmetic formulations.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative min-h-screen md:min-h-0">
        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="text-center md:text-left space-y-2">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-5">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border shadow-sm">
                <Image
                  src="/images/brand/logo.png"
                  alt="Beauty Looks Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-accent font-medium">New Account</p>
            <h2 className="font-serif text-3xl font-normal text-text-main tracking-tight">Create Account</h2>
            <p className="text-sm text-text-muted">Sign up to manage orders, wishlist, and fast checkout</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm animate-in fade-in">
              {error}
            </div>
          )}

          <form action={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-text-muted font-medium tracking-wider uppercase">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Priya Sharma"
                  required
                  className="w-full text-sm pl-11 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                />
                <User className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-text-muted font-medium tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. priya@example.com"
                  required
                  className="w-full text-sm pl-11 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                />
                <Mail className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-text-muted font-medium tracking-wider uppercase">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full text-sm pl-11 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                />
                <Phone className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-text-muted font-medium tracking-wider uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
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
              <label className="text-xs text-text-muted font-medium tracking-wider uppercase">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full text-sm pl-11 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                />
                <Lock className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5 text-sm font-medium tracking-wide mt-6 rounded-sm shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-xs text-text-muted uppercase tracking-widest font-normal">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full btn-secondary text-sm font-medium py-3 flex items-center justify-center space-x-3 rounded-sm shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span>{googleLoading ? 'Redirecting...' : 'Continue with Google'}</span>
          </button>

          <p className="text-sm text-center text-text-muted pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium underline underline-offset-4 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
