import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ContextOS',
  description: 'The memory layer for your mind',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-950 text-white">
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-6">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white">⚙️ ContextOS</h1>
              <p className="text-xs text-gray-500 mt-1">The memory layer for your mind</p>
            </div>
            <nav className="space-y-2">
              <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <span>🏠</span> Dashboard
              </a>
              <a href="/capture" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <span>✏️</span> Capture
              </a>
              <a href="/search" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <span>🔍</span> Search
              </a>
            </nav>
          </div>
          {/* Main content */}
          <div className="ml-64 p-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
