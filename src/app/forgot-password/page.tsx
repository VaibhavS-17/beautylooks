'use client';

export const runtime = 'edge';

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
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#FCFBF9]">
      {/* Left Side: Brand Panel */}
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
            Recover access to your account and continue your premium beauty journey.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative min-h-screen md:min-h-0">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8A8177] hover:text-[#38332C] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>

          {!success ? (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#FCFBF9] border border-[#EFECE6] flex items-center justify-center text-[#C9A94E] mb-4 shadow-sm">
                  <KeyRound size={24} />
                </div>
                <h2 className="font-display font-semibold text-3xl text-[#9A7B2F] tracking-wider">
                  Forgot Password?
                </h2>
                <p className="text-sm text-[#706A60]">
                  Enter the email address associated with your account and we&apos;ll send you a recovery link.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg animate-in fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs text-[#5C554D] font-semibold tracking-wide uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sneha@example.com"
                      className="w-full input-dark text-sm pl-11 py-3 bg-white border border-[#EFECE6] focus:border-[#C9A94E] focus:ring-1 focus:ring-[#C9A94E] rounded-lg transition-all text-[#38332C]"
                    />
                    <Mail className="absolute left-4 top-3.5 text-[#8A8177]" size={18} />
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
            <div className="bg-white border border-[#EFECE6] rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-display font-semibold text-2xl text-[#38332C] mb-2">
                Check Your Email
              </h3>
              <p className="text-sm text-[#5C554D] mb-4">
                We have sent a password reset link to <strong className="text-[#38332C]">{email}</strong>.
              </p>
              <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-lg p-4 text-xs text-[#706A60] text-left mb-6">
                <p className="font-medium text-[#5C554D] mb-1">Didn&apos;t receive it?</p>
                <p>Check your spam or junk folder. Reset links expire after 24 hours.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="flex-1 py-3 text-xs font-semibold text-[#8A8177] hover:text-[#38332C] border border-[#EFECE6] rounded-lg hover:bg-[#F8F6F0] transition-colors"
                >
                  Try Another Email
                </button>
                <Link
                  href="/login"
                  className="flex-1 btn-gold py-3 text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center"
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
