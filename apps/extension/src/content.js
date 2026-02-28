const DEFAULT_API_URL = 'https://glorious-fishstick-p96qw6r567w26w4v-8000.app.github.dev';

async function init() {
  try {
    const stored = await chrome.storage.local.get(['apiUrl', 'isEnabled']);
    if (!stored.isEnabled && stored.isEnabled !== undefined) return;

    const apiUrl = stored.apiUrl || DEFAULT_API_URL;
    const res = await fetch(`${apiUrl}/profile/`);
    const profile = await res.json();

    if (!profile.goals?.length && !profile.projects?.length) return;
    setTimeout(() => showBadge(profile), 2000);
  } catch (e) {
    console.log('ContextOS:', e);
  }
}

function showBadge(profile) {
  if (document.getElementById('cxos-badge')) return;

  const badge = document.createElement('div');
  badge.id = 'cxos-badge';
  badge.innerHTML = `
    <div style="
      position: fixed; bottom: 20px; right: 20px; z-index: 999999;
      background: #0f172a; border: 1px solid #1d4ed8;
      border-radius: 10px; padding: 10px 14px;
      font-family: -apple-system, sans-serif; font-size: 13px;
      color: #93c5fd; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      display: flex; align-items: center; gap: 8px; min-width: 220px;
    ">
      <span>⚙️</span>
      <div style="flex:1">
        <div id="cxos-badge-text"><strong style="color:white">ContextOS</strong> — context ready</div>
        <div style="font-size:11px; color:#475569; margin-top:2px" id="cxos-mode-label"></div>
      </div>
      <button id="cxos-close" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:16px;padding:0;">×</button>
    </div>
  `;

  // Show thinking mode label
  const modeLabels = {
    deep_thinker: '🔭 Deep Thinker',
    imaginative: '🌈 Imaginative',
    realistic: '⚖️ Realistic',
    focused: '🎯 Focused',
    free_thinker: '🌊 Free Thinker',
    custom: '✏️ Custom Mode',
    balanced: ''
  };

  const modeLabel = modeLabels[profile.thinking_mode] || '';
  if (modeLabel) {
    document.getElementById('cxos-mode-label').textContent = modeLabel;
  }

  document.getElementById('cxos-close').addEventListener('click', () => badge.remove());

  badge.querySelector('div').addEventListener('click', async (e) => {
    if (e.target.id === 'cxos-close') return;
    const contextBlock = generateContext(profile);
    await navigator.clipboard.writeText(contextBlock);
    document.getElementById('cxos-badge-text').innerHTML = '✓ <strong style="color:#4ade80">Context copied!</strong>';
    setTimeout(() => {
      document.getElementById('cxos-badge-text').innerHTML = '<strong style="color:white">ContextOS</strong> — context ready';
    }, 2000);
  });

  document.body.appendChild(badge);
}

const THINKING_PROMPTS = {
  deep_thinker: 'Before answering, reason through the problem step by step. Show your thinking process. Challenge assumptions. Only conclude after examining multiple angles. Use "First...", "However...", "Therefore..." structure.',
  imaginative: 'Think expansively and creatively. Explore wild possibilities. Use "yes, and..." thinking. Make unexpected connections. Fiction, metaphor, and lateral thinking are encouraged. There are no wrong ideas.',
  realistic: 'Be grounded and evidence-based. Call out wishful thinking directly. Prioritize what is proven over what sounds good. Be brutally honest even if uncomfortable. Ask "what is the evidence for this?"',
  focused: 'Be extremely concise. One idea per response. No tangents. No preamble. Lead with the answer. Bullet points over paragraphs. Maximum signal, minimum noise.',
  free_thinker: 'Think freely without constraints. Stream of consciousness is welcome. Connect seemingly unrelated ideas. Break conventional patterns. Surprise me with unexpected angles.',
  balanced: '',
  custom: ''
};

function generateContext(profile) {
  const goals = profile.goals || [];
  const projects = profile.projects || [];
  const interests = profile.interests || [];
  const blocks = (profile.custom_context_blocks || []).filter(b => !b.startsWith('__mode__'));
  const customModeBlock = (profile.custom_context_blocks || []).find(b => b.startsWith('__mode__'));
  const customModePrompt = customModeBlock ? customModeBlock.replace('__mode__', '') : '';

  const modePrompt = profile.thinking_mode === 'custom'
    ? customModePrompt
    : THINKING_PROMPTS[profile.thinking_mode] || '';

  const modeNames = {
    deep_thinker: 'Deep Thinker', imaginative: 'Imaginative',
    realistic: 'Realistic', focused: 'Focused',
    free_thinker: 'Free Thinker', custom: 'Custom', balanced: ''
  };

  return `## My Context (via ContextOS)

**Active Goals:**
${goals.map(g => `- ${g.title}${g.deadline ? ` (by ${g.deadline})` : ''}`).join('\n') || '- None set'}

**Current Projects:**
${projects.map(p => `- ${p.name} [${p.status}]`).join('\n') || '- None set'}

**Focus Areas:** ${Array.isArray(interests) ? interests.join(', ') : interests || 'Not set'}

**Working Style:** ${profile.working_style || 'Not set'}
${profile.ai_persona ? `\n**Your Role:** ${profile.ai_persona}` : ''}
${modePrompt ? `\n**Thinking Mode — ${modeNames[profile.thinking_mode] || 'Custom'}:**\n${modePrompt}` : ''}
${blocks.length > 0 ? `\n**Additional Context:**\n${blocks.map(b => `- ${b}`).join('\n')}` : ''}

Please use all of the above to personalize every response.`;
}

init();
