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
}) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/60 border-b border-stone-200/70 text-ink shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* ── Brand Identity */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/40 rounded-lg py-1 px-1 -ml-1 text-left transition-all"
          aria-label="Return to landing page"
        >
          {/* Geometric logomark — intersecting architectural planes */}
          <div className="relative w-7 h-7 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
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
                fill="#D8D6D0"
                opacity="0.85" />
              {/* Focal vector node */}
              <circle cx="10" cy="10" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-ink group-hover:text-cobalt-600 transition-colors">
              GitHub AI Analyst
            </span>
            <span className="text-3xs font-mono tracking-wider uppercase mt-0.5 text-ink-tertiary">
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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-colors border backdrop-blur-xs ${
              backendConnected === true
                ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90'
                : backendConnected === false
                ? 'bg-rose-50/90 text-rose-800 border-rose-200/90'
                : 'bg-amber-50/90 text-amber-800 border-amber-200/90'
            }`}
          >
            {backendConnected === true ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="hidden sm:inline font-medium">Engine Live</span>
              </>
            ) : backendConnected === false ? (
              <>
                <Circle className="w-1.5 h-1.5 fill-rose-500 text-rose-500" />
                <span className="hidden sm:inline font-medium">Engine Offline</span>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                <span className="hidden sm:inline font-medium">Connecting</span>
              </>
            )}
          </div>

          {/* GitHub source link */}
          <a
            href="https://github.com/harshrew-bit/github-repository-ai-analyst"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 text-ink-secondary hover:text-ink hover:bg-white/90 border border-stone-200/80 bg-white/50 backdrop-blur-xs hover:shadow-subtle hover:-translate-y-0.5 active:translate-y-0"
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
