import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to manage your domains with CheapestDomains',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
