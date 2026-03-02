<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getAllPresets, savePreset, deletePreset, setActivePreset,
    getSettings, saveSettings, generateOptimizedPrompt,
    generateContextBlock, type Preset, type Settings
  } from './db';
  import { TEMPLATES, CATEGORIES, type Template } from './templates';

  let presets: Preset[] = [];
  let settings: Settings = { groq_api_key: '' };
  let showForm = false;
  let showSettings = false;
  let showTemplates = false;
  let editingId: string | null = null;
  let generating = false;
  let generateError = '';
  let settingsSaved = false;
  let selectedCategory = 'All';
  let copied: string | null = null;

  const THINKING_MODES = [
    { id: 'balanced', icon: '🧭', name: 'Balanced' },
    { id: 'deep_thinker', icon: '🔭', name: 'Deep Thinker', color: '#3b82f6' },
    { id: 'imaginative', icon: '🌈', name: 'Imaginative', color: '#8b5cf6' },
    { id: 'realistic', icon: '⚖️', name: 'Realistic', color: '#10b981' },
    { id: 'focused', icon: '🎯', name: 'Focused', color: '#f59e0b' },
    { id: 'free_thinker', icon: '🌊', name: 'Free Thinker', color: '#06b6d4' },
    { id: 'custom', icon: '✏️', name: 'Custom' },
  ];

  const PRESET_TYPES = [
    { id: 'general', icon: '🚀', name: 'General', desc: 'Standard AI chat context', color: '#3b82f6' },
    { id: 'coding_agent', icon: '⚡', name: 'Coding Agent', desc: '3-layer architecture', color: '#8b5cf6' },
    { id: 'founder', icon: '💼', name: 'Founder', desc: 'Startup decisions', color: '#f59e0b' },
    { id: 'researcher', icon: '🔬', name: 'Researcher', desc: 'Deep research mode', color: '#10b981' },
  ];

  const PRESET_ICONS = ['🚀', '💡', '🎯', '📝', '🔭', '🌈', '⚡', '🧠', '💼', '🎨', '🔬', '⚙️', '📊', '🎓'];

  let form = emptyForm();
  let newGoal = '';
  let newProject = '';
  let newBlock = '';

  function emptyForm(): Omit<Preset, 'id' | 'created_at' | 'is_active'> {
    return {
      name: '', icon: '🚀', preset_type: 'general',
      goals: [], projects: [], interests: '',
      working_style: '', ai_persona: '',
      thinking_mode: 'balanced', custom_mode_prompt: '',
      custom_blocks: [], tech_stack: '',
      current_task: '', conventions: '',
      optimized_prompt: '', optimized_at: 0, use_optimized: false
    };
  }

  onMount(async () => {
    presets = await getAllPresets();
    settings = await getSettings();
  });

  function useTemplate(template: Template) {
    form = { ...template.preset };
    showTemplates = false;
    showForm = true;
    editingId = null;
  }

  async function activatePreset(id: string) {
    await setActivePreset(id);
    presets = await getAllPresets();
  }

  async function removePreset(id: string) {
    await deletePreset(id);
    presets = await getAllPresets();
  }

  function startEdit(preset: Preset) {
    editingId = preset.id;
    form = { ...preset };
    showForm = true;
    showTemplates = false;
  }

  async function submitForm() {
    if (!form.name.trim()) return;
    const preset: Preset = {
      ...form,
      id: editingId || crypto.randomUUID(),
      created_at: editingId ? (presets.find(p => p.id === editingId)?.created_at || Date.now()) : Date.now(),
      is_active: editingId ? (presets.find(p => p.id === editingId)?.is_active || false) : presets.length === 0,
    };
    await savePreset(preset);
    presets = await getAllPresets();
    showForm = false;
    editingId = null;
    form = emptyForm();
  }

  async function handleGenerate() {
    if (!settings.groq_api_key) { generateError = 'Add your Groq API key in Settings first.'; return; }
    generating = true;
    generateError = '';
    try {
      const tempPreset: Preset = { ...form, id: 'temp', created_at: Date.now(), is_active: false };
      const result = await generateOptimizedPrompt(tempPreset, settings.groq_api_key);
      form = { ...form, optimized_prompt: result, optimized_at: Date.now(), use_optimized: true };
    } catch (e) {
      generateError = 'Generation failed. Check your Groq API key.';
    } finally {
      generating = false;
    }
  }

  async function saveSettingsHandler() {
    await saveSettings(settings);
    settingsSaved = true;
    setTimeout(() => settingsSaved = false, 2000);
  }

  async function copyContext(preset: Preset) {
    await navigator.clipboard.writeText(generateContextBlock(preset));
    copied = preset.id;
    setTimeout(() => copied = null, 2000);
  }

  function cancelForm() {
    showForm = false;
    showTemplates = false;
    editingId = null;
    form = emptyForm();
  }
