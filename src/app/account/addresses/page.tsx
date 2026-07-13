import { createClient } from '@/lib/supabase/server';
import AddressManager from './AddressManager';

export const runtime = 'edge';

export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  const mappedAddresses = (addresses || []).map(addr => ({
    id: addr.id,
    label: addr.label,
    fullName: addr.full_name,
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2 || undefined,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    isDefault: addr.is_default
  }));

  return (
    <AddressManager initialAddresses={mappedAddresses} />
  );
}
