'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function submitContactForm(formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
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
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);

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
