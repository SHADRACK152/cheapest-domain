import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Domains',
  description: 'Search for available domain names at the lowest prices. Check domain availability and register your perfect domain.',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
