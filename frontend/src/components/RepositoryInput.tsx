import React, { useState, useMemo } from 'react';
import { Github, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
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
    description: 'High-performance web framework',
    language: 'Python',
  },
  {
    name: 'pmndrs/zustand',
    url: 'https://github.com/pmndrs/zustand',
    description: 'Bear-minimum state management',
    language: 'TypeScript',
  },
  {
    name: 'pallets/flask',
    url: 'https://github.com/pallets/flask',
    description: 'WSGI micro-framework',
    language: 'Python',
  },
];

const LANGUAGE_COLORS: Record<string, string> = {
  Python:     'bg-sky-50     text-sky-700     border-sky-200',
  TypeScript: 'bg-amber-50   text-amber-700   border-amber-200',
  JavaScript: 'bg-yellow-50  text-yellow-700  border-yellow-200',
  Go:         'bg-cyan-50    text-cyan-700    border-cyan-200',
  Rust:       'bg-orange-50  text-orange-700  border-orange-200',
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

      {/* ── Input card */}
      <div className={`bg-white rounded-2xl border shadow-lifted transition-all duration-200 ${
        error
          ? 'border-error/40 ring-2 ring-error/10'
          : 'border-stone-200 focus-within:border-cobalt-400 focus-within:ring-2 focus-within:ring-cobalt-500/15'
      }`}>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0">

            {/* Input */}
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-4 text-ink-tertiary pointer-events-none" aria-hidden="true">
                <Github className="w-4 h-4" />
              </div>
              <input
                id="repository-url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                disabled={isLoading || disabled}
                className="w-full bg-transparent pl-10 pr-4 py-4 text-sm text-ink placeholder:text-ink-placeholder font-mono focus:outline-none transition-colors disabled:opacity-50 rounded-l-2xl"
                autoComplete="off"
                spellCheck={false}
                aria-label="GitHub repository URL"
                aria-describedby={error ? 'repo-error' : parsedRepo ? 'repo-parsed' : undefined}
              />

              {/* Parsed repo tag */}
              {parsedRepo && !isLoading && (
                <div
                  id="repo-parsed"
                  className="absolute right-3 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-cobalt-50 border border-cobalt-200 text-2xs font-mono text-cobalt-600 flex-shrink-0"
                  aria-live="polite"
                >
                  {parsedRepo.owner}/{parsedRepo.repo}
                </div>
              )}
            </div>

            {/* Divider (desktop) */}
            <div className="hidden sm:block w-px self-stretch bg-stone-200 my-3" aria-hidden="true" />

            {/* Submit button */}
            <div className="px-3 py-3 sm:py-0 sm:flex sm:items-center">
              <button
                type="submit"
                disabled={isEmpty || isLoading || disabled}
                className="w-full sm:w-auto btn-primary text-sm px-5 py-2.5 rounded-xl flex-shrink-0"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Indexing…</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Repository</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* ── Error */}
      {error && (
        <div
          id="repo-error"
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-error-light border border-error/20 animate-fade-up"
        >
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-error-text">Indexing failed</p>
            <p className="text-xs text-error-text/80 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* ── Example repos */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-2xs text-ink-tertiary font-mono uppercase tracking-widest mr-1">
          Try:
        </span>
        {EXAMPLE_REPOS.map((item) => {
          const langClass = LANGUAGE_COLORS[item.language] ?? 'bg-stone-50 text-stone-600 border-stone-200';
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleQuickSelect(item.url)}
              disabled={isLoading || disabled}
              title={`${item.description}`}
              className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 hover:border-cobalt-300 hover:bg-cobalt-50 text-xs text-ink-secondary hover:text-cobalt-700 font-mono transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-subtle"
              aria-label={`Analyze ${item.name} — ${item.description}`}
            >
              {item.name}
              <span className={`text-2xs px-1.5 py-0.5 rounded-full border font-sans font-medium ${langClass}`}>
                {item.language}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Hint */}
      {!isValid && !isEmpty && (
        <p role="alert" className="text-center text-xs text-ink-tertiary animate-fade-in">
          Enter a full GitHub URL, e.g.{' '}
          <span className="font-mono text-cobalt-600">github.com/owner/repo</span>
        </p>
      )}

    </div>
  );
};
