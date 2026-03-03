import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContextOS — AI Context Engine',
  description: 'Inject the right context into every AI conversation. Free Chrome extension for Claude, ChatGPT, Gemini and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#080b12', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
