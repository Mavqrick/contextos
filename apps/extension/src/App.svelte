<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllPresets, setActivePreset, generateContextBlock, type Preset } from './db';

  let presets: Preset[] = [];
  let active: Preset | null = null;
  let copied = false;

  const THINKING_LABELS: Record<string, { label: string; color: string }> = {
    deep_thinker: { label: '🔭 Deep Thinker', color: '#3b82f6' },
    imaginative: { label: '🌈 Imaginative', color: '#8b5cf6' },
    realistic: { label: '⚖️ Realistic', color: '#10b981' },
    focused: { label: '🎯 Focused', color: '#f59e0b' },
    free_thinker: { label: '🌊 Free Thinker', color: '#06b6d4' },
    custom: { label: '✏️ Custom', color: '#94a3b8' },
    balanced: { label: '', color: '' },
  };

  const TYPE_COLORS: Record<string, string> = {
    general: '#3b82f6',
    coding_agent: '#8b5cf6',
    founder: '#f59e0b',
    researcher: '#10b981',
  };

  onMount(async () => {
    presets = await getAllPresets();
    active = presets.find(p => p.is_active) || presets[0] || null;
  });

  async function switchPreset(id: string) {
    await setActivePreset(id);
    presets = await getAllPresets();
    active = presets.find(p => p.is_active) || null;
  }

  async function copyContext() {
    if (!active) return;
    await navigator.clipboard.writeText(generateContextBlock(active));
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function openPresets() {
    chrome.tabs.create({ url: chrome.runtime.getURL('presets.html') });
  }
</script>

<main>
  <!-- Header -->
  <div class="header">
    <div class="logo-row">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#8b5cf6"/>
          </linearGradient>
        </defs>
        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#g)" stroke-width="1.5" fill="rgba(59,130,246,0.08)"/>
        <rect x="9" y="11" width="9" height="2.5" rx="1.25" fill="url(#g)"/>
        <rect x="9" y="15" width="12" height="2.5" rx="1.25" fill="url(#g)" opacity="0.8"/>
        <rect x="9" y="19" width="7" height="2.5" rx="1.25" fill="url(#g)" opacity="0.6"/>
        <circle cx="22" cy="12.25" r="1.5" fill="#3b82f6"/>
      </svg>
      <div>
        <div class="wordmark">ContextOS</div>
        <div class="tagline">CONTEXT ENGINE</div>
      </div>
    </div>
    <button class="manage-btn" on:click={openPresets}>Manage →</button>
  </div>

  {#if active}
    <!-- Active preset card -->
    <div class="active-card">
      <div class="active-top">
        <div class="pill">
          <span class="dot dot-blue"></span>
          Active Preset
        </div>
        {#if active.use_optimized && active.optimized_prompt}
          <div class="pill pill-purple">
            <span class="dot dot-purple"></span>
            Optimized
          </div>
        {/if}
      </div>

      <div class="preset-identity">
        <span class="preset-icon">{active.icon}</span>
        <div>
          <div class="preset-name">{active.name}</div>
          <div class="preset-meta">
            <span style="color: {TYPE_COLORS[active.preset_type] || '#3b82f6'}">
              {active.preset_type.replace('_', ' ')}
            </span>
            {#if THINKING_LABELS[active.thinking_mode]?.label}
              <span class="meta-sep">·</span>
              <span style="color: {THINKING_LABELS[active.thinking_mode].color}">
                {THINKING_LABELS[active.thinking_mode].label}
              </span>
            {/if}
          </div>
        </div>
      </div>

      {#if active.goals && active.goals.length > 0}
        <div class="goals-preview">
          {active.goals.slice(0, 2).join(' · ')}{active.goals.length > 2 ? ` +${active.goals.length - 2}` : ''}
        </div>
      {/if}

      <button class="copy-btn" on:click={copyContext}>
        {#if copied}
          <span>✓ Context Copied!</span>
        {:else}
          <span>📋 Copy Context Block</span>
        {/if}
      </button>
    </div>

    <!-- Quick switch -->
    {#if presets.length > 1}
      <div class="switch-section">
        <div class="switch-label">Switch Preset</div>
        <div class="switch-pills">
          {#each presets.filter(p => !p.is_active).slice(0, 3) as preset}
            <button class="switch-pill" on:click={() => switchPreset(preset.id)}>
              {preset.icon} {preset.name}
            </button>
          {/each}
        </div>
      </div>
    {/if}

  {:else}
    <!-- Empty state -->
    <div class="empty">
      <div class="empty-icon">◈</div>
      <div class="empty-title">No presets yet</div>
      <div class="empty-sub">Create your first context preset to get started</div>
      <button class="create-btn" on:click={openPresets}>+ Create Preset</button>
    </div>
  {/if}
</main>

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    background: #080b12;
    font-family: -apple-system, 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  main {
    width: 300px;
    background: #080b12;
    color: #f8fafc;
    padding: 14px;
    min-height: 100px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 14px;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wordmark {
    font-size: 13px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .tagline {
    font-size: 8px;
    color: #475569;
    letter-spacing: 0.08em;
    margin-top: 1px;
  }

  .manage-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 11px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }
  .manage-btn:hover { color: #f8fafc; border-color: rgba(255,255,255,0.2); }

  .active-card {
    background: #0d1526;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 10px;
  }

  .active-top {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 100px;
    padding: 3px 8px;
    font-size: 10px;
    color: #94a3b8;
    font-weight: 500;
  }

  .pill-purple {
    background: rgba(139,92,246,0.1);
    border-color: rgba(139,92,246,0.3);
    color: #a78bfa;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dot-blue { background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }
  .dot-purple { background: #8b5cf6; box-shadow: 0 0 6px #8b5cf6; }
  .dot-green { background: #10b981; box-shadow: 0 0 6px #10b981; }

  .preset-identity {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .preset-icon { font-size: 22px; }

  .preset-name {
    font-size: 14px;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.01em;
  }

  .preset-meta {
    font-size: 11px;
    color: #475569;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
    text-transform: capitalize;
  }

  .meta-sep { color: #334155; }

  .goals-preview {
    font-size: 11px;
    color: #475569;
    margin-bottom: 12px;
    line-height: 1.4;
    padding: 6px 8px;
    background: rgba(255,255,255,0.03);
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .copy-btn {
    width: 100%;
    background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(59,130,246,0.2);
  }
  .copy-btn:hover { box-shadow: 0 0 30px rgba(59,130,246,0.35); transform: translateY(-1px); }

  .switch-section { margin-bottom: 10px; }

  .switch-label {
    font-size: 10px;
    color: #475569;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }

  .switch-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .switch-pill {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 11px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .switch-pill:hover { color: #f8fafc; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); }

  .empty {
    text-align: center;
    padding: 32px 16px;
    color: #475569;
  }
  .empty-icon { font-size: 32px; opacity: 0.3; margin-bottom: 10px; }
  .empty-title { font-size: 14px; font-weight: 600; color: #94a3b8; margin-bottom: 4px; }
  .empty-sub { font-size: 11px; color: #475569; margin-bottom: 16px; line-height: 1.4; }

  .create-btn {
    background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 8px 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(59,130,246,0.2);
  }
</style>