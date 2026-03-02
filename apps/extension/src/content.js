const SITE_RULES = [
  { patterns: ['github.com', 'gitlab.com', 'stackoverflow.com', 'replit.com', 'codesandbox.io'], preferred_type: 'coding_agent', icon: '⚡', label: 'Coding Agent' },
  { patterns: ['notion.so', 'scholar.google.com', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov'], preferred_type: 'researcher', icon: '🔬', label: 'Research' },
  { patterns: ['twitter.com', 'x.com', 'linkedin.com', 'medium.com', 'substack.com'], preferred_type: 'general', icon: '📝', label: 'Content' },
  { patterns: ['figma.com', 'dribbble.com', 'framer.com'], preferred_type: 'general', icon: '🎨', label: 'Design' },
];

function getSiteRule() {
  const hostname = window.location.hostname.replace('www.', '');
  return SITE_RULES.find(rule =>
    rule.patterns.some(p => hostname.includes(p))
  ) || null;
}

async function getAllPresets() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['presets'], (data) => {
      resolve(data.presets || []);
    });
  });
}

async function getActivePreset() {
  const presets = await getAllPresets();
  return presets.find(p => p.is_active) || presets[0] || null;
}

async function setActivePreset(id) {
  const presets = await getAllPresets();
  await new Promise(resolve =>
    chrome.storage.local.set({
      presets: presets.map(p => ({ ...p, is_active: p.id === id }))
    }, resolve)
  );
}

function generateContext(preset) {
  if (preset.optimized_prompt && preset.use_optimized) {
    return `## My Context (via ContextOS) — ${preset.name}\n\n${preset.optimized_prompt}`;
  }

  const THINKING_PROMPTS = {
    deep_thinker: 'Before answering, reason through the problem step by step. Show your thinking process. Challenge assumptions.',
    imaginative: 'Think expansively and creatively. Explore wild possibilities. There are no wrong ideas.',
    realistic: 'Be grounded and evidence-based. Call out wishful thinking directly. Be brutally honest.',
    focused: 'Be extremely concise. One idea per response. Maximum signal, minimum noise.',
    free_thinker: 'Think freely without constraints. Connect seemingly unrelated ideas.',
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

function showSwitchSuggestion(presets, rule) {
  if (document.getElementById('cxos-suggest')) return;

  const matchingPresets = presets.filter(p => p.preset_type === rule.preferred_type);
  if (matchingPresets.length === 0) return;

  const suggest = document.createElement('div');
  suggest.id = 'cxos-suggest';
  suggest.innerHTML = `
    <div style="
      position: fixed; bottom: 80px; right: 20px; z-index: 999998;
      background: #1e293b; border: 1px solid #f59e0b;
      border-radius: 10px; padding: 10px 14px;
      font-family: -apple-system, sans-serif; font-size: 12px;
      color: #fbbf24; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      max-width: 260px;
    ">
      <div style="font-weight:700; margin-bottom:6px;">
        ${rule.icon} Better preset available
      </div>
      <div style="color:#94a3b8; font-size:11px; margin-bottom:8px;">
        You have a ${rule.label} preset that matches this site
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${matchingPresets.slice(0, 2).map(p => `
          <button id="cxos-switch-${p.id}" style="
            background:#1d4ed8; color:white; border:none;
            border-radius:6px; padding:4px 8px; cursor:pointer;
            font-size:11px; font-weight:600;
          ">${p.icon} ${p.name}</button>
        `).join('')}
        <button id="cxos-suggest-dismiss" style="
          background:none; color:#475569; border:none;
          cursor:pointer; font-size:11px; padding:4px;
        ">Dismiss</button>
      </div>
    </div>
  `;

  document.body.appendChild(suggest);

  // Switch preset buttons
  matchingPresets.slice(0, 2).forEach(p => {
    const btn = document.getElementById(`cxos-switch-${p.id}`);
    if (btn) {
      btn.addEventListener('click', async () => {
        await setActivePreset(p.id);
        suggest.remove();
        const badge = document.getElementById('cxos-badge');
        if (badge) badge.remove();
        const newPreset = { ...p, is_active: true };
        showBadge(newPreset);
      });
    }
  });

  // Dismiss
  document.getElementById('cxos-suggest-dismiss')?.addEventListener('click', () => {
    suggest.remove();
  });

  // Auto dismiss after 8 seconds
  setTimeout(() => suggest.remove(), 8000);
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

async function init() {
  try {
    const preset = await getActivePreset();
    if (!preset) return;

    setTimeout(async () => {
      showBadge(preset);

      // Smart suggestion — check if a better preset exists for this site
      const rule = getSiteRule();
      if (rule && rule.preferred_type !== preset.preset_type) {
        const allPresets = await getAllPresets();
        const hasMatch = allPresets.some(p => p.preset_type === rule.preferred_type);
        if (hasMatch) {
          setTimeout(() => showSwitchSuggestion(allPresets, rule), 3000);
        }
      }
    }, 2000);
  } catch (e) {
    console.log('ContextOS:', e);
  }
}

init();
