'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

const signInSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Confirm password is required.'),
  fullName: z.string().min(1, 'Full name is required.').max(100),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.').max(15).optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function signInWithEmail(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input.' };
  }

  // Rate limit login attempts by email
  const rl = await rateLimit(`signIn:${parsed.data.email}`, 5, 60_000);
  if (!rl.success) {
    return { error: 'Too many login attempts. Please try again in a minute.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error('Sign in error:', error);
    // Don't leak whether the email exists or not
    return { error: 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  redirect('/account');
}

export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    fullName: formData.get('fullName') as string,
    phone: formData.get('phone') as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input.' };
  }

  // Rate limit signup attempts by email
  const rl = await rateLimit(`signUp:${parsed.data.email}`, 3, 60_000);
  if (!rl.success) {
    return { error: 'Too many signup attempts. Please try again later.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
    },
  });

  if (error) {
    console.error('Sign up error:', error);
    return { error: 'Could not create account. Please try again.' };
  }

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    });
  }

  revalidatePath('/', 'layout');
  redirect('/account');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

export async function requestPasswordReset(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid email address.' };
  }

  const rl = await rateLimit(`resetPassword:${parsed.data.email}`, 3, 60_000);
  if (!rl.success) {
    return { error: 'Too many reset requests. Please try again in a minute.' };
  }

  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'beautylooks.vercel.app';
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const origin = `${protocol}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error('Password reset error:', error);
    return { error: error.message || 'Could not send password reset email. Please verify your email address.' };
  }

  return { success: true };
}

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Please confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export async function updatePassword(formData: FormData) {
  const raw = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = updatePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid password.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error('Update password error:', error);
    return { error: error.message || 'Could not update password. Your reset session may have expired.' };
  }

  return { success: true };
}
