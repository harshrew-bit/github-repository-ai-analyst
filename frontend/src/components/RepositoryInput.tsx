import React, { useState, useMemo } from 'react';
import { Github, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { RepositoryExample } from '../types/api';

interface RepositoryInputProps {
  onIndex: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  disabled?: boolean;
  variant?: 'dark' | 'light';
}

const EXAMPLE_REPOS: RepositoryExample[] = [
  {
    name: 'psf/requests',
    url: 'https://github.com/psf/requests',
    description: 'Python HTTP library for humans',
    language: 'Python',
  },
  {
    name: 'tiangolo/fastapi',
    url: 'https://github.com/tiangolo/fastapi',
    description: 'Modern, high-performance web framework',
    language: 'Python',
  },
  {
    name: 'pmndrs/zustand',
    url: 'https://github.com/pmndrs/zustand',
    description: 'Bearbones state-management for React',
    language: 'TypeScript',
  },
  {
    name: 'pallets/flask',
    url: 'https://github.com/pallets/flask',
    description: 'WSGI web application micro-framework',
    language: 'Python',
  },
];

const LANGUAGE_DOT: Record<string, string> = {
  Python:     'bg-sky-500',
  TypeScript: 'bg-amber-500',
  JavaScript: 'bg-yellow-500',
  Go:         'bg-cyan-500',
  Rust:       'bg-orange-500',
};

export const RepositoryInput: React.FC<RepositoryInputProps> = ({
  onIndex,
  isLoading,
  error,
  disabled = false,
}) => {
  const [url, setUrl] = useState('');

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

  const isValid = !!parsedRepo;
  const isEmpty = !url.trim();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">

      {/* ── Command Bar Container (Frosted Glass) */}
      <div
        className={`relative rounded-2xl transition-all duration-200 backdrop-blur-md ${
          error
            ? 'bg-white/90 border border-error/40 ring-2 ring-error/10 shadow-lifted'
            : 'bg-white/85 border border-stone-200/90 hover:border-stone-300 focus-within:border-cobalt-500 focus-within:ring-4 focus-within:ring-cobalt-500/15 shadow-glass hover:shadow-glass-hover'
        }`}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2">

            {/* Input & Prefix Icon */}
            <div className="relative flex-1 flex items-center min-w-0">
              <div
                className="absolute left-3.5 pointer-events-none text-ink-tertiary transition-colors"
                aria-hidden="true"
              >
                <Github className="w-4 h-4 text-stone-500" />
              </div>

              <input
                id="repository-url-input"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                disabled={isLoading || disabled}
                className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm font-mono text-ink placeholder:text-stone-400 focus:outline-none transition-colors disabled:opacity-50"
                autoComplete="off"
                spellCheck={false}
                aria-label="GitHub repository URL"
                aria-describedby={error ? 'repo-error' : parsedRepo ? 'repo-parsed' : undefined}
              />

              {/* Parsed repo badge */}
              {parsedRepo && !isLoading && (
                <div
                  id="repo-parsed"
                  className="absolute right-3 hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-2xs flex-shrink-0 animate-fade-in bg-cobalt-50 border border-cobalt-200 text-cobalt-700"
                  aria-live="polite"
                >
                  <span className="opacity-60">{parsedRepo.owner}/</span>
                  <span className="font-semibold">{parsedRepo.repo}</span>
                </div>
              )}
            </div>

            {/* Divider (desktop) */}
            <div
              className="hidden sm:block w-px self-stretch my-2 bg-stone-200/80"
              aria-hidden="true"
            />

            {/* Submit CTA button with satisfying feedback */}
            <button
              type="submit"
              disabled={isEmpty || isLoading || disabled}
              className="btn-primary text-xs sm:text-sm px-6 py-3 rounded-xl flex-shrink-0 group"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Indexing pipeline…</span>
                </>
              ) : (
                <>
                  <span>Analyze Repository</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </button>

          </div>
        </form>
      </div>

      {/* ── Error Notification */}
      {error && (
        <div
          id="repo-error"
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl border animate-fade-up bg-rose-50/90 border-rose-200/90 text-rose-800 backdrop-blur-xs shadow-subtle"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider font-mono">Indexing Failed</p>
            <p className="text-xs leading-relaxed opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* ── Quick-try Example Repositories */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-2xs font-mono uppercase tracking-widest mr-1 text-ink-tertiary">
          Quick try:
        </span>
        {EXAMPLE_REPOS.map((item) => {
          const dotColor = LANGUAGE_DOT[item.language] || 'bg-stone-400';
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleQuickSelect(item.url)}
              disabled={isLoading || disabled}
              title={item.description}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed bg-white/70 backdrop-blur-xs border border-stone-200/80 text-ink-secondary hover:text-ink hover:bg-white hover:border-cobalt-300 hover:shadow-subtle hover:-translate-y-0.5 active:translate-y-0"
              aria-label={`Analyze ${item.name} (${item.language})`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Validation Guidance */}
      {!isValid && !isEmpty && (
        <p role="alert" className="text-center text-xs animate-fade-in text-ink-tertiary">
          Enter a valid repository path, e.g.{' '}
          <span className="font-mono text-cobalt-600 font-medium">github.com/owner/repository</span>
        </p>
      )}

    </div>
  );
};
