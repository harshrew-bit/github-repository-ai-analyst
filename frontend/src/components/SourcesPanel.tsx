import React from 'react';
import { FileCode } from 'lucide-react';
import { SourceItem } from '../types/api';
import { SourceCard } from './SourceCard';

interface SourcesPanelProps {
  sources: SourceItem[];
  repository?: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources, repository }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Count unique files
  const uniqueFiles = new Set(sources.map((s) => s.file_path)).size;

  return (
    <div className="bg-surface-100 border border-surface-border rounded-xl p-4 sm:p-5 shadow-xl shadow-black/20 space-y-3.5 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">
              Source Evidence ({sources.length} Chunks across {uniqueFiles} {uniqueFiles === 1 ? 'File' : 'Files'})
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked context passages retrieved from ChromaDB via vector similarity
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400 self-start sm:self-auto">
          <span className="px-2 py-0.5 rounded bg-surface-200 border border-surface-border">
            Top-k: {sources.length}
          </span>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-2 pt-1">
        {sources.map((source, idx) => (
          <SourceCard
            key={`${source.file_path}-${source.chunk_id}-${idx}`}
            source={source}
            rank={idx + 1}
            repository={repository}
          />
        ))}
      </div>
    </div>
  );
};
