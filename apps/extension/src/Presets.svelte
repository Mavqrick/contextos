<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllPresets, savePreset, deletePreset, setActivePreset, type Preset } from './db';

  let presets: Preset[] = [];
  let showForm = false;
  let editingId: string | null = null;

  const THINKING_MODES = [
    { id: 'balanced', icon: '🧭', name: 'Balanced' },
    { id: 'deep_thinker', icon: '🔭', name: 'Deep Thinker' },
    { id: 'imaginative', icon: '🌈', name: 'Imaginative' },
    { id: 'realistic', icon: '⚖️', name: 'Realistic' },
    { id: 'focused', icon: '🎯', name: 'Focused' },
    { id: 'free_thinker', icon: '🌊', name: 'Free Thinker' },
    { id: 'custom', icon: '✏️', name: 'Custom' },
  ];

  const PRESET_ICONS = ['🚀', '💡', '🎯', '📝', '🔭', '🌈', '⚡', '🧠', '💼', '🎨'];

  let form = emptyForm();

  function emptyForm() {
    return {
      name: '',
      icon: '🚀',
      goals: [] as string[],
      projects: [] as string[],
      interests: '',
      working_style: '',
      ai_persona: '',
      thinking_mode: 'balanced',
      custom_mode_prompt: '',
      custom_blocks: [] as string[],
    };
  }

  let newGoal = '';
  let newProject = '';
  let newBlock = '';

  onMount(async () => {
    presets = await getAllPresets();
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
    form = {
      name: preset.name,
      icon: preset.icon,
      goals: [...preset.goals],
      projects: [...preset.projects],
      interests: preset.interests,
      working_style: preset.working_style,
      ai_persona: preset.ai_persona,
      thinking_mode: preset.thinking_mode,
      custom_mode_prompt: preset.custom_mode_prompt,
      custom_blocks: [...preset.custom_blocks],
    };
    showForm = true;
  }

  async function submitForm() {
    if (!form.name.trim()) return;
    const preset: Preset = {
      id: editingId || crypto.randomUUID(),
      ...form,
      created_at: editingId ? (presets.find(p => p.id === editingId)?.created_at || Date.now()) : Date.now(),
      is_active: editingId ? (presets.find(p => p.id === editingId)?.is_active || false) : presets.length === 0,
    };
    await savePreset(preset);
    presets = await getAllPresets();
    showForm = false;
    editingId = null;
    form = emptyForm();
  }

  function cancelForm() {
    showForm = false;
    editingId = null;
    form = emptyForm();
  }

  async function copyContext(preset: Preset) {
    const { generateContextBlock } = await import('./db');
    await navigator.clipboard.writeText(generateContextBlock(preset));
    // Visual feedback
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
    <button class="new-btn" on:click={() => { showForm = true; editingId = null; form = emptyForm(); }}>
      + New Preset
    </button>
  </div>

  {#if showForm}
    <div class="form-card">
      <div class="form-header">
        <h3>{editingId ? 'Edit Preset' : 'New Preset'}</h3>
        <button class="close-btn" on:click={cancelForm}>×</button>
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
          <input bind:value={form.name} placeholder="e.g. Fiction Writer, Startup Mode..." class="flex-input" />
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

      <!-- Projects -->
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

      <!-- Interests + Working Style -->
      <div class="field">
        <label>Focus Areas</label>
        <input bind:value={form.interests} placeholder="e.g. SaaS, AI, fiction writing..." class="full-input" />
      </div>

      <div class="field">
        <label>Working Style</label>
        <input bind:value={form.working_style} placeholder="e.g. Bullet points, concise, direct..." class="full-input" />
      </div>

      <!-- AI Persona -->
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

      <!-- Custom Blocks -->
      <div class="field">
        <label>Custom Context</label>
        {#each form.custom_blocks as block, i}
          <div class="tag-row">
            <span>{block}</span>
            <button on:click={() => form.custom_blocks = form.custom_blocks.filter((_, idx) => idx !== i)}>×</button>
          </div>
        {/each}
        <div class="row">
          <input bind:value={newBlock} placeholder="e.g. My stack: Next.js, FastAPI..." class="flex-input"
            on:keydown={(e) => { if (e.key === 'Enter' && newBlock.trim()) { form.custom_blocks = [...form.custom_blocks, newBlock.trim()]; newBlock = ''; }}} />
          <button class="add-btn" on:click={() => { if (newBlock.trim()) { form.custom_blocks = [...form.custom_blocks, newBlock.trim()]; newBlock = ''; }}}>+</button>
        </div>
      </div>

      <div class="form-actions">
        <button class="cancel-btn" on:click={cancelForm}>Cancel</button>
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
                <span class="preset-name">{preset.name}</span>
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

            <!-- Summary -->
            <div class="preset-summary">
              {#if preset.goals.length > 0}
                <div class="summary-row">🎯 {preset.goals.slice(0, 2).join(', ')}{preset.goals.length > 2 ? ` +${preset.goals.length - 2}` : ''}</div>
              {/if}
              {#if preset.projects.length > 0}
                <div class="summary-row">📁 {preset.projects.slice(0, 2).join(', ')}{preset.projects.length > 2 ? ` +${preset.projects.length - 2}` : ''}</div>
              {/if}
              {#if preset.thinking_mode && preset.thinking_mode !== 'balanced'}
                <div class="summary-row">
                  🧠 {THINKING_MODES.find(m => m.id === preset.thinking_mode)?.icon}
                  {THINKING_MODES.find(m => m.id === preset.thinking_mode)?.name}
                </div>
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
    width: 380px;
    max-height: 600px;
    overflow-y: auto;
    background: #0f172a;
    color: #e2e8f0;
    font-family: -apple-system, sans-serif;
    font-size: 13px;
    padding: 12px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #1e293b;
  }

  .logo { font-weight: 700; font-size: 15px; }

  .new-btn {
    background: #1d4ed8; color: white; border: none;
    border-radius: 8px; padding: 6px 12px; cursor: pointer;
    font-size: 12px; font-weight: 600;
  }
  .new-btn:hover { background: #2563eb; }

  /* Empty state */
  .empty { text-align: center; padding: 40px 20px; color: #475569; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty p { margin: 4px 0; }
  .empty-sub { font-size: 11px; color: #334155; }

  /* Preset cards */
  .presets-list { display: flex; flex-direction: column; gap: 8px; }

  .preset-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 10px 12px;
    transition: border-color 0.2s;
  }
  .preset-card.active { border-color: #3b82f6; background: #1e3a5f; }

  .preset-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .preset-title { display: flex; align-items: center; gap: 6px; }
  .preset-icon { font-size: 16px; }
  .preset-name { font-weight: 600; color: white; font-size: 13px; }

  .active-badge {
    font-size: 9px; font-weight: 700;
    background: #1d4ed8; color: white;
    padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px;
  }

  .preset-actions { display: flex; gap: 4px; }
  .icon-btn {
    background: none; border: none; cursor: pointer;
    padding: 3px 6px; border-radius: 5px; font-size: 11px;
    color: #64748b; transition: all 0.15s;
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
    transition: all 0.15s;
  }
  .activate-btn:hover { background: #1e3a5f; }

  /* Form */
  .form-card {
    background: #1e293b; border: 1px solid #334155;
    border-radius: 10px; padding: 12px;
  }

  .form-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 12px;
  }
  .form-header h3 { color: white; font-size: 14px; margin: 0; }
  .close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: 18px; }

  .field { margin-bottom: 10px; }
  label { display: block; color: #94a3b8; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }

  .row { display: flex; gap: 6px; }
  .flex-input { flex: 1; }

  input, select, textarea {
    background: #0f172a; border: 1px solid #334155;
    border-radius: 6px; padding: 6px 8px;
    color: #e2e8f0; font-size: 12px; outline: none;
    width: 100%; box-sizing: border-box;
  }
  input:focus, textarea:focus { border-color: #3b82f6; }

  .icon-select { width: 50px; flex-shrink: 0; padding: 6px 4px; }
  .full-input { width: 100%; }
  .textarea { resize: none; font-family: inherit; }
  .mt-2 { margin-top: 6px; }

  .tag-row {
    display: flex; justify-content: space-between; align-items: center;
    background: #0f172a; border: 1px solid #1e293b;
    border-radius: 5px; padding: 4px 8px; margin-bottom: 4px;
    font-size: 12px; color: #cbd5e1;
  }
  .tag-row button { background: none; border: none; color: #475569; cursor: pointer; font-size: 14px; }
  .tag-row button:hover { color: #ef4444; }

  .add-btn {
    background: #1e40af; color: white; border: none;
    border-radius: 6px; width: 30px; cursor: pointer;
    font-size: 16px; flex-shrink: 0;
  }

  .mode-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
  }

  .mode-btn {
    display: flex; flex-direction: column; align-items: center;
    gap: 2px; padding: 6px 4px; border-radius: 7px;
    border: 1px solid #334155; background: #0f172a;
    cursor: pointer; color: #94a3b8; font-size: 10px;
    transition: all 0.15s;
  }
  .mode-btn span:first-child { font-size: 14px; }
  .mode-btn:hover { border-color: #475569; color: white; }
  .mode-btn.active { border-color: #3b82f6; background: #1e3a5f; color: #93c5fd; }

  .form-actions { display: flex; gap: 8px; margin-top: 12px; }
  .cancel-btn {
    flex: 1; background: #1e293b; color: #94a3b8;
    border: 1px solid #334155; border-radius: 8px;
    padding: 8px; cursor: pointer; font-size: 12px;
  }
  .save-btn {
    flex: 2; background: #1d4ed8; color: white; border: none;
    border-radius: 8px; padding: 8px; cursor: pointer;
    font-size: 12px; font-weight: 600;
  }
  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .save-btn:not(:disabled):hover { background: #2563eb; }
</style>