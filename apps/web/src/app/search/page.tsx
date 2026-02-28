'use client';
import { useState } from 'react';
import { searchKnowledge } from '@/lib/api';

interface SearchResult {
  id: string;
  content: string;
  item_type: string;
  tags: string[];
  source: string;
  similarity: number;
}

const TYPE_ICONS: Record<string, string> = {
  insight: '💡',
  task: '✅',
  reference: '📎',
  goal_update: '🎯',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchKnowledge(query);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">🔍 Search</h2>
        <p className="text-gray-400 mt-1">Search by meaning, not just keywords.</p>
      </div>

      {/* Search input */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you know about..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-blue-600 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No results found. Try capturing some thoughts first!
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={result.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{TYPE_ICONS[result.item_type] || '💡'}</span>
                <span className="text-xs text-gray-500 capitalize">{result.item_type}</span>
                {result.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-xs text-gray-600">#{index + 1}</div>
                <div className="text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800/50">
                  {Math.round(result.similarity * 100)}% match
                </div>
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">{result.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
