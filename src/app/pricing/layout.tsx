import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domain Pricing',
  description: 'View transparent domain pricing for all extensions. No hidden fees — register .com, .net, .org, .co.ke, .ng, .io and more.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
