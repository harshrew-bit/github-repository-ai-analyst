import React from 'react';
import { Github, Loader2, Circle, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  backendConnected: boolean | null;
  onLogoClick?: () => void;
  variant?: 'dark' | 'light';
}

export const Header: React.FC<HeaderProps> = ({
  backendConnected,
  onLogoClick,
  variant = 'dark',
}) => {
  const isDark = variant === 'dark';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 backdrop-blur-md border-b ${
        isDark
          ? 'bg-charcoal-950/85 border-charcoal-800/80 text-white'
          : 'bg-canvas/90 border-stone-200 text-ink'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* ── Brand */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400/40 rounded-lg py-1 px-1 -ml-1 text-left"
          aria-label="Return to landing page"
        >
          {/* Geometric logomark — intersecting architectural planes */}
          <div className="relative w-7 h-7 flex items-center justify-center flex-shrink-0">
            <svg
              width="26" height="26" viewBox="0 0 28 28" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Outer frame */}
              <rect x="3" y="3" width="14" height="14" rx="3"
                className="fill-cobalt-500 transition-opacity group-hover:opacity-90" />
              {/* Overlapping depth plane */}
              <rect x="11" y="11" width="14" height="14" rx="3"
                fill={isDark ? '#282826' : '#D8D6D0'}
                opacity={isDark ? '0.75' : '0.8'} />
              {/* Focal vector node */}
              <circle cx="10" cy="10" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className={`text-sm font-semibold tracking-tight transition-colors ${
              isDark ? 'text-white group-hover:text-cobalt-300' : 'text-ink group-hover:text-cobalt-600'
            }`}>
              GitHub AI Analyst
            </span>
            <span className={`text-3xs font-mono tracking-wider uppercase mt-0.5 ${
              isDark ? 'text-stone-400' : 'text-ink-tertiary'
            }`}>
              RAG · Gemini 2 · ChromaDB
            </span>
          </div>
        </button>

        {/* ── Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* API health status beacon */}
          <div
            role="status"
            aria-live="polite"
            title={
              backendConnected === true
                ? 'Backend API online and healthy'
                : backendConnected === false
                ? 'Backend API offline or unreachable'
                : 'Verifying backend API connection…'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-colors border ${
              isDark
                ? backendConnected === true
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : backendConnected === false
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                : backendConnected === true
                  ? 'bg-success-light text-success-text border-success/20'
                  : backendConnected === false
                  ? 'bg-error-light text-error-text border-error/20'
                  : 'bg-warning-light text-warning-text border-warning/20'
            }`}
          >
            {backendConnected === true ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span className="hidden sm:inline">Engine Live</span>
              </>
            ) : backendConnected === false ? (
              <>
                <Circle className="w-1.5 h-1.5 fill-rose-400 text-rose-400" />
                <span className="hidden sm:inline">Engine Offline</span>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                <span className="hidden sm:inline">Connecting</span>
              </>
            )}
          </div>

          {/* GitHub source link */}
          <a
            href="https://github.com/harshrew-bit/github-repository-ai-analyst"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark
                ? 'text-stone-300 hover:text-white hover:bg-charcoal-800 border border-charcoal-700/60'
                : 'text-ink-secondary hover:text-ink hover:bg-stone-100 border border-stone-200'
            }`}
            aria-label="View source repository on GitHub"
          >
            <Github className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Repository</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" aria-hidden="true" />
          </a>

        </div>
      </div>
    </header>
  );
};
