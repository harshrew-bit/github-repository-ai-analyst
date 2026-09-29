import React from 'react';
import { Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center pt-2 pb-6 max-w-2xl mx-auto space-y-3">
      {/* Capability pill badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-100 border border-surface-border text-xs text-slate-300 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span className="font-mono text-[11px] text-slate-300">
          Grounded Semantic Codebase Intelligence
        </span>
      </div>

      {/* Main headline */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
        Understand any codebase.
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
        Index any public GitHub repository into ChromaDB vector collections. Ask architectural, security, or implementation questions strictly grounded in actual source files.
      </p>
    </div>
  );
};
