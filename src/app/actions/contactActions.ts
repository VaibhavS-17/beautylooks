'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(254),
  phone: z.string().max(15).optional().or(z.literal('')),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
});

const updateStatusSchema = z.object({
  id: z.string().uuid('Invalid message ID'),
  status: z.enum(['unread', 'read', 'replied']),
});

export async function submitContactForm(formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    const parsed = contactSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid form data.' };
    }

    const rl = await rateLimit('contact:' + parsed.data.email, 3, 60_000);
    if (!rl.success) {
      return { success: false, error: 'Too many messages sent. Please try again later.' };
    }

    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          subject: parsed.data.subject,
          message: parsed.data.message,
          status: 'unread'
        }
      ]);

    if (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error: 'Failed to submit message. Please try again later.' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Exception in submitContactForm:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateMessageStatus(id: string, status: 'unread' | 'read' | 'replied') {
  try {
    const parsed = updateStatusSchema.safeParse({ id, status });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input.' };
    }

    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: parsed.data.status })
      .eq('id', parsed.data.id);

    if (error) {
      console.error('Error updating message status:', error);
      return { success: false, error: 'Failed to update status.' };
    }
    
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Exception in updateMessageStatus:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

