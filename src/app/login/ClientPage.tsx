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
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Google OAuth Error:', err);
      setError(err?.message || 'Failed to initialize Google login. Please check configuration.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-primary">
      {/* Left Side: Brand Editorial Image (Hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 relative min-h-screen">
        <Image
          src="/images/hero-beauty.png"
          alt="Beauty Looks Mumbai Professional Cosmetics"
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
            Curating genuine salon-grade hair, skin, and beauty treatments directly to your vanity.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative min-h-screen md:min-h-0">
        <div className="w-full max-w-md space-y-8 relative z-10">
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
            <p className="text-xs uppercase tracking-widest text-accent font-medium">Account Access</p>
            <h2 className="font-serif text-3xl font-normal text-text-main tracking-tight">Welcome Back</h2>
            <p className="text-sm text-text-muted">Sign in to your Beauty Looks Mumbai account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm animate-in fade-in">
              {error}
            </div>
          )}

          <form action={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-text-muted font-medium tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. sneha@example.com"
                  required
                  className="w-full text-sm pl-11 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                />
                <Mail className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-text-muted font-medium tracking-wider uppercase">Password</label>
                <Link
                  href="/forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotEmail(emailInput);
                    setForgotError(null);
                    setForgotSuccess(false);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5 text-sm font-medium tracking-wide mt-6 rounded-sm shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
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
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent hover:text-accent-hover font-medium underline underline-offset-4 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Interactive Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-border animate-in zoom-in-95 duration-200 relative">
            {/* Top accent line */}
            <div className="h-1 bg-accent" />

            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-main p-1.5 rounded-full hover:bg-secondary transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              {!forgotSuccess ? (
                <>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-accent">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif font-normal text-xl text-text-main">Reset Password</h3>
                      <p className="text-xs text-text-muted">Receive a secure link to your email</p>
                    </div>
                  </div>

                  <p className="text-sm text-text-muted leading-relaxed mb-6">
                    Enter the email address associated with your account and we&apos;ll send you instructions to reset your password.
                  </p>

                  {forgotError && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm">
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. sneha@example.com"
                          className="w-full text-sm pl-11 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                        />
                        <Mail className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn-primary w-full flex items-center justify-center space-x-2 py-3 text-sm font-medium tracking-wide shadow-sm hover:shadow disabled:opacity-60 transition-all rounded-sm mt-3"
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
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-serif font-normal text-2xl text-text-main mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    We&apos;ve sent a password reset link to <strong className="text-text-main">{forgotEmail}</strong>.
                  </p>
                  <div className="bg-secondary/60 border border-border rounded-sm p-3.5 text-xs text-text-muted text-left mb-6">
                    <p className="font-medium text-text-main mb-1">Didn&apos;t receive it?</p>
                    <p>Be sure to check your spam or promotions folder. Reset links expire after 24 hours.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForgotSuccess(false)}
                      className="flex-1 py-2.5 text-xs font-medium text-text-muted hover:text-text-main border border-border rounded-sm hover:bg-secondary transition-colors"
                    >
                      Try Another Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 btn-primary py-2.5 text-xs font-medium tracking-wide rounded-sm shadow-sm"
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
