import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default function AccountPage() {
  redirect('/account/orders');
}
