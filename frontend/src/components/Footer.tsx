import React from 'react';
import { Github, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-stone-200/70 bg-white/40 backdrop-blur-md py-10 mt-auto transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <svg
                width="22" height="22" viewBox="0 0 28 28" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="14" height="14" rx="3" fill="#1570EF" />
                <rect x="11" y="11" width="14" height="14" rx="3" fill="#BAB8B0" opacity="0.6" />
                <circle cx="10" cy="10" r="2" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-ink tracking-tight">
                GitHub Repository AI Analyst
              </span>
              <span className="text-3xs font-mono text-ink-tertiary">
                Deterministic Codebase Intelligence
              </span>
            </div>
          </div>

          {/* Engine Architecture Tags */}
          <div className="flex items-center gap-5 text-2xs text-ink-tertiary font-mono flex-wrap justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              ChromaDB HNSW
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500" aria-hidden="true" />
              Gemini Embedding 2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              FastAPI RAG
            </span>
          </div>

          {/* Source Link */}
          <a
            href="https://github.com/harshrew-bit/github-repository-ai-analyst"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-ink-tertiary hover:text-ink transition-all py-1 px-2.5 rounded-md hover:bg-white/80 hover:shadow-subtle hover:-translate-y-0.5 active:translate-y-0"
            aria-label="View source on GitHub"
          >
            <Github className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open Source</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" aria-hidden="true" />
          </a>

        </div>

        <div className="section-separator pt-2" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-3xs font-mono text-ink-tertiary text-center sm:text-left">
          <p>
            All answers are strictly synthesized from retrieved AST chunks. No fabricated citations.
          </p>
          <p>
            Deterministic · High-Density 3,072D Vector Space
          </p>
        </div>

      </div>
    </footer>
  );
};
