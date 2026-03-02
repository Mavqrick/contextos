export interface SiteRule {
  patterns: string[];
  preferred_type: string;
  label: string;
  icon: string;
  suggestion: string;
}

export const SITE_RULES: SiteRule[] = [
  {
    patterns: ['github.com', 'gitlab.com', 'stackoverflow.com', 'codepen.io', 'replit.com', 'codesandbox.io'],
    preferred_type: 'coding_agent',
    label: 'Coding',
    icon: '⚡',
    suggestion: 'Switch to a Coding Agent preset for better results here'
  },
  {
    patterns: ['notion.so', 'obsidian.md', 'roamresearch.com', 'pubmed.ncbi.nlm.nih.gov', 'scholar.google.com', 'arxiv.org'],
    preferred_type: 'researcher',
    label: 'Research',
    icon: '🔬',
    suggestion: 'Switch to a Research preset for better results here'
  },
  {
    patterns: ['twitter.com', 'x.com', 'linkedin.com', 'medium.com', 'substack.com', 'beehiiv.com', 'ghost.io'],
    preferred_type: 'general',
    label: 'Content',
    icon: '📝',
    suggestion: 'Switch to a Content Creator preset for better results here'
  },
  {
    patterns: ['figma.com', 'dribbble.com', 'behance.net', 'framer.com'],
    preferred_type: 'general',
    label: 'Design',
    icon: '🎨',
    suggestion: 'Switch to a Design preset for better results here'
  },
  {
    patterns: ['chat.openai.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'poe.com'],
    preferred_type: 'any',
    label: 'AI Chat',
    icon: '🤖',
    suggestion: ''
  }
];

export function getSiteRule(url: string): SiteRule | null {
  const hostname = new URL(url).hostname.replace('www.', '');
  return SITE_RULES.find(rule =>
    rule.patterns.some(pattern => hostname.includes(pattern))
  ) || null;
}

export function shouldSuggestSwitch(
  currentPresetType: string,
  url: string
): { should: boolean; rule: SiteRule | null } {
  const rule = getSiteRule(url);
  if (!rule || rule.preferred_type === 'any') return { should: false, rule: null };
  const should = rule.preferred_type !== currentPresetType;
  return { should, rule };
}