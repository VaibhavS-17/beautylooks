'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const signInSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  fullName: z.string().min(1, 'Full name is required.').max(100),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.').max(15).optional().or(z.literal('')),
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
  const rl = rateLimit(`signIn:${parsed.data.email}`, 5, 60_000);
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
    fullName: formData.get('fullName') as string,
    phone: formData.get('phone') as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input.' };
  }

  // Rate limit signup attempts by email
  const rl = rateLimit(`signUp:${parsed.data.email}`, 3, 60_000);
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
