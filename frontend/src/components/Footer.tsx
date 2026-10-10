import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 bg-canvas py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            {/* Logomark */}
            <svg
              width="20" height="20" viewBox="0 0 28 28" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="10" height="10" rx="2" fill="#1570EF" opacity="1" />
              <rect x="10" y="10" width="10" height="10" rx="2" fill="#1570EF" opacity="0.35" />
              <rect x="16" y="4" width="8" height="8" rx="1.5" fill="#1570EF" opacity="0.65" />
            </svg>
            <span className="text-sm font-semibold text-ink-secondary">
              GitHub Repository AI Analyst
            </span>
          </div>

          {/* Tech stack */}
          <div className="flex items-center gap-4 text-xs text-ink-tertiary font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" aria-hidden="true" />
              ChromaDB
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 flex-shrink-0" aria-hidden="true" />
              Google Gemini
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
              FastAPI
            </span>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/harshrew-bit/github-repository-ai-analyst"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-ink-tertiary hover:text-ink transition-colors"
            aria-label="View project source on GitHub"
          >
            <Github className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open source</span>
          </a>

        </div>

        <div className="section-separator mt-6 mb-4" />

        <p className="text-center text-2xs text-ink-tertiary">
          Answers are strictly grounded in retrieved source code. No fabricated citations or hallucinated code paths.
        </p>

      </div>
    </footer>
  );
};
