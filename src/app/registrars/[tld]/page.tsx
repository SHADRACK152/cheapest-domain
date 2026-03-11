import { notFound } from 'next/navigation';
import { TLD_CATALOG } from '@/lib/tld-catalog';
import TldDetailContent from './TldDetailContent';

export async function generateStaticParams() {
  return TLD_CATALOG.map((entry) => ({ tld: entry.tld.replace(/^\./, '') }));
}

export async function generateMetadata({ params }: { params: Promise<{ tld: string }> }) {
  const { tld } = await params;
  return {
    title: `Cheapest .\ Domain - Registrar Price Comparison`,
    description: `Compare registration and renewal prices for .\ domains across all major registrars.`,
  };
}

export default async function TldDetailPage({ params }: { params: Promise<{ tld: string }> }) {
  const { tld: slug } = await params;
  const tldKey = '.' + slug;

  const entry = TLD_CATALOG.find((e) => e.tld === tldKey);
  if (!entry) notFound();

  return <TldDetailContent entry={entry} />;
}
