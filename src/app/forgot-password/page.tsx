'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Loader2, KeyRound, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { requestPasswordReset } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);

    const result = await requestPasswordReset(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-primary">
      {/* Left Side: Brand Panel */}
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
            Recover access to your account and continue your premium beauty journey.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative min-h-screen md:min-h-0">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-xs font-medium text-text-muted hover:text-text-main transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>

          {!success ? (
            <>
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center text-accent mb-4 shadow-xs">
                  <KeyRound size={22} />
                </div>
                <p className="text-xs uppercase tracking-widest text-accent font-medium">Recovery</p>
                <h2 className="font-serif text-3xl font-normal text-text-main tracking-tight">
                  Forgot Password?
                </h2>
                <p className="text-sm text-text-muted">
                  Enter the email address associated with your account and we&apos;ll send you a recovery link.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm animate-in fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs text-text-muted font-medium tracking-wider uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sneha@example.com"
                      className="w-full text-sm pl-11 py-3 bg-white border border-border focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-all text-text-main placeholder:text-text-muted/40"
                    />
                    <Mail className="absolute left-4 top-3.5 text-text-muted/60" size={18} />
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
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Reset Link</span>
                    </>
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
                Check Your Email
              </h3>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                We have sent a password reset link to <strong className="text-text-main">{email}</strong>.
              </p>
              <div className="bg-secondary/60 border border-border rounded-sm p-4 text-xs text-text-muted text-left mb-6">
                <p className="font-medium text-text-main mb-1">Didn&apos;t receive it?</p>
                <p>Check your spam or junk folder. Reset links expire after 24 hours.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="flex-1 py-3 text-xs font-medium text-text-muted hover:text-text-main border border-border rounded-sm hover:bg-secondary transition-colors"
                >
                  Try Another Email
                </button>
                <Link
                  href="/login"
                  className="flex-1 btn-primary py-3 text-xs font-medium rounded-sm shadow-sm flex items-center justify-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
