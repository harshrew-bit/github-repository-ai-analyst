import React from 'react';
import { Github, Loader2, Circle } from 'lucide-react';

interface HeaderProps {
  backendConnected: boolean | null;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ backendConnected, onLogoClick }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-canvas/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/30 rounded-lg"
          aria-label="Return to home"
        >
          {/* Logomark — two overlapping diamonds */}
          <svg
            width="28" height="28" viewBox="0 0 28 28" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="10" height="10" rx="2"
              fill="#1570EF" opacity="1" transform="rotate(0 4 4)" />
            <rect x="10" y="10" width="10" height="10" rx="2"
              fill="#1570EF" opacity="0.35" transform="rotate(0 10 10)" />
            <rect x="16" y="4" width="8" height="8" rx="1.5"
              fill="#1570EF" opacity="0.65" transform="rotate(0 16 4)" />
          </svg>

          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-ink tracking-tight">
              Analyst
            </span>
            <span className="text-2xs text-ink-tertiary font-mono tracking-wide">
              GitHub · RAG · Gemini
            </span>
          </div>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* API status */}
          <div
            role="status"
            aria-live="polite"
            title={
              backendConnected === true
                ? 'Analysis API is online and healthy'
                : backendConnected === false
                ? 'Analysis API is unreachable'
                : 'Checking API connection…'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              backendConnected === true
                ? 'bg-success-light text-success-text border-success/20'
                : backendConnected === false
                ? 'bg-error-light text-error-text border-error/20'
                : 'bg-warning-light text-warning-text border-warning/20'
            }`}
          >
            {backendConnected === true ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
                <span>API Online</span>
              </>
            ) : backendConnected === false ? (
              <>
                <Circle className="w-1.5 h-1.5 fill-error text-error" />
                <span>API Offline</span>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Connecting</span>
              </>
            )}
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/harshrew-bit/github-repository-ai-analyst"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost px-3 py-1.5 text-xs"
            aria-label="View source on GitHub"
          >
            <Github className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </div>
    </header>
  );
};
