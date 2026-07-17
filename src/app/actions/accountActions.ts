'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().max(50).default('Home'),
  fullName: z.string().min(1, 'Full name is required.').max(100),
  phone: z.string().min(10, 'Valid phone number is required.').max(15),
  line1: z.string().min(1, 'Address line 1 is required.').max(200),
  line2: z.string().min(1, 'Address line 2 is required.').max(200),
  city: z.string().min(1, 'City is required.').max(100),
  state: z.string().min(1, 'State is required.').max(100),
  pincode: z.string().min(6, 'Valid pincode is required.').max(10),
  isDefault: z.boolean().default(false),
});

const uuidSchema = z.string().uuid('Invalid ID format.');

export async function createAddress(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const raw = {
    label: (formData.get('label') as string) || 'Home',
    fullName: formData.get('fullName') as string,
    phone: formData.get('phone') as string,
    line1: formData.get('line1') as string,
    line2: (formData.get('line2') as string) || null,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    pincode: formData.get('pincode') as string,
    isDefault: formData.get('isDefault') === 'true',
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid address data.' };
  }

  try {
    // Ensure profile exists to prevent foreign key constraint violations
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      phone: user.user_metadata?.phone || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    }, { onConflict: 'id' });

    // If setting as default, unset other defaults first
    if (parsed.data.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data: newAddress, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        label: parsed.data.label,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        line1: parsed.data.line1,
        line2: parsed.data.line2,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        is_default: parsed.data.isDefault,
      })
      .select()
      .single();

    if (error) {
      console.error('Create address error:', error);
      return { error: 'Failed to create address. Please try again.' };
    }

    revalidatePath('/account');
    return { success: true, data: newAddress };
  } catch (err: any) {
    console.error('Create address exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteAddress(addressId: string) {
  const parsed = uuidSchema.safeParse(addressId);
  if (!parsed.success) {
    return { error: 'Invalid address ID.' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', parsed.data)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete address error:', error);
      return { error: 'Failed to delete address. Please try again.' };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err: any) {
    console.error('Delete address exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateAddress(addressId: string, formData: FormData) {
  const parsedId = uuidSchema.safeParse(addressId);
  if (!parsedId.success) {
    return { error: 'Invalid address ID.' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const raw = {
    label: (formData.get('label') as string) || 'Home',
    fullName: formData.get('fullName') as string,
    phone: formData.get('phone') as string,
    line1: formData.get('line1') as string,
    line2: (formData.get('line2') as string) || null,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    pincode: formData.get('pincode') as string,
    isDefault: formData.get('isDefault') === 'true',
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid address data.' };
  }

  try {
    // If setting as default, unset other defaults first
    if (parsed.data.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data: updatedAddress, error } = await supabase
      .from('addresses')
      .update({
        label: parsed.data.label,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        line1: parsed.data.line1,
        line2: parsed.data.line2,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        is_default: parsed.data.isDefault,
      })
      .eq('id', parsedId.data)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update address error:', error);
      return { error: 'Failed to update address. Please try again.' };
    }

    revalidatePath('/account');
    return { success: true, data: updatedAddress };
  } catch (err: any) {
    console.error('Update address exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Full name must be at least 2 characters.' };
  }

  try {
    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Update profile error:', profileError);
      return { error: 'Failed to update profile data.' };
    }

    // Update user metadata in auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      }
    });

    if (authError) {
      console.error('Update user metadata error:', authError);
      return { error: 'Failed to update user profile.' };
    }

    revalidatePath('/account/profile');
    return { success: true };
  } catch (err: any) {
    console.error('Update profile exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: 'Not authenticated' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All password fields are required.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters.' };
  }

  try {
    // 1. Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { error: 'Incorrect current password.' };
    }

    // 2. Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Update password error:', updateError);
      return { error: 'Failed to update password.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Update password exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function upgradeGuestToAccount(email: string, password: string, fullName: string, phone: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    // We do not save address here because the user is typically not logged in until they verify email
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
