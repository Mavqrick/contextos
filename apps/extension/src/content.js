async function init() {
  const data = await chrome.storage.local.get(['goals', 'projects', 'interests', 'isEnabled']);
  if (!data.isEnabled && data.isEnabled !== undefined) return;
  if (!data.goals?.length && !data.projects?.length) return;
  setTimeout(() => showBadge(data), 2000);
}

function showBadge(data) {
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
      display: flex; align-items: center; gap: 8px;
    ">
      <span>⚙️</span>
      <span><strong style="color:white">ContextOS</strong> — context ready</span>
      <button onclick="document.getElementById('cxos-badge').remove()" style="
        background:none; border:none; color:#64748b; cursor:pointer;
        font-size:16px; padding:0; margin-left:4px;
      ">×</button>
    </div>
  `;
  badge.querySelector('div').addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') return;
    const contextBlock = generateContext(data);
    await navigator.clipboard.writeText(contextBlock);
    badge.querySelector('span:nth-child(2)').innerHTML = '✓ <strong style="color:#4ade80">Context copied!</strong>';
    setTimeout(() => {
      badge.querySelector('span:nth-child(2)').innerHTML = '<strong style="color:white">ContextOS</strong> — context ready';
    }, 2000);
  });
  document.body.appendChild(badge);
}

function generateContext(data) {
  const goals = data.goals || [];
  const projects = data.projects || [];
  const interests = data.interests || '';
  return `## My Context (via ContextOS)\n\n**Active Goals:**\n${goals.map(g => `- ${g}`).join('\n') || '- None set'}\n\n**Current Projects:**\n${projects.map(p => `- ${p}`).join('\n') || '- None set'}\n\n**Focus Areas:** ${interests || 'Not set'}\n\nPlease use this context to personalize your responses.`;
}

init();
