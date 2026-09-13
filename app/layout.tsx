import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'FundProof',
  description: 'Private proof-of-funds for Stellar USDC',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}