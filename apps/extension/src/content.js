async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('contextos', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('presets')) {
        db.createObjectStore('presets', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getActivePreset() {
  const db = await openDB();
  return new Promise((resolve) => {
    const req = db.transaction('presets', 'readonly').objectStore('presets').getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      resolve(all.find(p => p.is_active) || all[0] || null);
    };
    req.onerror = () => resolve(null);
  });
}

function generateContext(preset) {
  const THINKING_PROMPTS = {
    deep_thinker: 'Before answering, reason through the problem step by step. Show your thinking process. Challenge assumptions.',
    imaginative: 'Think expansively and creatively. Explore wild possibilities. There are no wrong ideas.',
    realistic: 'Be grounded and evidence-based. Call out wishful thinking. Be brutally honest.',
    focused: 'Be extremely concise. One idea per response. Maximum signal, minimum noise.',
    free_thinker: 'Think freely without constraints. Connect seemingly unrelated ideas. Surprise me.',
    balanced: '',
    custom: preset.custom_mode_prompt || ''
  };

  const modeNames = {
    deep_thinker: 'Deep Thinker', imaginative: 'Imaginative',
    realistic: 'Realistic', focused: 'Focused',
    free_thinker: 'Free Thinker', custom: 'Custom', balanced: ''
  };

  const modePrompt = THINKING_PROMPTS[preset.thinking_mode] || '';

  return `## My Context (via ContextOS) — ${preset.name}

**Active Goals:**
${(preset.goals || []).map(g => `- ${g}`).join('\n') || '- None set'}

**Current Projects:**
${(preset.projects || []).map(p => `- ${p}`).join('\n') || '- None set'}

**Focus Areas:** ${preset.interests || 'Not set'}

**Working Style:** ${preset.working_style || 'Not set'}
${preset.ai_persona ? `\n**Your Role:** ${preset.ai_persona}` : ''}
${modePrompt ? `\n**Thinking Mode — ${modeNames[preset.thinking_mode]}:**\n${modePrompt}` : ''}
${preset.custom_blocks?.length > 0 ? `\n**Additional Context:**\n${preset.custom_blocks.map(b => `- ${b}`).join('\n')}` : ''}

Please use all of the above to personalize every response.`;
}

async function init() {
  try {
    const preset = await getActivePreset();
    if (!preset) return;
    setTimeout(() => showBadge(preset), 2000);
  } catch (e) {
    console.log('ContextOS:', e);
  }
}

function showBadge(preset) {
  if (document.getElementById('cxos-badge')) return;

  const modeLabels = {
    deep_thinker: '🔭 Deep Thinker', imaginative: '🌈 Imaginative',
    realistic: '⚖️ Realistic', focused: '🎯 Focused',
    free_thinker: '🌊 Free Thinker', custom: '✏️ Custom', balanced: ''
  };

  const modeLabel = modeLabels[preset.thinking_mode] || '';

  const badge = document.createElement('div');
  badge.id = 'cxos-badge';
  badge.innerHTML = `
    <div style="
      position: fixed; bottom: 20px; right: 20px; z-index: 999999;
      background: #0f172a; border: 1px solid #1d4ed8;
      border-radius: 10px; padding: 10px 14px;
      font-family: -apple-system, sans-serif; font-size: 13px;
      color: #93c5fd; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      display: flex; align-items: center; gap: 8px; min-width: 240px;
    ">
      <span style="font-size:18px">${preset.icon || '⚙️'}</span>
      <div style="flex:1">
        <div id="cxos-text"><strong style="color:white">${preset.name}</strong> — ready</div>
        ${modeLabel ? `<div style="font-size:11px;color:#475569;margin-top:2px">${modeLabel}</div>` : ''}
      </div>
      <button id="cxos-close" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:16px;padding:0;line-height:1">×</button>
    </div>
  `;

  badge.querySelector('#cxos-close').addEventListener('click', (e) => {
    e.stopPropagation();
    badge.remove();
  });

  badge.querySelector('div').addEventListener('click', async (e) => {
    if (e.target.id === 'cxos-close') return;
    await navigator.clipboard.writeText(generateContext(preset));
    const t = document.getElementById('cxos-text');
    if (t) {
      t.innerHTML = '✓ <strong style="color:#4ade80">Context copied!</strong>';
      setTimeout(() => {
        t.innerHTML = `<strong style="color:white">${preset.name}</strong> — ready`;
      }, 2000);
    }
  });

  document.body.appendChild(badge);
}

init();
