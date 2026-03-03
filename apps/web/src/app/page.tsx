import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{
      background: '#080b12', minHeight: '100vh',
      color: '#f8fafc', fontFamily: '-apple-system, Inter, sans-serif',
      overflowX: 'hidden',
    }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, background: 'rgba(8,11,18,0.9)',
        backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="navG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#navG)" strokeWidth="1.5" fill="rgba(59,130,246,0.08)"/>
            <rect x="9" y="11" width="9" height="2.5" rx="1.25" fill="url(#navG)"/>
            <rect x="9" y="15" width="12" height="2.5" rx="1.25" fill="url(#navG)" opacity="0.8"/>
            <rect x="9" y="19" width="7" height="2.5" rx="1.25" fill="url(#navG)" opacity="0.6"/>
            <circle cx="22" cy="12.25" r="1.5" fill="#3b82f6"/>
          </svg>
          <div>
            <div style={{
              fontSize: '15px', fontWeight: '700',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.02em',
            }}>ContextOS</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="#features" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>Features</Link>
          <Link href="#how-it-works" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>How it works</Link>
          <Link href="#install" style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
            color: 'white', fontSize: '13px', fontWeight: '600',
            padding: '8px 18px', borderRadius: '10px', textDecoration: 'none',
            boxShadow: '0 0 20px rgba(59,130,246,0.25)',
          }}>
            Get Extension
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '900px', margin: '0 auto',
        padding: '96px 48px 80px', textAlign: 'center', position: 'relative',
      }}>
        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '100px', padding: '5px 14px', marginBottom: '28px',
          fontSize: '12px', color: '#94a3b8',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }}></span>
          Free Chrome Extension — No account required
        </div>

        <h1 style={{
          fontSize: '64px', fontWeight: '900', lineHeight: 1.05,
          letterSpacing: '-0.04em', marginBottom: '24px',
          color: '#f8fafc',
        }}>
          Every AI conversation<br/>
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            starts with context.
          </span>
        </h1>

        <p style={{
          fontSize: '18px', color: '#64748b', maxWidth: '560px',
          margin: '0 auto 40px', lineHeight: '1.7',
        }}>
          ContextOS injects your goals, projects, and working style into every AI chat —
          so Claude, ChatGPT, and Gemini actually know who you are.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#install" style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
            color: 'white', fontSize: '15px', fontWeight: '700',
            padding: '14px 32px', borderRadius: '12px', textDecoration: 'none',
            boxShadow: '0 0 30px rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            🚀 Get Extension Free
          </a>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '48px', justifyContent: 'center',
          marginTop: '64px', paddingTop: '48px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { value: '100%', label: 'Local & Private' },
            { value: '< 60s', label: 'Setup Time' },
            { value: '5+', label: 'AI Tools Supported' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px', fontWeight: '900', letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        maxWidth: '900px', margin: '0 auto', padding: '80px 48px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '100px', padding: '4px 14px', marginBottom: '16px',
            fontSize: '11px', color: '#93c5fd', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            How It Works
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-0.03em', color: '#f8fafc' }}>
            Context in three steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            {
              step: '01',
              icon: '◈',
              title: 'Create a Preset',
              desc: 'Fill in your goals, projects, and working style. Pick from 8 templates or start blank.',
              color: '#3b82f6',
            },
            {
              step: '02',
              icon: '✨',
              title: 'AI Optimizes It',
              desc: 'Groq rewrites your simple inputs into a professional system prompt in under 2 seconds.',
              color: '#8b5cf6',
            },
            {
              step: '03',
              icon: '⬡',
              title: 'Inject Anywhere',
              desc: 'A badge appears on every AI tool. One click copies your full context block, ready to paste.',
              color: '#10b981',
            },
          ].map((step, i) => (
            <div key={step.step} style={{
              background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '28px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, ${step.color}, transparent)`,
              }} />
              <div style={{
                fontSize: '11px', fontWeight: '700', color: step.color,
                letterSpacing: '0.1em', marginBottom: '16px',
                opacity: 0.7,
              }}>STEP {step.step}</div>
              <div style={{ fontSize: '28px', marginBottom: '12px', color: step.color }}>{step.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>{step.title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        maxWidth: '900px', margin: '0 auto', padding: '80px 48px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '100px', padding: '4px 14px', marginBottom: '16px',
            fontSize: '11px', color: '#a78bfa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Features
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-0.03em', color: '#f8fafc' }}>
            Built for AI power users
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            {
              icon: '🔒',
              title: 'Local-First & Private',
              desc: 'All presets stored in your browser. Nothing sent to any server except Groq (when you choose to optimize). Your context, your device.',
              color: '#10b981',
              gradient: 'linear-gradient(135deg, #064e3b 0%, #0d1526 100%)',
              border: 'rgba(16,185,129,0.2)',
            },
            {
              icon: '✨',
              title: 'AI Prompt Architect',
              desc: 'Type simple context — Groq rewrites it into a professional system prompt with thinking blocks, clarifying questions, and behavioral rules.',
              color: '#8b5cf6',
              gradient: 'linear-gradient(135deg, #2e1065 0%, #0d1526 100%)',
              border: 'rgba(139,92,246,0.2)',
            },
            {
              icon: '⚡',
              title: '3-Layer Coding Agent',
              desc: 'For developers — generates a customized Directive/Orchestration/Execution architecture adapted to your exact stack and project.',
              color: '#3b82f6',
              gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0d1526 100%)',
              border: 'rgba(59,130,246,0.2)',
            },
            {
              icon: '🎯',
              title: 'Smart Preset Suggestions',
              desc: 'Extension detects the site you\'re on and suggests the best matching preset. On GitHub? Switch to Coding Agent. On LinkedIn? Switch to Founder mode.',
              color: '#f59e0b',
              gradient: 'linear-gradient(135deg, #451a03 0%, #0d1526 100%)',
              border: 'rgba(245,158,11,0.2)',
            },
            {
              icon: '🧠',
              title: '5 Thinking Modes',
              desc: 'Deep Thinker, Imaginative, Realistic, Focused, Free Thinker — each mode injects behavioral instructions that change how the AI reasons.',
              color: '#06b6d4',
              gradient: 'linear-gradient(135deg, #0c2a33 0%, #0d1526 100%)',
              border: 'rgba(6,182,212,0.2)',
            },
            {
              icon: '📚',
              title: '8 Ready-Made Templates',
              desc: 'Solo Founder, Full Stack Dev, Content Creator, Researcher, UX Designer, Student, Product Manager, Data Analyst — get set up in 60 seconds.',
              color: '#f8fafc',
              gradient: 'linear-gradient(135deg, #1e293b 0%, #0d1526 100%)',
              border: 'rgba(255,255,255,0.1)',
            },
          ].map(feature => (
            <div key={feature.title} style={{
              background: feature.gradient,
              border: `1px solid ${feature.border}`,
              borderRadius: '16px', padding: '24px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{feature.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>{feature.title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Works with */}
      <section style={{
        maxWidth: '900px', margin: '0 auto', padding: '80px 48px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
          Works with every AI tool
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { name: 'Claude', icon: '🤖', color: '#f59e0b' },
            { name: 'ChatGPT', icon: '💬', color: '#10b981' },
            { name: 'Gemini', icon: '✦', color: '#3b82f6' },
            { name: 'Perplexity', icon: '⊙', color: '#8b5cf6' },
            { name: 'Poe', icon: '◈', color: '#06b6d4' },
          ].map(tool => (
            <div key={tool.name} style={{
              background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '16px 24px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '20px', color: tool.color }}>{tool.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>{tool.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="install" style={{
        maxWidth: '900px', margin: '0 auto 80px', padding: '0 48px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '24px', padding: '64px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '400px', height: '300px',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '100px', padding: '5px 14px', marginBottom: '24px',
            fontSize: '11px', color: '#93c5fd',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }}></span>
            Free Forever · No Account · No Tracking
          </div>

          <h2 style={{
            fontSize: '48px', fontWeight: '900', letterSpacing: '-0.03em',
            color: '#f8fafc', marginBottom: '16px', lineHeight: 1.1,
          }}>
            Start with the right context.<br/>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Every single time.</span>
          </h2>

          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
            Install the Chrome extension and create your first preset in under 60 seconds.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://chrome.google.com/webstore" target="_blank" style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
              color: 'white', fontSize: '15px', fontWeight: '700',
              padding: '14px 32px', borderRadius: '12px', textDecoration: 'none',
              boxShadow: '0 0 30px rgba(59,130,246,0.35)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              🚀 Install Chrome Extension
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '900px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="footG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#footG)" strokeWidth="1.5" fill="rgba(59,130,246,0.08)"/>
            <rect x="9" y="11" width="9" height="2.5" rx="1.25" fill="url(#footG)"/>
            <rect x="9" y="15" width="12" height="2.5" rx="1.25" fill="url(#footG)" opacity="0.8"/>
            <rect x="9" y="19" width="7" height="2.5" rx="1.25" fill="url(#footG)" opacity="0.6"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>ContextOS</span>
        </div>
        <div style={{ fontSize: '12px', color: '#334155' }}>
          Built for AI power users. Local and Private.
        </div>
      </footer>
    </main>
  );
}
