import React, { useState, useMemo } from 'react';
import { Search, Loader2, Github, AlertCircle } from 'lucide-react';
import { RepositoryExample } from '../types/api';

interface RepositoryInputProps {
  onIndex: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  disabled?: boolean;
}

const EXAMPLE_REPOS: RepositoryExample[] = [
  {
    name: 'psf/requests',
    url: 'https://github.com/psf/requests',
    description: 'Python HTTP library',
    language: 'Python',
  },
  {
    name: 'tiangolo/fastapi',
    url: 'https://github.com/tiangolo/fastapi',
    description: 'Modern high-performance web framework',
    language: 'Python',
  },
  {
    name: 'pmndrs/zustand',
    url: 'https://github.com/pmndrs/zustand',
    description: 'Bearbones state management',
    language: 'TypeScript',
  },
  {
    name: 'pallets/flask',
    url: 'https://github.com/pallets/flask',
    description: 'WSGI web application microframework',
    language: 'Python',
  },
];

export const RepositoryInput: React.FC<RepositoryInputProps> = ({
  onIndex,
  isLoading,
  error,
  disabled = false,
}) => {
  const [url, setUrl] = useState('');

  // Real-time URL parsing to extract owner/repo for feedback
  const parsedRepo = useMemo(() => {
    if (!url.trim()) return null;
    const match = url.trim().match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
    return null;
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading || disabled) return;
    onIndex(url.trim());
  };

  const handleQuickSelect = (exampleUrl: string) => {
    setUrl(exampleUrl);
    onIndex(exampleUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {/* Command Card */}
      <div className="bg-surface-100 border border-surface-border rounded-xl p-2.5 sm:p-3 shadow-lg shadow-black/20 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Input field with GitHub icon */}
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Github className="w-4 h-4" />
            </div>
            <input
              id="repository-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com/owner/repository"
              disabled={isLoading || disabled}
              className="w-full bg-surface-50 border border-surface-border rounded-lg pl-9 pr-24 sm:pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono transition-colors disabled:opacity-50"
              autoComplete="off"
              spellCheck="false"
            />
            {/* Visual detection tag */}
            {parsedRepo && !isLoading && (
              <div className="absolute right-2.5 hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/30 text-[10px] font-mono text-brand-400">
                <span>{parsedRepo.owner}/{parsedRepo.repo}</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading || disabled}
            className="px-4 py-2 text-xs font-medium bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 flex-shrink-0 shadow-sm shadow-brand-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Pipeline...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Analyze</span>
                <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 bg-white/20 rounded text-[9px] font-mono">
                  ↵
                </kbd>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Suggested repository chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
        <span className="text-[11px] text-slate-500 mr-1 font-mono">Examples:</span>
        {EXAMPLE_REPOS.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => handleQuickSelect(item.url)}
            disabled={isLoading || disabled}
            className="group flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-surface-100 hover:bg-surface-200 border border-surface-border hover:border-slate-600 text-slate-300 text-xs font-mono transition-colors disabled:opacity-50"
            title={`${item.description} (${item.language})`}
          >
            <span>{item.name}</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-sans">
              {item.language}
            </span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start space-x-2.5 text-xs text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg p-3 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-0.5">
            <p className="font-semibold text-rose-200">Repository analysis failed</p>
            <p className="text-rose-300/80 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
