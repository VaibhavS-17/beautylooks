import ClientPage from './ClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login | Beauty Looks Mumbai",
  description: "Sign in to your account.",
};

export default function Page() {
  return <ClientPage />;
}
