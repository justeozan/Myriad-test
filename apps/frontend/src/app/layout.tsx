import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Myriad Identity — Privacy-First Identity Layer',
  description:
    'A post-quantum ready, privacy-first decentralized identity layer using DIDs and Verifiable Credentials.',
  keywords: ['DID', 'identity', 'privacy', 'verifiable credentials', 'post-quantum'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
