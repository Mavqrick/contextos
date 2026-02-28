<script lang="ts">
  import { onMount } from 'svelte';

  let goals: string[] = [];
  let projects: string[] = [];
  let interests: string = '';
  let isEnabled: boolean = true;
  let newGoal: string = '';
  let newProject: string = '';
  let saved: boolean = false;

  onMount(async () => {
    const data = await chrome.storage.local.get(['goals', 'projects', 'interests', 'isEnabled']);
    goals = data.goals || [];
    projects = data.projects || [];
    interests = data.interests || '';
    isEnabled = data.isEnabled !== false;
  });

  async function save() {
    await chrome.storage.local.set({ goals, projects, interests, isEnabled });
    saved = true;
    setTimeout(() => saved = false, 2000);
  }

  function addGoal() {
    if (newGoal.trim()) {
      goals = [...goals, newGoal.trim()];
      newGoal = '';
    }
  }

  function removeGoal(i: number) {
    goals = goals.filter((_, idx) => idx !== i);
  }

  function addProject() {
    if (newProject.trim()) {
      projects = [...projects, newProject.trim()];
      newProject = '';
    }
  }

  function removeProject(i: number) {
    projects = projects.filter((_, idx) => idx !== i);
  }

  function getContextBlock(): string {
    return `## My Context (via ContextOS)

**Active Goals:**
${goals.map(g => `- ${g}`).join('\n') || '- None set'}

**Current Projects:**
${projects.map(p => `- ${p}`).join('\n') || '- None set'}

**Focus Areas:** ${interests || 'Not set'}

Please use this context to personalize your responses.`;
  }

  async function copyContext() {
    await navigator.clipboard.writeText(getContextBlock());
    saved = true;
    setTimeout(() => saved = false, 2000);
  }
</script>

<main>
  <div class="header">
    <div class="logo">⚙️ ContextOS</div>
    <label class="toggle">
      <input type="checkbox" bind:checked={isEnabled} on:change={save} />
      <span class="slider"></span>
    </label>
  </div>

  {#if isEnabled}
    <div class="section">
      <div class="label">🎯 Active Goals</div>
      {#each goals as goal, i}
        <div class="tag">
          {goal}
          <button on:click={() => removeGoal(i)}>×</button>
        </div>
      {/each}
      <div class="input-row">
        <input bind:value={newGoal} placeholder="Add a goal..." on:keydown={(e) => e.key === 'Enter' && addGoal()} />
        <button class="add-btn" on:click={addGoal}>+</button>
      </div>
    </div>

    <div class="section">
      <div class="label">📁 Current Projects</div>
      {#each projects as project, i}
        <div class="tag">
          {project}
          <button on:click={() => removeProject(i)}>×</button>
        </div>
      {/each}
      <div class="input-row">
        <input bind:value={newProject} placeholder="Add a project..." on:keydown={(e) => e.key === 'Enter' && addProject()} />
        <button class="add-btn" on:click={addProject}>+</button>
      </div>
    </div>

    <div class="section">
      <div class="label">💡 Focus Areas</div>
      <input class="full-input" bind:value={interests} placeholder="e.g. SaaS, productivity, AI..." />
    </div>

    <div class="actions">
      <button class="copy-btn" on:click={copyContext}>
        📋 Copy Context Block
      </button>
      <button class="save-btn" on:click={save}>
        {saved ? '✓ Saved!' : 'Save'}
      </button>
    </div>
  {:else}
    <div class="disabled">
      ContextOS is disabled on this page.
      <br/>Enable the toggle to inject your context.
    </div>
  {/if}
</main>

<style>
  main {
    width: 320px;
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

  .logo {
    font-weight: 700;
    font-size: 15px;
  }

  .toggle input { display: none; }
  .slider {
    width: 36px; height: 20px;
    background: #334155;
    border-radius: 20px;
    display: block;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
  }
  .slider::after {
    content: '';
    position: absolute;
    width: 14px; height: 14px;
    background: white;
    border-radius: 50%;
    top: 3px; left: 3px;
    transition: transform 0.2s;
  }
  input:checked + .slider { background: #3b82f6; }
  input:checked + .slider::after { transform: translateX(16px); }

  .section { margin-bottom: 12px; }
  .label { color: #94a3b8; font-size: 11px; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 3px 8px;
    margin: 2px;
    font-size: 12px;
  }
  .tag button {
    background: none; border: none; color: #64748b;
    cursor: pointer; padding: 0; font-size: 14px; line-height: 1;
  }
  .tag button:hover { color: #ef4444; }

  .input-row { display: flex; gap: 6px; margin-top: 6px; }
  .input-row input, .full-input {
    flex: 1;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 5px 8px;
    color: #e2e8f0;
    font-size: 12px;
    outline: none;
    width: 100%;
  }
  .input-row input:focus, .full-input:focus { border-color: #3b82f6; }

  .add-btn {
    background: #1e40af; color: white; border: none;
    border-radius: 6px; width: 28px; cursor: pointer;
    font-size: 16px; display: flex; align-items: center; justify-content: center;
  }

  .actions { display: flex; gap: 8px; margin-top: 12px; }

  .copy-btn {
    flex: 1; background: #1e293b; color: #93c5fd;
    border: 1px solid #1e40af; border-radius: 8px;
    padding: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
  }
  .copy-btn:hover { background: #1e3a5f; }

  .save-btn {
    background: #1d4ed8; color: white; border: none;
    border-radius: 8px; padding: 8px 16px; cursor: pointer;
    font-size: 12px; font-weight: 600;
  }
  .save-btn:hover { background: #2563eb; }

  .disabled {
    text-align: center; color: #64748b;
    padding: 20px; line-height: 1.6;
  }
</style>