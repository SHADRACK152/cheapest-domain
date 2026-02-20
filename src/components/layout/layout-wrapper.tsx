'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';

const pagesWithoutLayout = ['/login', '/signup', '/admin'];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const hideLayout = pagesWithoutLayout.some(path => pathname?.startsWith(path));

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
