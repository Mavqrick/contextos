'use client';
import { useState } from 'react';
import { captureItem } from '@/lib/api';

interface CaptureResult {
  id: string;
  type: string;
  tags: string[];
  message: string;
}

const TYPE_COLORS: Record<string, string> = {
  insight: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  task: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  reference: 'bg-green-500/20 text-green-300 border-green-500/30',
  goal_update: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const TYPE_ICONS: Record<string, string> = {
  insight: '💡',
  task: '✅',
  reference: '📎',
  goal_update: '🎯',
};

export default function CapturePage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<CaptureResult[]>([]);

  const handleCapture = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await captureItem(content);
      setResult(data);
      setHistory(prev => [data, ...prev]);
      setContent('');
    } catch (err) {
      setError('Failed to capture. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCapture();
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">✏️ Capture</h2>
        <p className="text-gray-400 mt-1">Drop a thought. ContextOS handles the rest.</p>
      </div>

      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind? A task, an idea, a link, a goal update..."
          className="w-full bg-transparent text-white placeholder-gray-600 resize-none outline-none text-base leading-relaxed"
          rows={4}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
          <span className="text-gray-600 text-xs">Ctrl+Enter to capture</span>
          <button
            onClick={handleCapture}
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? '🤔 Thinking...' : '⚡ Capture'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400 font-medium">✓ Captured!</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[result.type] || TYPE_COLORS.insight}`}>
              {TYPE_ICONS[result.type]} {result.type}
            </span>
          </div>
          {result.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {result.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">This session</h3>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                <span>{TYPE_ICONS[item.type] || '💡'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[item.type] || TYPE_COLORS.insight}`}>
                  {item.type}
                </span>
                {item.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-500">#{tag}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}