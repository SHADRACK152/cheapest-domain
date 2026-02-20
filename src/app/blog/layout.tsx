import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Domain Tips & News',
  description: 'Stay updated with the latest domain registration tips, industry news, and guides for choosing the perfect domain name for your business.',
  openGraph: {
    title: 'Blog - Domain Tips & News',
    description: 'Stay updated with the latest domain registration tips, industry news, and guides.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
