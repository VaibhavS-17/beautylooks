import ClientPage from './ClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us | Beauty Looks Mumbai",
  description: "Get in touch with Beauty Looks Mumbai.",
};

export default function Page() {
  return <ClientPage />;
}
