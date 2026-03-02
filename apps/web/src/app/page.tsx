'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [captureCount, setCaptureCount] = useState(0);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, []);

  const modeColors: Record<string, string> = {
    'Deep Thinker': '#3b82f6',
    'Imaginative': '#8b5cf6',
    'Realistic': '#10b981',
    'Focused': '#f59e0b',
    'Free Thinker': '#06b6d4',
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          <span className={`pill-dot${apiStatus === 'connected' ? '' : apiStatus === 'disconnected' ? '-purple' : '-blue'}`}></span>
          {apiStatus === 'checking' ? 'Connecting...' : apiStatus === 'connected' ? 'System Online' : 'System Offline'}
        </div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          color: '#f8fafc',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          Your Context
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}> Engine</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
          Every AI conversation starts with the right context.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Knowledge Items', value: '—', icon: '◈', color: '#3b82f6' },
          { label: 'Active Presets', value: '—', icon: '⬡', color: '#8b5cf6' },
          { label: 'Context Copies', value: '—', icon: '⊕', color: '#10b981' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '80px', height: '80px',
              background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
              borderRadius: '50%',
            }} />
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.03em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '20px', position: 'absolute', bottom: '16px', right: '16px', opacity: 0.3 }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + Thinking modes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Quick Actions */}
        <div className="card">
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { href: '/capture', label: 'Capture Knowledge', desc: 'Save and classify new items', icon: '⊕', color: '#3b82f6' },
              { href: '/search', label: 'Search Context', desc: 'Find what you know', icon: '⊙', color: '#8b5cf6' },
              { href: '/presets', label: 'Manage Presets', desc: 'Configure AI contexts', icon: '◈', color: '#10b981' },
            ].map((action) => (
              <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: `${action.color}15`,
                    border: `1px solid ${action.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', color: action.color, flexShrink: 0,
                  }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>{action.label}</div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>{action.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Thinking Modes */}
        <div className="card">
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Thinking Modes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'Deep Thinker', icon: '🔭', color: '#3b82f6', desc: 'Step by step reasoning' },
              { name: 'Imaginative', icon: '🌈', color: '#8b5cf6', desc: 'Creative exploration' },
              { name: 'Realistic', icon: '⚖️', color: '#10b981', desc: 'Evidence-based thinking' },
              { name: 'Focused', icon: '🎯', color: '#f59e0b', desc: 'Maximum signal, no noise' },
              { name: 'Free Thinker', icon: '🌊', color: '#06b6d4', desc: 'Unconstrained ideation' },
            ].map((mode) => (
              <div key={mode.name} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '7px 10px', borderRadius: '8px',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: mode.color,
                  boxShadow: `0 0 8px ${mode.color}`,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', flex: 1 }}>{mode.name}</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>{mode.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Context Pulse */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pill" style={{ marginBottom: '10px', display: 'inline-flex' }}>
              <span className="pill-dot-blue"></span>
              Context Pulse
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Ready to inject
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              Open the extension on any AI tool to copy your active context
            </div>
          </div>
          <div style={{ fontSize: '48px', opacity: 0.4 }}>⬡</div>
        </div>
      </div>
    </div>
  );
}
