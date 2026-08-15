import ClientPage from './ClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Shipping Policy | Beauty Looks Mumbai",
  description: "Information about shipping and delivery for Beauty Looks Mumbai.",
};

export default function Page() {
  return <ClientPage />;
}
