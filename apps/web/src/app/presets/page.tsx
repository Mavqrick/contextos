'use client';
import { useState, useEffect } from 'react';

interface Preset {
  id: string;
  name: string;
  icon: string;
  preset_type: string;
  goals: string[];
  projects: string[];
  interests: string;
  working_style: string;
  ai_persona: string;
  thinking_mode: string;
  tech_stack: string;
  optimized_prompt: string;
  use_optimized: boolean;
  is_active: boolean;
  created_at: number;
}

const PRESET_TYPES = [
  { id: 'general', icon: '🚀', name: 'General', color: '#3b82f6' },
  { id: 'coding_agent', icon: '⚡', name: 'Coding Agent', color: '#8b5cf6' },
  { id: 'founder', icon: '💼', name: 'Founder', color: '#f59e0b' },
  { id: 'researcher', icon: '🔬', name: 'Researcher', color: '#10b981' },
];

const THINKING_MODES = [
  { id: 'balanced', name: 'Balanced', icon: '🧭' },
  { id: 'deep_thinker', name: 'Deep Thinker', icon: '🔭', color: '#3b82f6' },
  { id: 'imaginative', name: 'Imaginative', icon: '🌈', color: '#8b5cf6' },
  { id: 'realistic', name: 'Realistic', icon: '⚖️', color: '#10b981' },
  { id: 'focused', name: 'Focused', icon: '🎯', color: '#f59e0b' },
  { id: 'free_thinker', name: 'Free Thinker', icon: '🌊', color: '#06b6d4' },
];

const TEMPLATES = [
  { name: 'Solo Founder', icon: '🚀', type: 'founder', desc: 'Building & launching SaaS', color: '#f59e0b' },
  { name: 'Full Stack Dev', icon: '⚡', type: 'coding_agent', desc: 'Coding & architecture', color: '#8b5cf6' },
  { name: 'Content Creator', icon: '📝', type: 'general', desc: 'Writing & social media', color: '#3b82f6' },
  { name: 'Researcher', icon: '🔬', type: 'researcher', desc: 'Analysis & deep research', color: '#10b981' },
  { name: 'UX Designer', icon: '🎨', type: 'general', desc: 'Design & user experience', color: '#06b6d4' },
  { name: 'Student', icon: '🎓', type: 'general', desc: 'Learning & assignments', color: '#64748b' },
];

