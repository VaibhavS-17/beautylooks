import ClientPage from './ClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | Beauty Looks Mumbai",
  description: "Learn about the story behind Beauty Looks Mumbai.",
};

export default function Page() {
  return <ClientPage />;
}
