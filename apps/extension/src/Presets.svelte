<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getAllPresets, savePreset, deletePreset, setActivePreset,
    getSettings, saveSettings, generateOptimizedPrompt,
    generateContextBlock, type Preset, type Settings
  } from './db';

  let presets: Preset[] = [];
  let settings: Settings = { groq_api_key: '' };
  let showForm = false;
  let showSettings = false;
  let editingId: string | null = null;
  let generating = false;
  let generateError = '';
  let settingsSaved = false;

  const THINKING_MODES = [
    { id: 'balanced', icon: '🧭', name: 'Balanced' },
    { id: 'deep_thinker', icon: '🔭', name: 'Deep Thinker' },
    { id: 'imaginative', icon: '🌈', name: 'Imaginative' },
    { id: 'realistic', icon: '⚖️', name: 'Realistic' },
    { id: 'focused', icon: '🎯', name: 'Focused' },
    { id: 'free_thinker', icon: '🌊', name: 'Free Thinker' },
    { id: 'custom', icon: '✏️', name: 'Custom' },
  ];

  const PRESET_TYPES = [
    { id: 'general', icon: '🚀', name: 'General', desc: 'Standard context for any AI chat' },
    { id: 'coding_agent', icon: '⚡', name: 'Coding Agent', desc: 'Claude Code, Antigravity, OpenClaw' },
    { id: 'founder', icon: '💼', name: 'Founder', desc: 'Startup & product decisions' },
    { id: 'researcher', icon: '🔬', name: 'Researcher', desc: 'Analysis & deep research' },
  ];

  const PRESET_ICONS = ['🚀', '💡', '🎯', '📝', '🔭', '🌈', '⚡', '🧠', '💼', '🎨', '🔬', '⚙️'];

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
  }

  async function submitForm() {
    if (!form.name.trim()) return;
    const preset: Preset = {
      ...form,
      id: editingId || crypto.randomUUID(),
      created_at: editingId
        ? (presets.find(p => p.id === editingId)?.created_at || Date.now())
        : Date.now(),
      is_active: editingId
        ? (presets.find(p => p.id === editingId)?.is_active || false)
        : presets.length === 0,
    };
    await savePreset(preset);
    presets = await getAllPresets();
    showForm = false;
    editingId = null;
    form = emptyForm();
  }

  async function handleGenerate() {
    if (!settings.groq_api_key) {
      generateError = 'Add your Groq API key in Settings first.';
      return;
    }
    generating = true;
    generateError = '';
    try {
      const tempPreset: Preset = {
        ...form, id: 'temp', created_at: Date.now(), is_active: false
      };
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
    const btn = document.getElementById(`copy-${preset.id}`);
    if (btn) {
      btn.textContent = '✓ Copied!';
      setTimeout(() => { if (btn) btn.textContent = '📋 Copy'; }, 2000);
    }
  }
</script>

<main>
  <div class="header">
    <div class="logo">⚙️ ContextOS</div>
    <div class="header-actions">
      <button class="icon-action" on:click={() => showSettings = !showSettings} title="Settings">⚙</button>
      <button class="new-btn" on:click={() => { showForm = true; editingId = null; form = emptyForm(); }}>
        + New Preset
      </button>
    </div>
  </div>

  <!-- Settings panel -->
  {#if showSettings}
    <div class="settings-panel">
      <div class="field">
        <label>🔑 Groq API Key</label>
        <div class="groq-info">
          <span>✅ Free to use — 14,400 requests/day on free tier</span>
          <a href="https://console.groq.com/keys" target="_blank" class="groq-link">
              Get your free API key →
          </a>
         </div>
        <p class="hint">Stored locally on your device. Only sent directly to Groq for prompt optimization. Never touches ContextOS servers.</p>
        <input
            type="password"
            bind:value={settings.groq_api_key}
            placeholder="gsk_..."
            class="full-input"
        />
      </div>
      <button class="save-btn" on:click={saveSettingsHandler}>
        {settingsSaved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  {/if}

  {#if showForm}
    <div class="form-card">
      <div class="form-header">
        <h3>{editingId ? 'Edit Preset' : 'New Preset'}</h3>
        <button class="close-btn" on:click={() => { showForm = false; editingId = null; form = emptyForm(); }}>×</button>
      </div>

      <!-- Preset Type -->
      <div class="field">
        <label>Preset Type</label>
        <div class="type-grid">
          {#each PRESET_TYPES as type}
            <button
              class="type-btn {form.preset_type === type.id ? 'active' : ''}"
              on:click={() => form.preset_type = type.id as any}
            >
              <span class="type-icon">{type.icon}</span>
              <span class="type-name">{type.name}</span>
              <span class="type-desc">{type.desc}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Name + Icon -->
      <div class="field">
        <label>Name</label>
        <div class="row">
          <select bind:value={form.icon} class="icon-select">
            {#each PRESET_ICONS as icon}
              <option value={icon}>{icon}</option>
            {/each}
          </select>
          <input bind:value={form.name} placeholder="e.g. ContextOS Dev, Startup Mode..." class="flex-input" />
        </div>
      </div>

      <!-- Goals -->
      <div class="field">
        <label>Goals</label>
        {#each form.goals as goal, i}
          <div class="tag-row">
            <span>{goal}</span>
            <button on:click={() => form.goals = form.goals.filter((_, idx) => idx !== i)}>×</button>
          </div>
        {/each}
        <div class="row">
          <input bind:value={newGoal} placeholder="Add a goal..." class="flex-input"
            on:keydown={(e) => { if (e.key === 'Enter' && newGoal.trim()) { form.goals = [...form.goals, newGoal.trim()]; newGoal = ''; }}} />
          <button class="add-btn" on:click={() => { if (newGoal.trim()) { form.goals = [...form.goals, newGoal.trim()]; newGoal = ''; }}}>+</button>
        </div>
      </div>

      <!-- Coding Agent specific fields -->
      {#if form.preset_type === 'coding_agent'}
        <div class="agent-section">
          <div class="agent-label">⚡ Coding Agent Settings</div>

          <div class="field">
            <label>Tech Stack</label>
            <input bind:value={form.tech_stack} placeholder="e.g. Next.js, FastAPI, PostgreSQL, Docker..." class="full-input" />
          </div>

          <div class="field">
            <label>Current Task / Feature</label>
            <input bind:value={form.current_task} placeholder="e.g. Building presets manager with IndexedDB" class="full-input" />
          </div>

          <div class="field">
            <label>Conventions & Preferences</label>
            <textarea
              bind:value={form.conventions}
              placeholder="e.g. Use Python scripts for all API calls. Always write tests. Prefer explicit over implicit. Use directives/ and execution/ folder structure."
              class="textarea" rows="3"
            ></textarea>
          </div>
        </div>
      {:else}
        <!-- General fields -->
        <div class="field">
          <label>Projects</label>
          {#each form.projects as project, i}
            <div class="tag-row">
              <span>{project}</span>
              <button on:click={() => form.projects = form.projects.filter((_, idx) => idx !== i)}>×</button>
            </div>
          {/each}
          <div class="row">
            <input bind:value={newProject} placeholder="Add a project..." class="flex-input"
              on:keydown={(e) => { if (e.key === 'Enter' && newProject.trim()) { form.projects = [...form.projects, newProject.trim()]; newProject = ''; }}} />
            <button class="add-btn" on:click={() => { if (newProject.trim()) { form.projects = [...form.projects, newProject.trim()]; newProject = ''; }}}>+</button>
          </div>
        </div>

        <div class="field">
          <label>Focus Areas</label>
          <input bind:value={form.interests} placeholder="e.g. SaaS, AI, productivity..." class="full-input" />
        </div>

        <div class="field">
          <label>AI Persona</label>
          <textarea bind:value={form.ai_persona} placeholder="e.g. You are a brutal startup advisor..." class="textarea" rows="2"></textarea>
        </div>

        <!-- Thinking Mode -->
        <div class="field">
          <label>Thinking Mode</label>
          <div class="mode-grid">
            {#each THINKING_MODES as mode}
              <button
                class="mode-btn {form.thinking_mode === mode.id ? 'active' : ''}"
                on:click={() => form.thinking_mode = mode.id}
              >
                <span>{mode.icon}</span>
                <span>{mode.name}</span>
              </button>
            {/each}
          </div>
          {#if form.thinking_mode === 'custom'}
            <textarea bind:value={form.custom_mode_prompt} placeholder="Describe your custom thinking style..." class="textarea mt-2" rows="3"></textarea>
          {/if}
        </div>
      {/if}

      <div class="field">
        <label>Working Style</label>
        <input bind:value={form.working_style} placeholder="e.g. Bullet points, concise, no preamble..." class="full-input" />
      </div>

      <!-- Custom context blocks -->
      <div class="field">
        <label>Custom Context</label>
        {#each form.custom_blocks as block, i}
          <div class="tag-row">
            <span>{block}</span>
            <button on:click={() => form.custom_blocks = form.custom_blocks.filter((_, idx) => idx !== i)}>×</button>
          </div>
        {/each}
        <div class="row">
          <input bind:value={newBlock} placeholder="Any extra context..." class="flex-input"
            on:keydown={(e) => { if (e.key === 'Enter' && newBlock.trim()) { form.custom_blocks = [...form.custom_blocks, newBlock.trim()]; newBlock = ''; }}} />
          <button class="add-btn" on:click={() => { if (newBlock.trim()) { form.custom_blocks = [...form.custom_blocks, newBlock.trim()]; newBlock = ''; }}}>+</button>
        </div>
      </div>

      <!-- AI Optimize button -->
      <div class="optimize-section">
        <div class="optimize-header">
          <div>
            <div class="optimize-title">✨ AI Prompt Architect</div>
            <div class="optimize-desc">
              {form.preset_type === 'coding_agent'
                ? 'Groq will generate a customized 3-layer agent architecture for your project'
                : 'Groq will rewrite your context into an optimized system prompt'}
            </div>
          </div>
          <button
            class="generate-btn {generating ? 'loading' : ''}"
            on:click={handleGenerate}
            disabled={generating || !form.name.trim()}
          >
            {generating ? '⏳ Generating...' : '✨ Generate'}
          </button>
        </div>

        {#if generateError}
          <div class="error-msg">{generateError}</div>
        {/if}

        {#if form.optimized_prompt}
          <div class="optimized-preview">
            <div class="preview-header">
              <span class="preview-label">✓ Optimized prompt ready</span>
              <label class="use-toggle">
                <input type="checkbox" bind:checked={form.use_optimized} />
                <span>Use this</span>
              </label>
            </div>
            <pre class="preview-text">{form.optimized_prompt}</pre>
          </div>
        {/if}
      </div>

      <div class="form-actions">
        <button class="cancel-btn" on:click={() => { showForm = false; editingId = null; form = emptyForm(); }}>Cancel</button>
        <button class="save-btn" on:click={submitForm} disabled={!form.name.trim()}>
          {editingId ? 'Update Preset' : 'Save Preset'}
        </button>
      </div>
    </div>

  {:else}
    {#if presets.length === 0}
      <div class="empty">
        <div class="empty-icon">🧠</div>
        <p>No presets yet.</p>
        <p class="empty-sub">Create your first context preset to get started.</p>
      </div>
    {:else}
      <div class="presets-list">
        {#each presets as preset}
          <div class="preset-card {preset.is_active ? 'active' : ''}">
            <div class="preset-header">
              <div class="preset-title">
                <span class="preset-icon">{preset.icon}</span>
                <div>
                  <div class="preset-name">{preset.name}</div>
                  <div class="preset-type-tag">
                    {PRESET_TYPES.find(t => t.id === preset.preset_type)?.icon}
                    {PRESET_TYPES.find(t => t.id === preset.preset_type)?.name}
                    {#if preset.use_optimized && preset.optimized_prompt}
                      <span class="optimized-tag">✨ Optimized</span>
                    {/if}
                  </div>
                </div>
                {#if preset.is_active}
                  <span class="active-badge">ACTIVE</span>
                {/if}
              </div>
              <div class="preset-actions">
                <button id="copy-{preset.id}" class="icon-btn copy" on:click={() => copyContext(preset)}>📋 Copy</button>
                <button class="icon-btn edit" on:click={() => startEdit(preset)}>✏️</button>
                <button class="icon-btn delete" on:click={() => removePreset(preset.id)}>🗑️</button>
              </div>
            </div>

            <div class="preset-summary">
              {#if preset.goals.length > 0}
                <div class="summary-row">🎯 {preset.goals.slice(0, 2).join(', ')}{preset.goals.length > 2 ? ` +${preset.goals.length - 2}` : ''}</div>
              {/if}
              {#if preset.preset_type === 'coding_agent' && preset.tech_stack}
                <div class="summary-row">💻 {preset.tech_stack}</div>
              {/if}
              {#if preset.thinking_mode && preset.thinking_mode !== 'balanced'}
                <div class="summary-row">🧠 {THINKING_MODES.find(m => m.id === preset.thinking_mode)?.icon} {THINKING_MODES.find(m => m.id === preset.thinking_mode)?.name}</div>
              {/if}
            </div>

            {#if !preset.is_active}
              <button class="activate-btn" on:click={() => activatePreset(preset.id)}>
                Set as Active
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    width: 420px;
    max-height: 650px;
    overflow-y: auto;
    background: #0f172a;
    color: #e2e8f0;
    font-family: -apple-system, sans-serif;
    font-size: 13px;
    padding: 14px;
  }

  .header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1e293b;
  }
  .logo { font-weight: 700; font-size: 15px; }
  .header-actions { display: flex; gap: 8px; align-items: center; }

  .icon-action {
    background: #1e293b; border: 1px solid #334155; color: #64748b;
    border-radius: 6px; width: 28px; height: 28px; cursor: pointer;
    font-size: 14px; display: flex; align-items: center; justify-content: center;
  }
  .icon-action:hover { color: white; }

  .new-btn {
    background: #1d4ed8; color: white; border: none;
    border-radius: 8px; padding: 6px 12px; cursor: pointer;
    font-size: 12px; font-weight: 600;
  }
  .new-btn:hover { background: #2563eb; }

  /* Settings */
  .settings-panel {
    background: #1e293b; border: 1px solid #334155;
    border-radius: 10px; padding: 12px; margin-bottom: 12px;
  }
  .hint { color: #475569; font-size: 11px; margin: 0 0 6px; }

  /* Empty */
  .empty { text-align: center; padding: 40px 20px; color: #475569; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty p { margin: 4px 0; }
  .empty-sub { font-size: 11px; color: #334155; }

  /* Preset cards */
  .presets-list { display: flex; flex-direction: column; gap: 8px; }

  .preset-card {
    background: #1e293b; border: 1px solid #334155;
    border-radius: 10px; padding: 10px 12px;
  }
  .preset-card.active { border-color: #3b82f6; background: #1e3a5f; }

  .preset-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .preset-title { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
  .preset-icon { font-size: 18px; margin-top: 2px; }
  .preset-name { font-weight: 600; color: white; font-size: 13px; }
  .preset-type-tag { font-size: 10px; color: #475569; margin-top: 2px; }
  .optimized-tag { color: #a78bfa; margin-left: 4px; }

  .active-badge {
    font-size: 9px; font-weight: 700; background: #1d4ed8; color: white;
    padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px; white-space: nowrap;
  }

  .preset-actions { display: flex; gap: 4px; }
  .icon-btn {
    background: none; border: none; cursor: pointer;
    padding: 3px 6px; border-radius: 5px; font-size: 11px; color: #64748b;
  }
  .icon-btn:hover { background: #334155; color: white; }
  .icon-btn.copy { color: #93c5fd; }
  .icon-btn.delete:hover { background: #450a0a; color: #fca5a5; }

  .preset-summary { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
  .summary-row { font-size: 11px; color: #64748b; }

  .activate-btn {
    width: 100%; background: #0f172a; color: #3b82f6;
    border: 1px solid #1e40af; border-radius: 6px;
    padding: 5px; cursor: pointer; font-size: 11px; font-weight: 600;
  }
  .activate-btn:hover { background: #1e3a5f; }

  /* Form */
  .form-card {
    background: #1e293b; border: 1px solid #334155;
    border-radius: 10px; padding: 14px;
  }
  .form-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
  }
  .form-header h3 { color: white; font-size: 14px; margin: 0; }
  .close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: 20px; }

  .field { margin-bottom: 12px; }
  label { display: block; color: #94a3b8; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }

  .type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .type-btn {
    display: flex; flex-direction: column; align-items: flex-start; gap: 1px;
    padding: 8px 10px; border-radius: 8px; border: 1px solid #334155;
    background: #0f172a; cursor: pointer; text-align: left; transition: all 0.15s;
  }
  .type-btn:hover { border-color: #475569; }
  .type-btn.active { border-color: #3b82f6; background: #1e3a5f; }
  .type-icon { font-size: 16px; }
  .type-name { color: white; font-size: 12px; font-weight: 600; }
  .type-desc { color: #475569; font-size: 10px; }

  .row { display: flex; gap: 6px; }
  .flex-input { flex: 1; }

  input, select, textarea {
    background: #0f172a; border: 1px solid #334155; border-radius: 6px;
    padding: 6px 8px; color: #e2e8f0; font-size: 12px; outline: none;
    width: 100%; box-sizing: border-box;
  }
  input:focus, textarea:focus { border-color: #3b82f6; }
  .icon-select { width: 50px; flex-shrink: 0; padding: 6px 4px; }
  .textarea { resize: none; font-family: inherit; }
  .full-input { width: 100%; }
  .mt-2 { margin-top: 6px; }

  /* Coding agent section */
  .agent-section {
    background: #0f172a; border: 1px solid #1e40af;
    border-radius: 8px; padding: 10px; margin-bottom: 12px;
  }
  .agent-label { color: #60a5fa; font-size: 11px; font-weight: 700; margin-bottom: 10px; }

  .tag-row {
    display: flex; justify-content: space-between; align-items: center;
    background: #0f172a; border: 1px solid #1e293b; border-radius: 5px;
    padding: 4px 8px; margin-bottom: 4px; font-size: 12px; color: #cbd5e1;
  }
  .tag-row button { background: none; border: none; color: #475569; cursor: pointer; font-size: 14px; }
  .tag-row button:hover { color: #ef4444; }

  .add-btn {
    background: #1e40af; color: white; border: none;
    border-radius: 6px; width: 30px; cursor: pointer; font-size: 16px; flex-shrink: 0;
  }

  .mode-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .mode-btn {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 6px 4px; border-radius: 7px; border: 1px solid #334155;
    background: #0f172a; cursor: pointer; color: #94a3b8; font-size: 10px;
  }
  .mode-btn span:first-child { font-size: 14px; }
  .mode-btn:hover { border-color: #475569; color: white; }
  .mode-btn.active { border-color: #3b82f6; background: #1e3a5f; color: #93c5fd; }

  /* Optimize section */
  .optimize-section {
    background: #0f172a; border: 1px solid #4c1d95;
    border-radius: 8px; padding: 10px; margin-bottom: 12px;
  }
  .optimize-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .optimize-title { color: #a78bfa; font-size: 12px; font-weight: 700; margin-bottom: 2px; }
  .optimize-desc { color: #475569; font-size: 10px; line-height: 1.4; }
  .generate-btn {
    background: #5b21b6; color: white; border: none; border-radius: 7px;
    padding: 6px 12px; cursor: pointer; font-size: 11px; font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
  }
  .generate-btn:hover { background: #6d28d9; }
  .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .generate-btn.loading { background: #4c1d95; }

  .error-msg { color: #f87171; font-size: 11px; margin-top: 6px; }

  .optimized-preview { margin-top: 8px; }
  .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .preview-label { color: #4ade80; font-size: 11px; font-weight: 600; }
  .use-toggle { display: flex; align-items: center; gap: 4px; color: #94a3b8; font-size: 11px; cursor: pointer; }
  .use-toggle input { width: auto; cursor: pointer; }
  .preview-text {
    background: #1e293b; border: 1px solid #334155; border-radius: 6px;
    padding: 8px; font-size: 10px; color: #94a3b8; white-space: pre-wrap;
    max-height: 150px; overflow-y: auto; font-family: monospace; margin: 0;
  }

  .form-actions { display: flex; gap: 8px; margin-top: 12px; }
  .cancel-btn {
    flex: 1; background: #1e293b; color: #94a3b8; border: 1px solid #334155;
    border-radius: 8px; padding: 8px; cursor: pointer; font-size: 12px;
  }
  .save-btn {
    flex: 2; background: #1d4ed8; color: white; border: none;
    border-radius: 8px; padding: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
  }
  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .save-btn:not(:disabled):hover { background: #2563eb; }

  .groq-info {
    display: flex; flex-direction: column; gap: 4px;
    background: #0f2a1a; border: 1px solid #166534;
    border-radius: 6px; padding: 8px 10px; margin-bottom: 6px;
    font-size: 11px; color: #4ade80;
  }
  .groq-link {
    color: #60a5fa; text-decoration: none; font-weight: 600; font-size: 11px;
  }
  .groq-link:hover { text-decoration: underline; }
</style>
