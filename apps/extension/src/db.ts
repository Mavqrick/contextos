const DB_NAME = 'contextos';
const DB_VERSION = 1;
const STORE = 'presets';

export interface Preset {
  id: string;
  name: string;
  icon: string;
  goals: string[];
  projects: string[];
  interests: string;
  working_style: string;
  ai_persona: string;
  thinking_mode: string;
  custom_mode_prompt: string;
  custom_blocks: string[];
  created_at: number;
  is_active: boolean;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('is_active', 'is_active', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllPresets(): Promise<Preset[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.created_at - a.created_at));
    req.onerror = () => reject(req.error);
  });
}

export async function savePreset(preset: Preset): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(preset);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePreset(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function setActivePreset(id: string): Promise<void> {
  const presets = await getAllPresets();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    presets.forEach(p => {
      store.put({ ...p, is_active: p.id === id });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getActivePreset(): Promise<Preset | null> {
  const presets = await getAllPresets();
  return presets.find(p => p.is_active) || presets[0] || null;
}

export function generateContextBlock(preset: Preset): string {
  const THINKING_PROMPTS: Record<string, string> = {
    deep_thinker: 'Before answering, reason through the problem step by step. Show your thinking process. Challenge assumptions. Only conclude after examining multiple angles.',
    imaginative: 'Think expansively and creatively. Explore wild possibilities. Use "yes, and..." thinking. Make unexpected connections. There are no wrong ideas.',
    realistic: 'Be grounded and evidence-based. Call out wishful thinking directly. Be brutally honest even if uncomfortable.',
    focused: 'Be extremely concise. One idea per response. No tangents. Lead with the answer. Maximum signal, minimum noise.',
    free_thinker: 'Think freely without constraints. Connect seemingly unrelated ideas. Break conventional patterns. Surprise me.',
    balanced: '',
    custom: preset.custom_mode_prompt || ''
  };

  const modeNames: Record<string, string> = {
    deep_thinker: 'Deep Thinker', imaginative: 'Imaginative',
    realistic: 'Realistic', focused: 'Focused',
    free_thinker: 'Free Thinker', custom: 'Custom', balanced: ''
  };

  const modePrompt = THINKING_PROMPTS[preset.thinking_mode] || '';

  return `## My Context (via ContextOS) — ${preset.name}

**Active Goals:**
${preset.goals.map(g => `- ${g}`).join('\n') || '- None set'}

**Current Projects:**
${preset.projects.map(p => `- ${p}`).join('\n') || '- None set'}

**Focus Areas:** ${preset.interests || 'Not set'}

**Working Style:** ${preset.working_style || 'Not set'}
${preset.ai_persona ? `\n**Your Role:** ${preset.ai_persona}` : ''}
${modePrompt ? `\n**Thinking Mode — ${modeNames[preset.thinking_mode]}:**\n${modePrompt}` : ''}
${preset.custom_blocks?.length > 0 ? `\n**Additional Context:**\n${preset.custom_blocks.map(b => `- ${b}`).join('\n')}` : ''}

Please use all of the above to personalize every response.`;
}