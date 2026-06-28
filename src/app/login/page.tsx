'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '@/app/actions/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (formData: FormData) => {
    setError(null);
    setLoading(true);
    const result = await signInWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If no error, the server action redirects — no need to setLoading(false)
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] bg-[#FCFBF9] flex items-center justify-center py-16 px-4">
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
          <h2 className="font-display font-semibold text-2xl text-[#9A7B2F] tracking-wider">Welcome Back</h2>
          <p className="text-xs text-[#706A60]">Sign in to your premium beauty account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-xs text-[#5C554D] mb-1 font-medium">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="e.g. sneha@example.com"
                required
                className="w-full input-dark text-sm pl-10"
              />
              <Mail className="absolute left-3.5 top-3 text-[#8A8177]" size={16} />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-[#5C554D] font-medium">Password</label>
              <Link href="#" onClick={(e) => { e.preventDefault(); alert('Reset password link sent (simulated)'); }} className="text-[10px] text-[#9A7B2F] hover:text-[#C9A94E] font-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center space-x-2 py-3.5 text-sm mt-6 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#EFECE6]"></div>
          <span className="flex-shrink mx-4 text-[10px] text-[#8A8177] uppercase tracking-wider font-semibold">or</span>
          <div className="flex-grow border-t border-[#EFECE6]"></div>
        </div>

        {/* Social login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn-outline-gold w-full text-xs py-3 flex items-center justify-center space-x-2 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{googleLoading ? 'Redirecting...' : 'Continue with Google'}</span>
        </button>

        {/* Footer link */}
        <p className="text-xs text-center text-[#706A60] pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#9A7B2F] hover:underline font-semibold">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}
