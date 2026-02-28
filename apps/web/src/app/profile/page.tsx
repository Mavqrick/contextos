'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Goal {
  title: string;
  deadline: string;
  description: string;
}

interface Project {
  name: string;
  status: string;
  tags: string[];
}

interface Profile {
  goals: Goal[];
  projects: Project[];
  interests: string[];
  working_style: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    goals: [],
    projects: [],
    interests: [],
    working_style: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // New item inputs
  const [newGoal, setNewGoal] = useState({ title: '', deadline: '', description: '' });
  const [newProject, setNewProject] = useState({ name: '', status: 'active', tags: [] as string[] });
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get('/profile/');
      setProfile(res.data);
    } catch {
      // Profile doesn't exist yet, use empty defaults
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await api.post('/profile/', profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  }

  function addGoal() {
    if (!newGoal.title.trim()) return;
    setProfile(p => ({ ...p, goals: [...p.goals, newGoal] }));
    setNewGoal({ title: '', deadline: '', description: '' });
  }

  function removeGoal(i: number) {
    setProfile(p => ({ ...p, goals: p.goals.filter((_, idx) => idx !== i) }));
  }

  function addProject() {
    if (!newProject.name.trim()) return;
    setProfile(p => ({ ...p, projects: [...p.projects, newProject] }));
    setNewProject({ name: '', status: 'active', tags: [] });
  }

  function removeProject(i: number) {
    setProfile(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));
  }

  function addInterest() {
    if (!newInterest.trim()) return;
    setProfile(p => ({ ...p, interests: [...p.interests, newInterest.trim()] }));
    setNewInterest('');
  }

  function removeInterest(i: number) {
    setProfile(p => ({ ...p, interests: p.interests.filter((_, idx) => idx !== i) }));
  }

  function generateContextBlock() {
    return `## My Context (via ContextOS)

**Active Goals:**
${profile.goals.map(g => `- ${g.title}${g.deadline ? ` (by ${g.deadline})` : ''}`).join('\n') || '- None set'}

**Current Projects:**
${profile.projects.map(p => `- ${p.name} [${p.status}]`).join('\n') || '- None set'}

**Focus Areas:** ${profile.interests.join(', ') || 'Not set'}

**Working Style:** ${profile.working_style || 'Not set'}

Please use this context to personalize your responses.`;
  }

  async function copyContextBlock() {
    await navigator.clipboard.writeText(generateContextBlock());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <p className="text-gray-400 mt-1">Define who you are. Every AI tool you use will know this.</p>
      </div>

      {/* Context Block Export */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold">📋 Your Context Block</h3>
            <p className="text-gray-400 text-xs mt-0.5">Copy and paste into any AI chat to give it full context about you</p>
          </div>
          <button
            onClick={copyContextBlock}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <pre className="text-xs text-gray-400 bg-gray-950/50 rounded-lg p-3 whitespace-pre-wrap font-mono">
          {generateContextBlock()}
        </pre>
      </div>

      {/* Goals */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-4">🎯 Active Goals</h3>
        
        {profile.goals.length === 0 && (
          <p className="text-gray-600 text-sm mb-4">No goals yet. Add what you're working towards.</p>
        )}

        <div className="space-y-2 mb-4">
          {profile.goals.map((goal, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <div>
                <span className="text-white text-sm font-medium">{goal.title}</span>
                {goal.deadline && <span className="text-gray-500 text-xs ml-2">by {goal.deadline}</span>}
                {goal.description && <p className="text-gray-400 text-xs mt-0.5">{goal.description}</p>}
              </div>
              <button onClick={() => removeGoal(i)} className="text-gray-600 hover:text-red-400 ml-3 text-lg">×</button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <input
            value={newGoal.title}
            onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))}
            placeholder="Goal title e.g. Launch on ProductHunt"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
          />
          <div className="flex gap-2">
            <input
              value={newGoal.deadline}
              onChange={e => setNewGoal(g => ({ ...g, deadline: e.target.value }))}
              placeholder="Deadline e.g. March 2026"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
            <input
              value={newGoal.description}
              onChange={e => setNewGoal(g => ({ ...g, description: e.target.value }))}
              placeholder="Short description (optional)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
          </div>
          <button
            onClick={addGoal}
            disabled={!newGoal.title.trim()}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg border border-gray-700 border-dashed transition-colors"
          >
            + Add Goal
          </button>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-4">📁 Current Projects</h3>

        {profile.projects.length === 0 && (
          <p className="text-gray-600 text-sm mb-4">No projects yet.</p>
        )}

        <div className="space-y-2 mb-4">
          {profile.projects.map((project, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">{project.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  project.status === 'active' ? 'bg-green-900/50 text-green-400' :
                  project.status === 'paused' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {project.status}
                </span>
              </div>
              <button onClick={() => removeProject(i)} className="text-gray-600 hover:text-red-400 ml-3 text-lg">×</button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newProject.name}
            onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
            placeholder="Project name"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            onKeyDown={e => e.key === 'Enter' && addProject()}
          />
          <select
            value={newProject.status}
            onChange={e => setNewProject(p => ({ ...p, status: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={addProject}
            disabled={!newProject.name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-4">💡 Focus Areas & Interests</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {profile.interests.map((interest, i) => (
            <span key={i} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-sm text-gray-300">
              {interest}
              <button onClick={() => removeInterest(i)} className="text-gray-600 hover:text-red-400 text-base leading-none">×</button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newInterest}
            onChange={e => setNewInterest(e.target.value)}
            placeholder="e.g. SaaS, productivity, AI, writing..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            onKeyDown={e => e.key === 'Enter' && addInterest()}
          />
          <button
            onClick={addInterest}
            disabled={!newInterest.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Working Style */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-white font-semibold mb-3">⚡ Working Style</h3>
        <textarea
          value={profile.working_style}
          onChange={e => setProfile(p => ({ ...p, working_style: e.target.value }))}
          placeholder="Describe how you work best e.g. I prefer concise bullet points, I work in focused 2-hour sprints, I'm building a bootstrapped SaaS..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600 resize-none"
          rows={3}
        />
      </div>

      {/* Save button */}
      <button
        onClick={saveProfile}
        disabled={saving}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
      >
        {saving ? 'Saving...' : saved ? '✓ Profile Saved!' : 'Save Profile'}
      </button>
    </div>
  );
}