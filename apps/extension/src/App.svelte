<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllPresets, setActivePreset, generateContextBlock, type Preset } from './db';

  let presets: Preset[] = [];
  let activePreset: Preset | null = null;
  let copied = false;
  let loading = true;

  onMount(async () => {
    presets = await getAllPresets();
    activePreset = presets.find(p => p.is_active) || presets[0] || null;
    loading = false;
  });

  async function switchPreset(id: string) {
    await setActivePreset(id);
    presets = await getAllPresets();
    activePreset = presets.find(p => p.is_active) || null;
  }

  async function copyContext() {
    if (!activePreset) return;
    await navigator.clipboard.writeText(generateContextBlock(activePreset));
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function openPresets() {
    chrome.tabs.create({ url: chrome.runtime.getURL('presets.html') });
  }
</script>

<main>
  <div class="header">
    <div class="logo">⚙️ ContextOS</div>
    <button class="manage-btn" on:click={openPresets}>Manage Presets →</button>
  </div>

  {#if loading}
    <div class="loading">Loading...</div>

  {:else if !activePreset}
    <div class="empty">
      <p>No presets yet.</p>
      <button class="create-btn" on:click={openPresets}>+ Create your first preset</button>
    </div>

  {:else}
    <!-- Active preset display -->
    <div class="active-card">
      <div class="active-label">ACTIVE PRESET</div>
      <div class="active-title">
        <span class="active-icon">{activePreset.icon}</span>
        <span class="active-name">{activePreset.name}</span>
      </div>
      <div class="active-meta">
        {#if activePreset.goals.length > 0}
          <span>🎯 {activePreset.goals[0]}{activePreset.goals.length > 1 ? ` +${activePreset.goals.length - 1}` : ''}</span>
        {/if}
        {#if activePreset.thinking_mode && activePreset.thinking_mode !== 'balanced'}
          <span>🧠 {activePreset.thinking_mode.replace('_', ' ')}</span>
        {/if}
      </div>
      <button class="copy-btn {copied ? 'copied' : ''}" on:click={copyContext}>
        {copied ? '✓ Context Copied!' : '📋 Copy Context Block'}
      </button>
    </div>

    <!-- Switch preset -->
    {#if presets.length > 1}
      <div class="switch-section">
        <div class="switch-label">Switch Preset</div>
        <div class="preset-pills">
          {#each presets as preset}
            <button
              class="pill {preset.is_active ? 'active' : ''}"
              on:click={() => switchPreset(preset.id)}
            >
              {preset.icon} {preset.name}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    width: 300px;
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

  .manage-btn {
    background: none; border: none; color: #3b82f6;
    cursor: pointer; font-size: 11px; font-weight: 600;
  }
  .manage-btn:hover { color: #60a5fa; }

  .loading { color: #475569; text-align: center; padding: 20px; }

  .empty { text-align: center; padding: 24px 12px; }
  .empty p { color: #475569; margin-bottom: 12px; }

  .create-btn {
    background: #1d4ed8; color: white; border: none;
    border-radius: 8px; padding: 8px 16px; cursor: pointer;
    font-size: 12px; font-weight: 600;
  }

  .active-card {
    background: #1e293b; border: 1px solid #1d4ed8;
    border-radius: 10px; padding: 12px; margin-bottom: 10px;
  }

  .active-label {
    font-size: 9px; font-weight: 700; color: #3b82f6;
    letter-spacing: 1px; margin-bottom: 6px;
  }

  .active-title {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  }
  .active-icon { font-size: 20px; }
  .active-name { font-size: 15px; font-weight: 700; color: white; }

  .active-meta {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-bottom: 10px;
  }
  .active-meta span {
    font-size: 11px; color: #64748b;
    background: #0f172a; padding: 2px 8px;
    border-radius: 20px;
  }

  .copy-btn {
    width: 100%; padding: 9px;
    background: #1d4ed8; color: white; border: none;
    border-radius: 8px; cursor: pointer;
    font-size: 12px; font-weight: 600; transition: all 0.15s;
  }
  .copy-btn:hover { background: #2563eb; }
  .copy-btn.copied { background: #166534; color: #4ade80; }

  .switch-section { margin-top: 4px; }
  .switch-label {
    font-size: 10px; color: #475569; font-weight: 600;
    text-transform: uppercase; margin-bottom: 6px;
  }

  .preset-pills { display: flex; flex-wrap: wrap; gap: 6px; }

  .pill {
    background: #1e293b; border: 1px solid #334155;
    border-radius: 20px; padding: 4px 10px;
    color: #94a3b8; cursor: pointer; font-size: 11px;
    transition: all 0.15s;
  }
  .pill:hover { border-color: #475569; color: white; }
  .pill.active {
    border-color: #3b82f6; background: #1e3a5f; color: #93c5fd;
  }
</style>