'use client';
import { useState } from 'react';

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    goals: '',
    projects: '',
    interests: '',
    working_style: '',
    ai_persona: '',
  });

  async function handleSave() {
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, user_id: 'test-user' }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  }

  const fields = [
    { key: 'name', label: 'Your Name', placeholder: 'e.g. Mavqrick', icon: '◎', type: 'input' },
    { key: 'goals', label: 'Current Goals', placeholder: 'e.g. Launch ContextOS, grow to 100 users...', icon: '🎯', type: 'textarea' },
    { key: 'projects', label: 'Active Projects', placeholder: 'e.g. ContextOS MVP, Excel MCP Server...', icon: '🚀', type: 'textarea' },
    { key: 'interests', label: 'Focus Areas', placeholder: 'e.g. AI, SaaS, developer tools, productivity...', icon: '🌊', type: 'input' },
    { key: 'working_style', label: 'Working Style', placeholder: 'e.g. Direct, bullet points, no preamble, show code first...', icon: '⚡', type: 'input' },
    { key: 'ai_persona', label: 'AI Persona', placeholder: 'e.g. You are a brutal startup advisor. Challenge assumptions...', icon: '🧠', type: 'textarea' },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          <span className="pill-dot"></span>
          Context Profile
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Your
          <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Profile</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
          This context is injected into every AI conversation to personalize responses to your situation.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {fields.map(field => (
          <div key={field.key} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>{field.icon}</span>
              <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {field.label}
              </span>
            </div>
            {field.type === 'textarea' ? (
              <textarea
                className="input"
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                rows={3}
                style={{ fontSize: '14px', lineHeight: '1.6' }}
              />
            ) : (
              <input
                className="input"
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{ fontSize: '14px' }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>
          {saved ? '✓ Profile Saved!' : 'Save Profile'}
        </button>
        {saved && (
          <div className="pill animate-fade-in">
            <span className="pill-dot"></span>
            Synced to knowledge base
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '24px' }}>💡</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
                Pro tip: Use Presets for different contexts
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Your profile is a baseline. Create presets in the extension for situation-specific contexts — coding sessions, founder mode, research mode — each with AI-optimized prompts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
