'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Goal { title: string; deadline: string; description: string; }
interface Project { name: string; status: string; tags: string[]; }

interface Profile {
  goals: Goal[];
  projects: Project[];
  interests: string[];
  working_style: string;
  ai_persona: string;
  thinking_mode: string;
  custom_context_blocks: string[];
}

const THINKING_MODES = [
  {
    id: 'deep_thinker',
    icon: '🔭',
    name: 'Deep Thinker',
    description: 'Reason step by step, show your work, challenge assumptions before concluding',
    prompt: 'Before answering, reason through the problem step by step. Show your thinking process. Challenge assumptions. Only conclude after examining multiple angles. Use "First...", "However...", "Therefore..." structure.'
  },
  {
    id: 'imaginative',
    icon: '🌈',
    name: 'Imaginative',
    description: 'Explore wild possibilities, think laterally, no constraints',
    prompt: 'Think expansively and creatively. Explore wild possibilities. Use "yes, and..." thinking. Make unexpected connections. Fiction, metaphor, and lateral thinking are encouraged. There are no wrong ideas.'
  },
  {
    id: 'realistic',
    icon: '⚖️',
    name: 'Realistic',
    description: 'Ground everything in evidence, call out wishful thinking, be brutally honest',
    prompt: 'Be grounded and evidence-based. Call out wishful thinking directly. Prioritize what is proven over what sounds good. Be brutally honest even if uncomfortable. Ask "what is the evidence for this?"'
  },
  {
    id: 'focused',
    icon: '🎯',
    name: 'Focused',
    description: 'One thing at a time, concise, maximum signal-to-noise',
    prompt: 'Be extremely concise. One idea per response. No tangents. No preamble. Lead with the answer, follow with reasoning only if essential. Bullet points over paragraphs. Maximum signal, minimum noise.'
  },
  {
    id: 'free_thinker',
    icon: '🌊',
    name: 'Free Thinker',
    description: 'No rules, stream of consciousness, connect unrelated ideas',
    prompt: 'Think freely without constraints. Stream of consciousness is welcome. Connect seemingly unrelated ideas. Break conventional patterns. Surprise me with unexpected angles. Rules are suggestions.'
  },
  {
    id: 'balanced',
    icon: '🧭',
    name: 'Balanced',
    description: 'Default mode — thoughtful, helpful, well-rounded responses',
    prompt: ''
  },
  {
    id: 'custom',
    icon: '✏️',
    name: 'Custom',
    description: 'Write your own thinking style from scratch',
    prompt: ''
  }
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    goals: [], projects: [], interests: [],
    working_style: '', ai_persona: '',
    thinking_mode: 'balanced', custom_context_blocks: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customModePrompt, setCustomModePrompt] = useState('');

  const [newGoal, setNewGoal] = useState({ title: '', deadline: '', description: '' });
  const [newProject, setNewProject] = useState({ name: '', status: 'active', tags: [] as string[] });
  const [newInterest, setNewInterest] = useState('');
  const [newBlock, setNewBlock] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      const res = await api.get('/profile/');
      setProfile(res.data);
      if (res.data.thinking_mode === 'custom') {
        setCustomModePrompt(res.data.custom_mode_prompt || '');
      }
    } catch { } finally { setLoading(false); }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const payload = { ...profile };
      if (profile.thinking_mode === 'custom') {
        payload.custom_context_blocks = [
          ...profile.custom_context_blocks.filter(b => !b.startsWith('__mode__')),
          `__mode__${customModePrompt}`
        ];
      }
      await api.post('/profile/', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  }

  function getThinkingModePrompt() {
    if (profile.thinking_mode === 'custom') return customModePrompt;
    const mode = THINKING_MODES.find(m => m.id === profile.thinking_mode);
    return mode?.prompt || '';
  }

  function generateContextBlock() {
    const modePrompt = getThinkingModePrompt();
    const mode = THINKING_MODES.find(m => m.id === profile.thinking_mode);
    const blocks = profile.custom_context_blocks.filter(b => !b.startsWith('__mode__'));

    return `## My Context (via ContextOS)

**Active Goals:**
${profile.goals.map(g => `- ${g.title}${g.deadline ? ` (by ${g.deadline})` : ''}`).join('\n') || '- None set'}

**Current Projects:**
${profile.projects.map(p => `- ${p.name} [${p.status}]`).join('\n') || '- None set'}

**Focus Areas:** ${profile.interests.join(', ') || 'Not set'}

**Working Style:** ${profile.working_style || 'Not set'}
${profile.ai_persona ? `\n**Your Role:** ${profile.ai_persona}` : ''}
${modePrompt ? `\n**Thinking Mode — ${mode?.name || 'Custom'}:**\n${modePrompt}` : ''}
${blocks.length > 0 ? `\n**Additional Context:**\n${blocks.map(b => `- ${b}`).join('\n')}` : ''}

Please use all of the above to personalize every response.`;
  }

  async function copyContextBlock() {
    await navigator.clipboard.writeText(generateContextBlock());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function addGoal() {
    if (!newGoal.title.trim()) return;
    setProfile(p => ({ ...p, goals: [...p.goals, newGoal] }));
    setNewGoal({ title: '', deadline: '', description: '' });
  }

  function addProject() {
    if (!newProject.name.trim()) return;
    setProfile(p => ({ ...p, projects: [...p.projects, newProject] }));
    setNewProject({ name: '', status: 'active', tags: [] });
  }

  function addInterest() {
    if (!newInterest.trim()) return;
    setProfile(p => ({ ...p, interests: [...p.interests, newInterest.trim()] }));
    setNewInterest('');
  }

  function addBlock() {
    if (!newBlock.trim()) return;
    setProfile(p => ({ ...p, custom_context_blocks: [...p.custom_context_blocks, newBlock.trim()] }));
    setNewBlock('');
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Loading profile...</div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">👤 Context Profile</h2>
        <p className="text-gray-400 mt-1">Define who you are and how you think. Every AI tool will know this.</p>
      </div>

      {/* Context Block Preview */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold">📋 Your Context Block</h3>
            <p className="text-gray-400 text-xs mt-0.5">Paste into any AI chat for instant personalization</p>
          </div>
          <button onClick={copyContextBlock} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <pre className="text-xs text-gray-400 bg-gray-950/50 rounded-lg p-3 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
          {generateContextBlock()}
        </pre>
      </div>

      {/* Goals */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-4">🎯 Active Goals</h3>
        <div className="space-y-2 mb-4">
          {profile.goals.map((goal, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <div>
                <span className="text-white text-sm font-medium">{goal.title}</span>
                {goal.deadline && <span className="text-gray-500 text-xs ml-2">by {goal.deadline}</span>}
              </div>
              <button onClick={() => setProfile(p => ({ ...p, goals: p.goals.filter((_, idx) => idx !== i) }))} className="text-gray-600 hover:text-red-400 text-lg">×</button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <input value={newGoal.title} onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))}
            placeholder="Goal title" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600" />
          <div className="flex gap-2">
            <input value={newGoal.deadline} onChange={e => setNewGoal(g => ({ ...g, deadline: e.target.value }))}
              placeholder="Deadline e.g. March 2026" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600" />
            <button onClick={addGoal} disabled={!newGoal.title.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg">Add</button>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-4">📁 Current Projects</h3>
        <div className="space-y-2 mb-4">
          {profile.projects.map((project, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">{project.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                  {project.status}
                </span>
              </div>
              <button onClick={() => setProfile(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }))} className="text-gray-600 hover:text-red-400 text-lg">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
            placeholder="Project name" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            onKeyDown={e => e.key === 'Enter' && addProject()} />
          <select value={newProject.status} onChange={e => setNewProject(p => ({ ...p, status: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={addProject} disabled={!newProject.name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg">Add</button>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-4">💡 Focus Areas</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.interests.map((interest, i) => (
            <span key={i} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-sm text-gray-300">
              {interest}
              <button onClick={() => setProfile(p => ({ ...p, interests: p.interests.filter((_, idx) => idx !== i) }))} className="text-gray-600 hover:text-red-400">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newInterest} onChange={e => setNewInterest(e.target.value)}
            placeholder="e.g. SaaS, AI, writing..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            onKeyDown={e => e.key === 'Enter' && addInterest()} />
          <button onClick={addInterest} disabled={!newInterest.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg">Add</button>
        </div>
      </div>

      {/* Working Style */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-3">⚡ Working Style</h3>
        <textarea value={profile.working_style} onChange={e => setProfile(p => ({ ...p, working_style: e.target.value }))}
          placeholder="e.g. I prefer concise bullet points, I work in 2-hour sprints, I'm bootstrapped..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600 resize-none" rows={2} />
      </div>

      {/* AI Persona */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-1">🤖 AI Persona</h3>
        <p className="text-gray-500 text-xs mb-3">Define the role you want the AI to play</p>
        <textarea value={profile.ai_persona} onChange={e => setProfile(p => ({ ...p, ai_persona: e.target.value }))}
          placeholder="e.g. You are a brutal but honest startup advisor. You challenge every assumption and prioritize execution over planning..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600 resize-none" rows={3} />
      </div>

      {/* Thinking Modes */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-1">🧠 Thinking Mode</h3>
        <p className="text-gray-500 text-xs mb-4">How should the AI reason and approach problems?</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {THINKING_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setProfile(p => ({ ...p, thinking_mode: mode.id }))}
              className={`text-left p-3 rounded-xl border transition-all ${
                profile.thinking_mode === mode.id
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{mode.icon}</span>
                <span className={`text-sm font-medium ${profile.thinking_mode === mode.id ? 'text-blue-300' : 'text-white'}`}>
                  {mode.name}
                </span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{mode.description}</p>
            </button>
          ))}
        </div>

        {/* Custom mode text input */}
        {profile.thinking_mode === 'custom' && (
          <div className="mt-3">
            <p className="text-gray-400 text-xs mb-2">Write your custom thinking instructions:</p>
            <textarea
              value={customModePrompt}
              onChange={e => setCustomModePrompt(e.target.value)}
              placeholder="e.g. Always think like a contrarian. Question the premise of every question. Find the hidden assumption in every request and challenge it first..."
              className="w-full bg-gray-800 border border-blue-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>
        )}

        {/* Preview selected mode prompt */}
        {profile.thinking_mode !== 'balanced' && profile.thinking_mode !== 'custom' && (
          <div className="mt-3 bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">What gets injected:</p>
            <p className="text-gray-300 text-xs leading-relaxed italic">
              {THINKING_MODES.find(m => m.id === profile.thinking_mode)?.prompt}
            </p>
          </div>
        )}
      </div>

      {/* Custom Context Blocks */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-white font-semibold mb-1">📝 Custom Context Blocks</h3>
        <p className="text-gray-500 text-xs mb-3">Add any extra context the AI should always know</p>
        <div className="space-y-2 mb-3">
          {profile.custom_context_blocks.filter(b => !b.startsWith('__mode__')).map((block, i) => (
            <div key={i} className="flex items-start justify-between bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-gray-300 text-sm">{block}</span>
              <button onClick={() => setProfile(p => ({
                ...p,
                custom_context_blocks: p.custom_context_blocks.filter((_, idx) => idx !== i)
              }))} className="text-gray-600 hover:text-red-400 text-lg ml-2 shrink-0">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newBlock} onChange={e => setNewBlock(e.target.value)}
            placeholder="e.g. My tech stack: Next.js, FastAPI, PostgreSQL"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            onKeyDown={e => e.key === 'Enter' && addBlock()} />
          <button onClick={addBlock} disabled={!newBlock.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg">Add</button>
        </div>
      </div>

      {/* Save */}
      <button onClick={saveProfile} disabled={saving}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
        {saving ? 'Saving...' : saved ? '✓ Profile Saved!' : 'Save Profile'}
      </button>
    </div>
  );
}