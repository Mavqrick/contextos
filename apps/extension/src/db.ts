const DB_NAME = 'contextos';
const DB_VERSION = 2;
const STORE = 'presets';
const SETTINGS_STORE = 'settings';

export type PresetType = 'general' | 'coding_agent' | 'founder' | 'researcher';

export interface Preset {
  id: string;
  name: string;
  icon: string;
  preset_type: PresetType;
  goals: string[];
  projects: string[];
  interests: string;
  working_style: string;
  ai_persona: string;
  thinking_mode: string;
  custom_mode_prompt: string;
  custom_blocks: string[];
  // Coding agent specific
  tech_stack: string;
  current_task: string;
  conventions: string;
  // Prompt architect
  optimized_prompt: string;
  optimized_at: number;
  use_optimized: boolean;
  created_at: number;
  is_active: boolean;
}

export interface Settings {
  groq_api_key: string;
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
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllPresets(): Promise<Preset[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
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
    presets.forEach(p => store.put({ ...p, is_active: p.id === id }));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getActivePreset(): Promise<Preset | null> {
  const presets = await getAllPresets();
  return presets.find(p => p.is_active) || presets[0] || null;
}

export async function getSettings(): Promise<Settings> {
  const db = await openDB();
  return new Promise((resolve) => {
    const req = db.transaction(SETTINGS_STORE, 'readonly')
      .objectStore(SETTINGS_STORE).get('main');
    req.onsuccess = () => resolve(req.result?.value || { groq_api_key: '' });
    req.onerror = () => resolve({ groq_api_key: '' });
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    tx.objectStore(SETTINGS_STORE).put({ key: 'main', value: settings });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function generateOptimizedPrompt(preset: Preset, groqApiKey: string): Promise<string> {
  const isCodingAgent = preset.preset_type === 'coding_agent';

  const systemPrompt = isCodingAgent
    ? `You are a prompt architect specializing in AI coding agents. 
Given a developer's project details, generate a customized 3-layer agent architecture adapted to their specific stack, project, and conventions.

The 3 layers are:
- Layer 1: Directive (SOPs in directives/ folder — what to do)
- Layer 2: Orchestration (intelligent routing and decisions — you are the glue)  
- Layer 3: Execution (deterministic Python scripts in execution/ folder — doing the work)

Output ONLY the architecture markdown. No preamble, no explanation. Start directly with the markdown.`
    : `You are a prompt architect. Given a user's simple context information, rewrite it into an optimized system prompt that will get the best responses from AI assistants like Claude or ChatGPT.

Make it professional, specific, and actionable. Include communication rules, framing, and behavioral guidelines.
Output ONLY the optimized prompt. No preamble, no explanation.`;

  const userMessage = isCodingAgent
    ? `Project: ${preset.name}
Goals: ${preset.goals.join(', ')}
Tech Stack: ${preset.tech_stack}
Current Task: ${preset.current_task}
Conventions/Preferences: ${preset.conventions || 'Standard best practices'}
Working Style: ${preset.working_style}

Generate a customized 3-layer agent architecture for this project.`
    : `Name: ${preset.name}
Type: ${preset.preset_type}
Goals: ${preset.goals.join(', ')}
Projects: ${preset.projects.join(', ')}
Focus Areas: ${preset.interests}
Working Style: ${preset.working_style}
AI Persona: ${preset.ai_persona}
Thinking Mode: ${preset.thinking_mode}
Custom Context: ${preset.custom_blocks.join(', ')}

Generate an optimized system prompt for this context.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqApiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export function generateContextBlock(preset: Preset): string {
  // Use optimized prompt if available and enabled
  if (preset.optimized_prompt && preset.use_optimized) {
    return `## My Context (via ContextOS) — ${preset.name}\n\n${preset.optimized_prompt}`;
  }

  // Fall back to raw context block
  const THINKING_PROMPTS: Record<string, string> = {
    deep_thinker: 'Before answering, reason through the problem step by step. Show your thinking process. Challenge assumptions. Only conclude after examining multiple angles.',
    imaginative: 'Think expansively and creatively. Explore wild possibilities. Use "yes, and..." thinking. There are no wrong ideas.',
    realistic: 'Be grounded and evidence-based. Call out wishful thinking directly. Be brutally honest even if uncomfortable.',
    focused: 'Be extremely concise. One idea per response. No tangents. Lead with the answer. Maximum signal, minimum noise.',
    free_thinker: 'Think freely without constraints. Connect seemingly unrelated ideas. Break conventional patterns.',
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