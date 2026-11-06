import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saffron & Table — Food made for gathering',
  description:
    'Seasonal sharing food in Accra. Build a drop-off order or plan a chef-reviewed full-service event. Interactive demo.',
};

export const viewport: Viewport = { themeColor: '#f8f5ee' };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
