import React from 'react';
import { Sparkles, Github, Terminal, Loader2 } from 'lucide-react';

interface HeaderProps {
  backendConnected: boolean | null;
  onOpenRepoLink?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ backendConnected }) => {
  return (
    <header className="border-b border-surface-border bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-surface-200 border border-surface-border flex items-center justify-center text-brand-400 shadow-sm shadow-brand-500/10">
            <Terminal className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold tracking-tight text-white">
              GitHub Repository AI Analyst
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sparkles className="w-3 h-3 mr-1" />
              RAG &bull; Gemini
            </span>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-3">
          {/* Production API Status Indicator */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-surface-100 transition-colors"
            style={{
              borderColor:
                backendConnected === true
                  ? 'rgba(16, 185, 129, 0.25)'
                  : backendConnected === false
                  ? 'rgba(244, 63, 94, 0.25)'
                  : 'rgba(245, 158, 11, 0.25)',
            }}
            title={
              backendConnected === true
                ? 'Backend service is online and healthy'
                : backendConnected === false
                ? 'Backend service is unreachable'
                : 'Checking backend connection...'
            }
          >
            {backendConnected === true ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">API Online</span>
              </>
            ) : backendConnected === false ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-mono text-[11px]">API Offline</span>
              </>
            ) : (
              <>
                <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                <span className="text-amber-400 font-mono text-[11px]">Connecting</span>
              </>
            )}
          </div>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/harshrew-bit/github-repository-ai-analyst"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-md text-slate-400 hover:text-white bg-surface-100 hover:bg-surface-200 border border-surface-border transition-colors flex items-center space-x-1 text-xs"
            title="View project source on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono text-[11px]">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
