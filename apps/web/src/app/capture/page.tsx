'use client';
import { useState } from 'react';

export default function CapturePage() {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const CATEGORY_COLORS: Record<string, string> = {
    goal: '#3b82f6',
    project: '#8b5cf6',
    interest: '#10b981',
    skill: '#f59e0b',
    note: '#64748b',
    insight: '#06b6d4',
  };

  async function handleCapture() {
    if (!content.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, source, user_id: 'test-user' }),
      });
      const data = await res.json();
      setResult(data);
      setStatus('success');
      setContent('');
      setSource('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          <span className="pill-dot-blue"></span>
          Knowledge Capture
        </div>
        <h1 style={{
          fontSize: '32px', fontWeight: '800',
          color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          Capture
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}> Knowledge</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
          Save ideas, goals, insights — AI classifies and stores them for instant context retrieval.
        </p>
      </div>

      {/* Main capture card */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          What's on your mind?
        </div>
        <textarea
          className="input"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="e.g. I want to launch ContextOS to 100 users by end of March..."
          rows={5}
          style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.6' }}
        />
        <input
          className="input"
          value={source}
          onChange={e => setSource(e.target.value)}
          placeholder="Source (optional) — e.g. book, conversation, idea..."
          style={{ marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            AI will auto-classify into: goal, project, interest, skill, insight
          </div>
          <button
            className="btn-primary"
            onClick={handleCapture}
            disabled={status === 'loading' || !content.trim()}
            style={{ opacity: status === 'loading' || !content.trim() ? 0.5 : 1 }}
          >
            {status === 'loading' ? '⏳ Capturing...' : '⊕ Capture'}
          </button>
        </div>
      </div>

      {/* Result */}
      {status === 'success' && result && (
        <div className="card animate-fade-in" style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #0d1526 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="pill">
              <span className="pill-dot"></span>
              Captured Successfully
            </div>
            {result.category && (
              <div className="pill" style={{
                background: `${CATEGORY_COLORS[result.category] || '#3b82f6'}20`,
                border: `1px solid ${CATEGORY_COLORS[result.category] || '#3b82f6'}40`,
                color: CATEGORY_COLORS[result.category] || '#3b82f6',
              }}>
                {result.category}
              </div>
            )}
          </div>

          {result.summary && (
            <div>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                AI Summary
              </div>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>{result.summary}</p>
            </div>
          )}

          {result.tags && result.tags.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {result.tags.map((tag: string) => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px', padding: '3px 8px',
                  fontSize: '11px', color: '#94a3b8',
                }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="card animate-fade-in" style={{
          background: 'linear-gradient(135deg, #450a0a 0%, #0d1526 100%)',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <div style={{ color: '#fca5a5', fontSize: '14px' }}>
            ❌ Capture failed. Make sure the API is running on port 8000.
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          What to capture
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { label: 'Goals', desc: 'What you want to achieve', icon: '🎯', color: '#3b82f6' },
            { label: 'Projects', desc: 'What you\'re working on', icon: '🚀', color: '#8b5cf6' },
            { label: 'Insights', desc: 'Things you\'ve learned', icon: '💡', color: '#f59e0b' },
            { label: 'Skills', desc: 'What you\'re learning', icon: '⚡', color: '#10b981' },
            { label: 'Interests', desc: 'What excites you', icon: '🌊', color: '#06b6d4' },
            { label: 'Notes', desc: 'Anything worth saving', icon: '📝', color: '#64748b' },
          ].map(tip => (
            <div key={tip.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px', padding: '12px',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>{tip.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: tip.color, marginBottom: '3px' }}>{tip.label}</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