export default function PresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [view, setView] = useState<'list' | 'templates' | 'form'>('list');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const stored = localStorage.getItem('contextos_presets');
    if (stored) setPresets(JSON.parse(stored));
  }, []);

  function savePresets(updated: Preset[]) {
    setPresets(updated);
    localStorage.setItem('contextos_presets', JSON.stringify(updated));
  }

  function deletePreset(id: string) {
    savePresets(presets.filter(p => p.id !== id));
  }

  function activatePreset(id: string) {
    savePresets(presets.map(p => ({ ...p, is_active: p.id === id })));
  }

  function copyContext(preset: Preset) {
    const text = preset.optimized_prompt && preset.use_optimized
      ? `## My Context (via ContextOS) — ${preset.name}\n\n${preset.optimized_prompt}`
      : `## My Context (via ContextOS) — ${preset.name}\n\nGoals: ${preset.goals.join(', ')}\nWorking Style: ${preset.working_style}`;
    navigator.clipboard.writeText(text);
  }

  const typeColors: Record<string, string> = {
    general: '#3b82f6', coding_agent: '#8b5cf6', founder: '#f59e0b', researcher: '#10b981',
  };

  const filtered = filter === 'All' ? presets : presets.filter(p => p.preset_type === filter);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>
            <span className="pill-dot-purple"></span>
            Context Presets
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            My
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Presets</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
            Manage your context presets. Changes sync to the browser extension automatically.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setView('templates')}>
          + New Preset
        </button>
      </div>

      {view === 'templates' && (
        <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>Choose a Template</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Start with a pre-built preset or create from scratch</div>
              </div>
              <button className="btn-secondary" onClick={() => setView('list')} style={{ padding: '6px 12px', fontSize: '12px' }}>
                Cancel
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {TEMPLATES.map(t => (
                <div key={t.name} onClick={() => setView('list')} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.color + '50'; e.currentTarget.style.background = t.color + '10'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{t.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{t.desc}</div>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      fontSize: '10px', color: t.color, background: t.color + '15',
                      border: '1px solid ' + t.color + '30', borderRadius: '4px', padding: '2px 6px',
                    }}>{t.type.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
              <div onClick={() => setView('list')} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '110px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✏️</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Start Blank</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Build from scratch</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter pills */}
      {view === 'list' && presets.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['All', 'general', 'coding_agent', 'founder', 'researcher'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
              border: filter === f ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '5px 14px',
              fontSize: '12px', color: filter === f ? '#93c5fd' : '#64748b', cursor: 'pointer',
              fontWeight: filter === f ? '600' : '400',
            }}>
              {f === 'coding_agent' ? 'Coding Agent' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {view === 'list' && presets.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>◈</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>No presets yet</div>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Create your first preset to start injecting context into AI conversations
          </div>
          <button className="btn-primary" onClick={() => setView('templates')}>
            + Create First Preset
          </button>
        </div>
      )}

      {/* Presets grid */}
      {view === 'list' && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {filtered.map(preset => {
            const typeColor = typeColors[preset.preset_type] || '#3b82f6';
            return (
              <div key={preset.id} className="card animate-fade-in" style={{
                border: preset.is_active ? '1px solid rgba(59,130,246,0.3)' : undefined,
                background: preset.is_active ? 'linear-gradient(135deg, #0d1f3c 0%, #0d1526 100%)' : undefined,
                position: 'relative', overflow: 'hidden',
              }}>
                {preset.is_active && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{preset.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>{preset.name}</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '10px', color: typeColor,
                          background: typeColor + '15', border: '1px solid ' + typeColor + '30',
                          borderRadius: '4px', padding: '1px 6px',
                        }}>
                          {PRESET_TYPES.find(t => t.id === preset.preset_type)?.icon} {preset.preset_type.replace('_', ' ')}
                        </span>
                        {preset.use_optimized && preset.optimized_prompt && (
                          <span style={{
                            fontSize: '10px', color: '#a78bfa',
                            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '4px', padding: '1px 6px',
                          }}>✨ Optimized</span>
                        )}
                        {preset.is_active && (
                          <span style={{
                            fontSize: '10px', color: '#93c5fd',
                            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '4px', padding: '1px 6px', fontWeight: '700',
                          }}>ACTIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {preset.goals && preset.goals.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    🎯 {preset.goals.slice(0, 2).join(', ')}{preset.goals.length > 2 ? ` +${preset.goals.length - 2}` : ''}
                  </div>
                )}
                {preset.preset_type === 'coding_agent' && preset.tech_stack && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    💻 {preset.tech_stack}
                  </div>
                )}
                {preset.thinking_mode && preset.thinking_mode !== 'balanced' && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    {THINKING_MODES.find(m => m.id === preset.thinking_mode)?.icon} {THINKING_MODES.find(m => m.id === preset.thinking_mode)?.name}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <button onClick={() => copyContext(preset)} style={{
                    flex: 1, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '8px', padding: '7px', fontSize: '12px', color: '#93c5fd', cursor: 'pointer', fontWeight: '600',
                  }}>📋 Copy</button>
                  {!preset.is_active && (
                    <button onClick={() => activatePreset(preset.id)} style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px', padding: '7px', fontSize: '12px', color: '#64748b', cursor: 'pointer',
                    }}>Set Active</button>
                  )}
                  <button onClick={() => deletePreset(preset.id)} style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px', padding: '7px 10px', fontSize: '12px', color: '#475569', cursor: 'pointer',
                  }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sync notice */}
      <div style={{ marginTop: '24px' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '24px' }}>🔌</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
                Full preset management in the extension
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Create, edit, and AI-optimize presets in the ContextOS browser extension. They will appear here automatically.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
