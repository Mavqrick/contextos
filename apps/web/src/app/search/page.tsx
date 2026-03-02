'use client';
import { useState } from 'react';

interface SearchResult {
  id: string;
  content: string;
  category: string;
  summary: string;
  tags: string[];
  source: string;
  similarity: number;
  created_at: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const CATEGORY_COLORS: Record<string, string> = {
    goal: '#3b82f6',
    project: '#8b5cf6',
    interest: '#10b981',
    skill: '#f59e0b',
    note: '#64748b',
    insight: '#06b6d4',
  };

  async function handleSearch() {
    if (!query.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query) + '&user_id=test-user');
      const data = await res.json();
      setResults(data.results || []);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          <span className="pill-dot-purple"></span>
          Semantic Search
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Search Your
          <span style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Context</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
          Ask anything — AI finds relevant knowledge using semantic similarity, not just keywords.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. What are my current goals? What projects am I working on?"
            style={{ flex: 1, fontSize: '14px' }}
          />
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={status === 'loading' || !query.trim()}
            style={{ opacity: status === 'loading' || !query.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
          >
            {status === 'loading' ? 'Searching...' : 'Search'}
          </button>
        </div>
        {status === 'idle' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['My current goals', 'Active projects', 'What I am learning', 'Recent insights'].map(q => (
              <button key={q} onClick={() => setQuery(q)} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: '#64748b', cursor: 'pointer',
              }}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>⊙</div>
          <div>Searching your context...</div>
        </div>
      )}

      {status === 'done' && results.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>◎</div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>No results found. Try capturing some knowledge first.</div>
        </div>
      )}

      {status === 'done' && results.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((result) => (
              <div key={result.id} className="card animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: Math.round(result.similarity * 100) + '%', height: '2px',
                  background: 'linear-gradient(90deg, ' + (CATEGORY_COLORS[result.category] || '#3b82f6') + ', transparent)',
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {result.category && (
                      <span className="pill" style={{
                        background: (CATEGORY_COLORS[result.category] || '#3b82f6') + '20',
                        border: '1px solid ' + (CATEGORY_COLORS[result.category] || '#3b82f6') + '40',
                        color: CATEGORY_COLORS[result.category] || '#3b82f6',
                      }}>{result.category}</span>
                    )}
                    {result.source && <span className="pill">{result.source}</span>}
                  </div>
                  <span style={{ fontSize: '11px', color: '#475569', flexShrink: 0 }}>
                    {Math.round(result.similarity * 100)}% match
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '8px' }}>
                  {result.content}
                </p>
                {result.tags && result.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {result.tags.map((tag: string) => (
                      <span key={tag} style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: '#64748b',
                      }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #450a0a 0%, #0d1526 100%)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ color: '#fca5a5', fontSize: '14px' }}>Search failed. Make sure the API is running on port 8000.</div>
        </div>
      )}
    </div>
  );
}
