'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { href: '/dashboard/presets', label: 'Presets', icon: '◈' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '220px', minHeight: '100vh',
      background: '#0d1526',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0', position: 'fixed',
      top: 0, left: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Logo size={32} />
          <div>
            <div style={{
              fontSize: '15px', fontWeight: '700',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.02em',
            }}>ContextOS</div>
            <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px', letterSpacing: '0.05em' }}>
              CONTEXT ENGINE
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              fontSize: '13px', fontWeight: '500',
              color: isActive ? '#f8fafc' : '#64748b',
              textDecoration: 'none', transition: 'all 0.2s ease',
              background: isActive
                ? 'linear-gradient(90deg, rgba(59,130,246,0.15) 0%, transparent 100%)'
                : 'transparent',
              borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
            }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="pill">
          <span className="pill-dot"></span>
          System Active
        </div>
      </div>
    </aside>
  );
}