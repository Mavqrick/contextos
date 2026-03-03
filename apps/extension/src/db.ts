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
  tech_stack: string;
  current_task: string;
  conventions: string;
  optimized_prompt: string;
  optimized_at: number;
  use_optimized: boolean;
  created_at: number;
  is_active: boolean;
  prd_content: string;
}

export interface Settings {
  groq_api_key: string;
}

function chromeGet(keys: string[]): Promise<Record<string, any>> {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

function chromeSet(data: Record<string, any>): Promise<void> {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

export async function getAllPresets(): Promise<Preset[]> {
  const data = await chromeGet(['presets']);
  const presets: Preset[] = data.presets || [];
  return presets.sort((a, b) => b.created_at - a.created_at);
}

export async function savePreset(preset: Preset): Promise<void> {
  const presets = await getAllPresets();
  const existing = presets.findIndex(p => p.id === preset.id);
  if (existing >= 0) {
    presets[existing] = preset;
  } else {
    presets.push(preset);
  }
  await chromeSet({ presets });
}

export async function deletePreset(id: string): Promise<void> {
  const presets = await getAllPresets();
  await chromeSet({ presets: presets.filter(p => p.id !== id) });
}

export async function setActivePreset(id: string): Promise<void> {
  const presets = await getAllPresets();
  await chromeSet({
    presets: presets.map(p => ({ ...p, is_active: p.id === id }))
  });
}

export async function getActivePreset(): Promise<Preset | null> {
  const presets = await getAllPresets();
  return presets.find(p => p.is_active) || presets[0] || null;
}

export async function getSettings(): Promise<Settings> {
  const data = await chromeGet(['settings']);
  return data.settings || { groq_api_key: '' };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chromeSet({ settings });
}

export async function generateOptimizedPrompt(preset: Preset, groqApiKey: string): Promise<string> {
  const isCodingAgent = preset.preset_type === 'coding_agent';
  
  const systemPrompt = isCodingAgent
    ? `You are a prompt architect specializing in AI coding agents.
Given a developer's project details, generate a customized 3-layer agent architecture prompt adapted to their specific stack, project, and conventions.

STRICT RULES for the architecture:

Layer 1 — Directive (directives/ folder):
- Files are ALWAYS .md (Markdown), NEVER .py or code files
- Each file is a natural-language SOP defining: objective, inputs, tools to use, expected output, edge cases
- Written like instructions to a mid-level employee
- List directive filenames and what each covers in one sentence ONLY — do NOT write example content or fill in the actual markdown

Layer 2 — Orchestration (THIS IS THE LLM, NOT CODE):
- NO orchestration folder, NO orchestration Python scripts
- The LLM itself IS the orchestration layer
- Define behavioral rules for HOW the LLM should orchestrate:
  * Read the directive first before doing anything
  * Call execution scripts in the right order
  * Handle errors explicitly, never silently continue
  * Ask clarifying questions if intent is ambiguous
  * Update directives with learnings after each task

Layer 3 — Execution (execution/ folder):
- File types are determined by the user's tech stack — if they use Python write .py, TypeScript write .ts, Node.js write .js
- Scripts must be deterministic and testable regardless of language
- Describe each script's PURPOSE and INTERFACE only — do NOT write actual implementation code
- Format each execution script as:
  * Filename
  * Purpose (one sentence)
  * Key functions/methods (names + what they do, no code)
  * Dependencies to install
- All secrets in .env, never hardcoded
- Always match the execution scripts to the tech stack provided by the user

IMPORTANT OUTPUT RULES:
- In Layer 3, describe each execution script's PURPOSE and INTERFACE only — do NOT write actual implementation code
- Always reference the user's specific tech stack tools by name
- Do NOT include example directive content

Directory structure MUST be:
\`\`\`
project/
├── directives/
│   └── [task-name].md
├── execution/
│   └── [task-name].[ext based on tech stack]
├── .env
└── main.[ext based on tech stack]
\`\`\`

The generated prompt MUST end with this exact section adapted to the project:

---
## Reasoning & Validation Protocol

Before responding to any request:

<thinking>
1. What is the user trying to achieve?
2. Which directive applies to this request?
3. What execution scripts are needed and in what order?
4. What could go wrong? What edge cases apply?
5. What information is missing or ambiguous?
</thinking>

If step 5 identifies gaps, ask the user exactly 1-3 targeted questions before proceeding. Never assume. Never guess.
Only proceed with execution after gaps are resolved.
---

Output ONLY the architecture prompt ready to paste into an AI coding agent. No preamble, no explanation.`

    : `You are a prompt architect. Given a user's simple context information, rewrite it into an optimized system prompt that will get the best responses from AI assistants like Claude or ChatGPT.

Make it professional, specific, and actionable. Include communication rules, framing, and behavioral guidelines, like a <thinking> block for reasoning and validating the solutions for the optimal path.
Add a condition for LLM to ask appropriate questions from the thinking block to get further context from the user to help navigate decision making and validation.
The prompt MUST instruct the AI to:
1. Always use a <thinking> block before responding — reason through the problem, validate assumptions, and identify the optimal path before outputting any answer
2. Within the thinking block, identify what critical information is missing or ambiguous
3. If gaps are found, ask the user exactly 1-3 targeted clarifying questions BEFORE proceeding — never assume, never guess
4. Only proceed with the full response after either receiving answers or confirming no gaps exist

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
${preset.prd_content ? `\nPRD Document (excerpt):\n${preset.prd_content.slice(0, 2000)}` : ''}

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
      max_tokens: 1500
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export function generateContextBlock(preset: Preset): string {
  if (preset.optimized_prompt && preset.use_optimized) {
    return `## My Context (via ContextOS) — ${preset.name}\n\n${preset.optimized_prompt}`;
  }

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
${preset.prd_content ? `\n**Product Requirements Document:**\n${preset.prd_content.slice(0, 3000)}${preset.prd_content.length > 3000 ? '\n\n[PRD truncated for context — full document available]' : ''}` : ''}
Please use all of the above to personalize every response.`;
}