import ClientPage from './ClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ | Beauty Looks Mumbai",
  description: "Frequently asked questions about Beauty Looks Mumbai products and services.",
};

export default function Page() {
  return <ClientPage />;
}
