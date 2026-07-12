'use client';

export const runtime = 'edge';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2, KeyRound, CheckCircle2, X, Send } from 'lucide-react';
import { signInWithEmail, requestPasswordReset } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (formData: FormData) => {
    setError(null);
    setLoading(true);
    const result = await signInWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    const formData = new FormData();
    formData.append('email', forgotEmail);

    const result = await requestPasswordReset(formData);
    setForgotLoading(false);

    if (result?.error) {
      setForgotError(result.error);
    } else {
      setForgotSuccess(true);
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
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#FCFBF9]">
      {/* Left Side: Image (Hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="/images/hero-beauty.png"
          alt="Premium Cosmetics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
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
            Discover the secret to flawless, glowing skin with our premium cosmetic collection.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative min-h-screen md:min-h-0">
        {/* Glow effect for mobile if image is hidden */}
        <div className="md:hidden absolute top-0 right-0 w-64 h-64 bg-[#C9A94E] rounded-full filter blur-[100px] opacity-10" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center md:text-left space-y-2">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-6">
              <Image
                src="/images/brand/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="rounded-full border border-[#C9A94E] shadow-sm"
              />
            </div>
            <h2 className="font-display font-semibold text-3xl text-[#9A7B2F] tracking-wider">Welcome Back</h2>
            <p className="text-sm text-[#706A60]">Sign in to your premium beauty account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg animate-in fade-in">
              {error}
            </div>
          )}

          <form action={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-[#5C554D] font-semibold tracking-wide uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. sneha@example.com"
                  required
                  className="w-full input-dark text-sm pl-11 py-3 bg-white border-[#EFECE6] focus:border-[#C9A94E] focus:ring-[#C9A94E] rounded-lg transition-all"
                />
                <Mail className="absolute left-4 top-3.5 text-[#8A8177]" size={18} />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-[#5C554D] font-semibold tracking-wide uppercase">Password</label>
                <Link
                  href="/forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotEmail(emailInput);
                    setForgotError(null);
                    setForgotSuccess(false);
                    setShowForgotModal(true);
                  }}
                  className="text-[10px] text-[#9A7B2F] hover:text-[#C9A94E] font-bold tracking-wide uppercase transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full input-dark text-sm pl-11 pr-12 py-3 bg-white border-[#EFECE6] focus:border-[#C9A94E] focus:ring-[#C9A94E] rounded-lg transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center space-x-2 py-4 text-sm font-semibold mt-8 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-lg"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-[#EFECE6]"></div>
            <span className="flex-shrink mx-4 text-[10px] text-[#8A8177] uppercase tracking-widest font-semibold">or</span>
            <div className="flex-grow border-t border-[#EFECE6]"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn-outline-gold w-full text-sm font-semibold py-3.5 flex items-center justify-center space-x-3 bg-white hover:bg-[#FBF9F6] disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-lg"
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

          <p className="text-sm text-center text-[#706A60] pt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#9A7B2F] hover:text-[#C9A94E] font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Interactive Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#EFECE6] animate-in zoom-in-95 duration-200 relative">
            {/* Top gold accent line */}
            <div className="h-1.5 bg-gradient-to-r from-[#C9A94E] via-[#E2C97E] to-[#9A7B2F]" />

            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[#8A8177] hover:text-[#38332C] p-1.5 rounded-full hover:bg-[#F8F6F0] transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              {!forgotSuccess ? (
                <>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-11 h-11 rounded-full bg-[#FCFBF9] border border-[#EFECE6] flex items-center justify-center text-[#C9A94E]">
                      <KeyRound size={22} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl text-[#38332C]">Reset Password</h3>
                      <p className="text-xs text-[#706A60]">Receive a secure link to your email</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#5C554D] leading-relaxed mb-6">
                    Enter the email address associated with your account and we&apos;ll send you instructions to reset your password.
                  </p>

                  {forgotError && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg">
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5C554D] uppercase tracking-wide mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. sneha@example.com"
                          className="w-full text-sm pl-11 py-3 bg-white border border-[#EFECE6] focus:border-[#C9A94E] focus:ring-1 focus:ring-[#C9A94E] rounded-lg transition-all text-[#38332C]"
                        />
                        <Mail className="absolute left-4 top-3.5 text-[#8A8177]" size={18} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn-gold w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 transition-all rounded-lg mt-2"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          <span>Sending Reset Link...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Reset Link</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="font-display font-semibold text-2xl text-[#38332C] mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-[#5C554D] mb-4">
                    We&apos;ve sent a password reset link to <strong className="text-[#38332C]">{forgotEmail}</strong>.
                  </p>
                  <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-lg p-3.5 text-xs text-[#706A60] text-left mb-6">
                    <p className="font-medium text-[#5C554D] mb-1">Didn&apos;t receive it?</p>
                    <p>Be sure to check your spam or promotions folder. Reset links expire after 24 hours.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForgotSuccess(false)}
                      className="flex-1 py-2.5 text-xs font-semibold text-[#8A8177] hover:text-[#38332C] border border-[#EFECE6] rounded-lg hover:bg-[#F8F6F0] transition-colors"
                    >
                      Try Another Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 btn-gold py-2.5 text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
