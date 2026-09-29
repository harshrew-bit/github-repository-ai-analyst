import React from 'react';
import { Terminal, Database, Sparkles, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-surface-border py-6 mt-auto bg-surface-50/50 text-xs text-slate-500 font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-slate-400 font-sans">
            GitHub Repository AI Analyst
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-[11px] text-slate-500">
            Production Architecture
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <span className="flex items-center">
            <Database className="w-3 h-3 mr-1 text-amber-500/70" />
            ChromaDB
          </span>
          <span>&bull;</span>
          <span className="flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-brand-400/70" />
            Google Gemini
          </span>
          <span>&bull;</span>
          <span className="flex items-center">
            <Cpu className="w-3 h-3 mr-1 text-emerald-500/70" />
            FastAPI RAG
          </span>
        </div>
      </div>
    </footer>
  );
};
