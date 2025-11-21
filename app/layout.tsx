import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'libertyy.io',
  description: 'CRM, sito web e CMS in un unico pannello',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.variable} ${sora.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
