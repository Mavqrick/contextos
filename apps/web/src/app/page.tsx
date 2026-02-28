'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [status, setStatus] = useState<string>('checking...');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then((data) => {
        if (data.status === 'healthy') setStatus('connected');
        else setStatus('disconnected');
      })
      .catch(() => setStatus('disconnected'));
  }, [apiUrl]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Good morning 👋</h2>
        <p className="text-gray-400 mt-1">Your personal context engine is ready.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-sm">API Status</p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'checking...' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className="text-white font-medium capitalize">{status}</span>
          </div>
          <p className="text-gray-600 text-xs mt-1">{apiUrl}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-sm">Quick Capture</p>
          <a href="/capture" className="mt-2 block text-blue-400 hover:text-blue-300 font-medium">
            + Add a thought →
          </a>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-sm">Search Knowledge</p>
          <a href="/search" className="mt-2 block text-blue-400 hover:text-blue-300 font-medium">
            🔍 Find anything →
          </a>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">🧠 What is ContextOS?</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          ContextOS is your personal memory layer. Capture thoughts, ideas, tasks, and references 
          in one place. Search semantically — meaning it understands what you mean, not just what 
          you type. Your knowledge compounds over time.
        </p>
      </div>
    </div>
  );
}