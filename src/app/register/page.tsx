import ClientPage from './ClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Register | Beauty Looks Mumbai",
  description: "Create a new account.",
};

export default function Page() {
  return <ClientPage />;
}
