import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Logo from '@/components/Logo';
// Note: I removed the <Sidebar /> import since your code builds the sidebar inline below.

export const metadata: Metadata = {
  title: 'ContextOS',
  description: 'Your personal context engine for AI tools',
};

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⬡' },
  { href: '/capture', label: 'Capture', icon: '⊕' },
  { href: '/search', label: 'Search', icon: '⊙' },
  { href: '/presets', label: 'Presets', icon: '◈' },
  { href: '/profile', label: 'Profile', icon: '◎' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#080b12' }}>
        <div className="flex min-h-screen">
          
          {/* Sidebar */}
          <aside style={{ 
            width: '220px', 
            position: 'fixed', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRight: '1px solid rgba(255,255,255,0.07)' 
          }}>
            {/* Logo + Wordmark */}
            <div style={{ padding: '28px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Logo size={32} />
                <div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                  }}>
                    ContextOS
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px', letterSpacing: '0.05em' }}>
                    CONTEXT ENGINE
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  // I swapped the inline mouse events for standard Tailwind hover classes 
                  // to keep this compatible as a Server Component.
                  className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] text-[13px] font-medium text-[#64748b] no-underline transition-all duration-200 border border-transparent hover:text-[#f8fafc] hover:bg-white/5"
                >
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Bottom status */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="pill text-slate-400 text-xs flex items-center gap-2">
                <span className="pill-dot w-2 h-2 rounded-full bg-green-500"></span>
                System Active
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main style={{
            marginLeft: '220px',
            flex: 1,
            padding: '32px',
            minHeight: '100vh',
            background: '#080b12',
          }}>
            {children}
          </main>
          
        </div>
      </body>
    </html>
  );
}