</script>

<main>
  <!-- Header -->
  <div class="header">
    <div class="logo-row">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#8b5cf6"/>
          </linearGradient>
        </defs>
        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#lg)" stroke-width="1.5" fill="rgba(59,130,246,0.08)"/>
        <rect x="9" y="11" width="9" height="2.5" rx="1.25" fill="url(#lg)"/>
        <rect x="9" y="15" width="12" height="2.5" rx="1.25" fill="url(#lg)" opacity="0.8"/>
        <rect x="9" y="19" width="7" height="2.5" rx="1.25" fill="url(#lg)" opacity="0.6"/>
        <circle cx="22" cy="12.25" r="1.5" fill="#3b82f6"/>
      </svg>
      <div>
        <div class="wordmark">ContextOS</div>
        <div class="tagline">CONTEXT ENGINE</div>
      </div>
    </div>
    <div class="header-actions">
      <button class="icon-btn-sm" on:click={() => { showSettings = !showSettings; showForm = false; showTemplates = false; }} title="Settings">⚙</button>
      <button class="new-btn" on:click={() => { showTemplates = true; showForm = false; showSettings = false; }}>+ New</button>
    </div>
  </div>

  <!-- Settings -->
  {#if showSettings}
    <div class="panel animate-in">
      <div class="panel-title">Settings</div>
      <div class="field">
        <div class="field-label">🔑 Groq API Key</div>
        <div class="groq-info">
          <span>✅ Free — 14,400 requests/day</span>
          <a href="https://console.groq.com/keys" target="_blank" class="groq-link">Get your free API key →</a>
        </div>
        <p class="hint">Stored locally. Only sent to Groq for prompt optimization.</p>
        <input type="password" bind:value={settings.groq_api_key} placeholder="gsk_..." class="input" />
      </div>
      <button class="save-btn" on:click={saveSettingsHandler}>
        {settingsSaved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  {/if}

  <!-- Template picker -->
  {#if showTemplates}
    <div class="panel animate-in">
      <div class="panel-header">
        <div class="panel-title">Choose a Template</div>
        <button class="close-btn" on:click={() => showTemplates = false}>×</button>
      </div>
      <div class="cat-pills">
        {#each ['All', ...CATEGORIES] as cat}
          <button class="cat-pill {selectedCategory === cat ? 'active' : ''}" on:click={() => selectedCategory = cat}>{cat}</button>
        {/each}
      </div>
      <div class="templates-grid">
        {#each TEMPLATES.filter(t => selectedCategory === 'All' || t.category === selectedCategory) as template}
          <button class="template-card" on:click={() => useTemplate(template)}>
            <span class="t-icon">{template.icon}</span>
            <span class="t-name">{template.name}</span>
            <span class="t-desc">{template.description}</span>
          </button>
        {/each}
        <button class="template-card blank" on:click={() => { showTemplates = false; showForm = true; editingId = null; form = emptyForm(); }}>
          <span class="t-icon">✏️</span>
          <span class="t-name">Start Blank</span>
          <span class="t-desc">Build from scratch</span>
        </button>
      </div>
    </div>

  <!-- Form -->
  {:else if showForm}
    <div class="panel animate-in">
      <div class="panel-header">
        <div class="panel-title">{editingId ? 'Edit Preset' : 'New Preset'}</div>
        <button class="close-btn" on:click={cancelForm}>×</button>
      </div>

      <!-- Type selector -->
      <div class="field">
        <div class="field-label">Preset Type</div>
        <div class="type-grid">
          {#each PRESET_TYPES as type}
            <button class="type-btn {form.preset_type === type.id ? 'active' : ''}"
              style={form.preset_type === type.id ? `border-color: ${type.color}40; background: ${type.color}10;` : ''}
              on:click={() => form.preset_type = type.id as any}>
              <span>{type.icon}</span>
              <span class="type-name">{type.name}</span>
              <span class="type-desc">{type.desc}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Name + Icon -->
      <div class="field">
        <div class="field-label">Name</div>
        <div class="row">
          <select bind:value={form.icon} class="icon-select">
            {#each PRESET_ICONS as icon}<option value={icon}>{icon}</option>{/each}
          </select>
          <input bind:value={form.name} placeholder="e.g. MCP Excel Server..." class="input flex-1" />
        </div>
      </div>

      <!-- Goals -->
      <div class="field">
        <div class="field-label">Goals</div>
        {#each form.goals as goal, i}
          <div class="tag-row">
            <span>{goal}</span>
            <button on:click={() => form.goals = form.goals.filter((_, idx) => idx !== i)}>×</button>
          </div>
        {/each}
        <div class="row">
          <input bind:value={newGoal} placeholder="Add a goal..." class="input flex-1"
            on:keydown={(e) => { if (e.key === 'Enter' && newGoal.trim()) { form.goals = [...form.goals, newGoal.trim()]; newGoal = ''; }}} />
          <button class="add-btn" on:click={() => { if (newGoal.trim()) { form.goals = [...form.goals, newGoal.trim()]; newGoal = ''; }}}>+</button>
        </div>
      </div>

      <!-- Coding agent fields -->
      {#if form.preset_type === 'coding_agent'}
        <div class="agent-section">
          <div class="agent-label">⚡ Coding Agent Settings</div>
          <div class="field">
            <div class="field-label">Tech Stack</div>
            <input bind:value={form.tech_stack} placeholder="e.g. Next.js, FastAPI, PostgreSQL..." class="input" />
          </div>
          <div class="field">
            <div class="field-label">Current Task</div>
            <input bind:value={form.current_task} placeholder="e.g. Building presets manager..." class="input" />
          </div>
          <div class="field">
            <div class="field-label">Conventions</div>
            <textarea bind:value={form.conventions} placeholder="e.g. Use Python scripts, always write tests..." class="textarea" rows="2"></textarea>
          </div>
        </div>
      {:else}
        <div class="field">
          <div class="field-label">Projects</div>
          {#each form.projects as project, i}
            <div class="tag-row">
              <span>{project}</span>
              <button on:click={() => form.projects = form.projects.filter((_, idx) => idx !== i)}>×</button>
            </div>
          {/each}
          <div class="row">
            <input bind:value={newProject} placeholder="Add a project..." class="input flex-1"
              on:keydown={(e) => { if (e.key === 'Enter' && newProject.trim()) { form.projects = [...form.projects, newProject.trim()]; newProject = ''; }}} />
            <button class="add-btn" on:click={() => { if (newProject.trim()) { form.projects = [...form.projects, newProject.trim()]; newProject = ''; }}}>+</button>
          </div>
        </div>

        <div class="field">
          <div class="field-label">Focus Areas</div>
          <input bind:value={form.interests} placeholder="e.g. SaaS, AI, productivity..." class="input" />
        </div>

        <div class="field">
          <div class="field-label">AI Persona</div>
          <textarea bind:value={form.ai_persona} placeholder="e.g. You are a brutal startup advisor..." class="textarea" rows="2"></textarea>
        </div>

        <div class="field">
          <div class="field-label">Thinking Mode</div>
          <div class="mode-grid">
            {#each THINKING_MODES as mode}
              <button class="mode-btn {form.thinking_mode === mode.id ? 'active' : ''}"
                style={form.thinking_mode === mode.id && mode.color ? `border-color: ${mode.color}50; background: ${mode.color}10; color: ${mode.color}` : ''}
                on:click={() => form.thinking_mode = mode.id}>
                <span>{mode.icon}</span>
                <span>{mode.name}</span>
              </button>
            {/each}
          </div>
          {#if form.thinking_mode === 'custom'}
            <textarea bind:value={form.custom_mode_prompt} placeholder="Describe your custom thinking style..." class="textarea mt2" rows="2"></textarea>
          {/if}
        </div>
      {/if}

      <div class="field">
        <div class="field-label">Working Style</div>
        <input bind:value={form.working_style} placeholder="e.g. Bullet points, concise, no preamble..." class="input" />
      </div>

      <div class="field">
        <div class="field-label">Custom Context</div>
        {#each form.custom_blocks as block, i}
          <div class="tag-row">
            <span>{block}</span>
            <button on:click={() => form.custom_blocks = form.custom_blocks.filter((_, idx) => idx !== i)}>×</button>
          </div>
        {/each}
        <div class="row">
          <input bind:value={newBlock} placeholder="Any extra context..." class="input flex-1"
            on:keydown={(e) => { if (e.key === 'Enter' && newBlock.trim()) { form.custom_blocks = [...form.custom_blocks, newBlock.trim()]; newBlock = ''; }}} />
          <button class="add-btn" on:click={() => { if (newBlock.trim()) { form.custom_blocks = [...form.custom_blocks, newBlock.trim()]; newBlock = ''; }}}>+</button>
        </div>
      </div>

      <!-- Optimize -->
      <div class="optimize-section">
        <div class="optimize-header">
          <div>
            <div class="optimize-title">✨ AI Prompt Architect</div>
            <div class="optimize-desc">Groq rewrites your context into an optimized system prompt</div>
          </div>
          <button class="generate-btn" on:click={handleGenerate} disabled={generating || !form.name.trim()}>
            {generating ? '⏳' : '✨ Generate'}
          </button>
        </div>
        {#if generateError}<div class="error-msg">{generateError}</div>{/if}
        {#if form.optimized_prompt}
          <div class="optimized-preview">
            <div class="preview-header">
              <span class="preview-ok">✓ Ready</span>
              <label class="toggle">
                <input type="checkbox" bind:checked={form.use_optimized} />
                <span>Use this</span>
              </label>
            </div>
            <pre class="preview-text">{form.optimized_prompt}</pre>
          </div>
        {/if}
      </div>

      <div class="form-actions">
        <button class="cancel-btn" on:click={cancelForm}>Cancel</button>
        <button class="save-btn flex2" on:click={submitForm} disabled={!form.name.trim()}>
          {editingId ? 'Update Preset' : 'Save Preset'}
        </button>
      </div>
    </div>

  {:else}
    <!-- Preset list -->
    {#if presets.length === 0}
      <div class="empty">
        <div class="empty-icon">◈</div>
        <div class="empty-title">No presets yet</div>
        <div class="empty-sub">Create your first context preset</div>
        <button class="create-btn" on:click={() => showTemplates = true}>+ Create Preset</button>
      </div>
    {:else}
      <div class="presets-list">
        {#each presets as preset}
          <div class="preset-card {preset.is_active ? 'active' : ''}">
            {#if preset.is_active}
              <div class="active-bar"></div>
            {/if}
            <div class="preset-header">
              <div class="preset-id">
                <span class="p-icon">{preset.icon}</span>
                <div>
                  <div class="p-name">{preset.name}</div>
                  <div class="p-meta">
                    <span style="color: {PRESET_TYPES.find(t => t.id === preset.preset_type)?.color || '#3b82f6'}; text-transform: capitalize;">
                      {preset.preset_type.replace('_', ' ')}
                    </span>
                    {#if preset.use_optimized && preset.optimized_prompt}
                      <span class="opt-tag">✨</span>
                    {/if}
                    {#if preset.is_active}
                      <span class="active-tag">ACTIVE</span>
                    {/if}
                  </div>
                </div>
              </div>
              <div class="p-actions">
                <button class="p-btn copy" on:click={() => copyContext(preset)}>
                  {copied === preset.id ? '✓' : '📋'}
                </button>
                <button class="p-btn edit" on:click={() => startEdit(preset)}>✏️</button>
                <button class="p-btn del" on:click={() => removePreset(preset.id)}>🗑️</button>
              </div>
            </div>

            {#if preset.goals && preset.goals.length > 0}
              <div class="p-summary">🎯 {preset.goals.slice(0, 2).join(' · ')}{preset.goals.length > 2 ? ` +${preset.goals.length - 2}` : ''}</div>
            {/if}
            {#if preset.preset_type === 'coding_agent' && preset.tech_stack}
              <div class="p-summary">💻 {preset.tech_stack}</div>
            {/if}

            {#if !preset.is_active}
              <button class="activate-btn" on:click={() => activatePreset(preset.id)}>Set as Active</button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</main>

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    background: #080b12;
    font-family: -apple-system, 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  :global(::-webkit-scrollbar) { width: 3px; }
  :global(::-webkit-scrollbar-track) { background: #080b12; }
  :global(::-webkit-scrollbar-thumb) { background: rgba(255,255,255,0.1); border-radius: 3px; }

  main {
    width: 420px;
    max-height: 680px;
    overflow-y: auto;
    background: #080b12;
    color: #f8fafc;
    font-size: 13px;
    padding: 14px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-in { animation: fadeIn 0.2s ease; }

  /* Header */
  .header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 14px;
  }
  .logo-row { display: flex; align-items: center; gap: 8px; }
  .wordmark {
    font-size: 13px; font-weight: 700;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; letter-spacing: -0.02em;
  }
  .tagline { font-size: 8px; color: #475569; letter-spacing: 0.08em; margin-top: 1px; }
  .header-actions { display: flex; gap: 6px; align-items: center; }

  .icon-btn-sm {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: #64748b; border-radius: 6px; width: 26px; height: 26px; cursor: pointer;
    font-size: 13px; display: flex; align-items: center; justify-content: center;
  }
  .icon-btn-sm:hover { color: white; }

  .new-btn {
    background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
    color: white; border: none; border-radius: 8px;
    padding: 5px 12px; cursor: pointer; font-size: 11px; font-weight: 600;
    box-shadow: 0 0 16px rgba(59,130,246,0.2);
  }

  /* Panel */
  .panel {
    background: #0d1526; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 14px; margin-bottom: 12px;
  }
  .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .panel-title { color: white; font-size: 13px; font-weight: 700; }
  .close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: 18px; }

  /* Settings */
  .groq-info {
    display: flex; flex-direction: column; gap: 4px;
    background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
    border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;
    font-size: 11px; color: #4ade80;
  }
  .groq-link { color: #60a5fa; text-decoration: none; font-weight: 600; font-size: 11px; }
  .groq-link:hover { text-decoration: underline; }
  .hint { color: #475569; font-size: 11px; margin-bottom: 6px; }

  /* Templates */
  .cat-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
  .cat-pill {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 3px 10px; color: #64748b;
    cursor: pointer; font-size: 10px; transition: all 0.15s;
  }
  .cat-pill:hover { color: white; }
  .cat-pill.active { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.1); color: #93c5fd; }

  .templates-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .template-card {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
    padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03); cursor: pointer; text-align: left;
    transition: all 0.15s; width: 100%;
  }
  .template-card:hover { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.06); }
  .template-card.blank { border-style: dashed; }
  .t-icon { font-size: 18px; }
  .t-name { color: white; font-size: 11px; font-weight: 600; }
  .t-desc { color: #475569; font-size: 10px; }

  /* Form */
  .field { margin-bottom: 12px; }
  .field-label {
    display: block; color: #475569; font-size: 10px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px;
  }

  .type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .type-btn {
    display: flex; flex-direction: column; gap: 1px;
    padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03); cursor: pointer; text-align: left; transition: all 0.15s;
  }
  .type-btn:hover { border-color: rgba(255,255,255,0.15); }
  .type-btn.active { border-color: rgba(59,130,246,0.4); }
  .type-name { color: white; font-size: 11px; font-weight: 600; }
  .type-desc { color: #475569; font-size: 10px; }

  .row { display: flex; gap: 6px; }
  .flex-1 { flex: 1; }
  .flex2 { flex: 2; }

  .input, .textarea, .icon-select {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 7px 10px; color: #f8fafc; font-size: 12px;
    outline: none; width: 100%; transition: border-color 0.2s;
    font-family: inherit;
  }
  .input:focus, .textarea:focus { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
  .input::placeholder, .textarea::placeholder { color: #475569; }
  .icon-select { width: 48px; flex-shrink: 0; padding: 6px 4px; cursor: pointer; }
  .textarea { resize: none; }
  .mt2 { margin-top: 6px; }

  .agent-section {
    background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.15);
    border-radius: 10px; padding: 10px; margin-bottom: 12px;
  }
  .agent-label { color: #a78bfa; font-size: 11px; font-weight: 700; margin-bottom: 10px; }

  .tag-row {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px; padding: 4px 8px; margin-bottom: 4px;
    font-size: 11px; color: #cbd5e1;
  }
  .tag-row button { background: none; border: none; color: #475569; cursor: pointer; font-size: 14px; }

  .add-btn {
    background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2);
    border-radius: 6px; width: 30px; cursor: pointer; font-size: 16px; flex-shrink: 0;
  }

  .mode-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .mode-btn {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 6px 4px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03); cursor: pointer; color: #64748b; font-size: 10px;
    transition: all 0.15s;
  }
  .mode-btn span:first-child { font-size: 13px; }
  .mode-btn:hover { border-color: rgba(255,255,255,0.15); color: white; }
  .mode-btn.active { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.08); color: #93c5fd; }

  .optimize-section {
    background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.15);
    border-radius: 10px; padding: 10px; margin-bottom: 12px;
  }
  .optimize-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .optimize-title { color: #a78bfa; font-size: 11px; font-weight: 700; margin-bottom: 2px; }
  .optimize-desc { color: #475569; font-size: 10px; line-height: 1.4; }
  .generate-btn {
    background: linear-gradient(135deg, #5b21b6, #4f46e5); color: white; border: none;
    border-radius: 7px; padding: 6px 10px; cursor: pointer; font-size: 11px; font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
  }
  .generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .error-msg { color: #f87171; font-size: 11px; margin-top: 6px; }

  .optimized-preview { margin-top: 8px; }
  .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .preview-ok { color: #4ade80; font-size: 11px; font-weight: 600; }
  .toggle { display: flex; align-items: center; gap: 4px; color: #94a3b8; font-size: 11px; cursor: pointer; }
  .toggle input { width: auto; cursor: pointer; }
  .preview-text {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px; padding: 8px; font-size: 10px; color: #64748b;
    white-space: pre-wrap; max-height: 120px; overflow-y: auto;
    font-family: 'JetBrains Mono', monospace; margin: 0;
  }

  .form-actions { display: flex; gap: 8px; margin-top: 12px; }
  .cancel-btn {
    flex: 1; background: rgba(255,255,255,0.04); color: #64748b;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
    padding: 8px; cursor: pointer; font-size: 12px;
  }
  .save-btn {
    background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
    color: white; border: none; border-radius: 8px;
    padding: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
    box-shadow: 0 0 16px rgba(59,130,246,0.2);
  }
  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Preset cards */
  .presets-list { display: flex; flex-direction: column; gap: 8px; }
  .preset-card {
    background: #0d1526; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 12px; position: relative; overflow: hidden;
    transition: border-color 0.2s;
  }
  .preset-card:hover { border-color: rgba(255,255,255,0.12); }
  .preset-card.active { border-color: rgba(59,130,246,0.3); background: linear-gradient(135deg, #0d1f3c 0%, #0d1526 100%); }

  .active-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  }

  .preset-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .preset-id { display: flex; align-items: center; gap: 8px; flex: 1; }
  .p-icon { font-size: 20px; }
  .p-name { font-weight: 600; color: white; font-size: 13px; }
  .p-meta { font-size: 10px; color: #475569; margin-top: 2px; display: flex; align-items: center; gap: 5px; text-transform: capitalize; }
  .opt-tag { color: #a78bfa; }
  .active-tag {
    font-size: 9px; font-weight: 700; background: rgba(59,130,246,0.15);
    color: #93c5fd; padding: 1px 5px; border-radius: 3px; letter-spacing: 0.5px;
  }
  .p-actions { display: flex; gap: 3px; }
  .p-btn {
    background: none; border: none; cursor: pointer;
    padding: 3px 5px; border-radius: 5px; font-size: 11px; color: #64748b;
    transition: all 0.15s;
  }
  .p-btn:hover { background: rgba(255,255,255,0.07); color: white; }
  .p-btn.del:hover { background: rgba(239,68,68,0.1); color: #f87171; }
  .p-btn.copy { color: #93c5fd; }

  .p-summary { font-size: 11px; color: #475569; margin-bottom: 6px; }

  .activate-btn {
    width: 100%; background: rgba(255,255,255,0.04); color: #64748b;
    border: 1px solid rgba(255,255,255,0.07); border-radius: 7px;
    padding: 5px; cursor: pointer; font-size: 11px; font-weight: 500;
    transition: all 0.15s;
  }
  .activate-btn:hover { background: rgba(59,130,246,0.1); color: #93c5fd; border-color: rgba(59,130,246,0.2); }

  /* Empty */
  .empty { text-align: center; padding: 32px 16px; color: #475569; }
  .empty-icon { font-size: 32px; opacity: 0.2; margin-bottom: 10px; }
  .empty-title { font-size: 14px; font-weight: 600; color: #94a3b8; margin-bottom: 4px; }
  .empty-sub { font-size: 11px; color: #475569; margin-bottom: 16px; }
  .create-btn {
    background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
    color: white; border: none; border-radius: 10px;
    padding: 8px 20px; cursor: pointer; font-size: 12px; font-weight: 600;
    box-shadow: 0 0 16px rgba(59,130,246,0.2);
  }
</style>