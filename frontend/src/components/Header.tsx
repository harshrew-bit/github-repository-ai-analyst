import React from 'react';
import { GitBranch, Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  backendConnected: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({ backendConnected }) => {
  return (
    <header className="border-b border-[#30363d] bg-[#161b22]/70 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-[#f0f6fc] tracking-tight">
                GitHub Repository AI Analyst
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                RAG + Gemini
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Grounded repository intelligence and semantic source retrieval
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className="flex items-center space-x-2 text-xs px-2.5 py-1 rounded-full border border-[#30363d] bg-[#0d1117]"
            title={
              backendConnected === true
                ? 'Backend online at http://localhost:8000'
                : backendConnected === false
                ? 'Backend offline - make sure FastAPI server is running'
                : 'Checking backend...'
            }
          >
            <Activity className="w-3.5 h-3.5 text-[#8b949e]" />
            <span className="text-[#8b949e]">API:</span>
            {backendConnected === true && (
              <span className="flex items-center text-[#3fb950] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] mr-1 animate-pulse"></span>
                Connected
              </span>
            )}
            {backendConnected === false && (
              <span className="flex items-center text-[#f85149] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f85149] mr-1"></span>
                Offline
              </span>
            )}
            {backendConnected === null && (
              <span className="text-[#8b949e]">Checking...</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
