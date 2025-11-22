import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'components/ui/sonner';
import { Sora } from 'next/font/google';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'libertyy.io',
  description: 'CRM, sito web e CMS in un unico pannello',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${sora.variable} antialiased bg-background text-foreground font-sans`}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
