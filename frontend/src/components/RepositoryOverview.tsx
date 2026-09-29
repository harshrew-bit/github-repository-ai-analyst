import React from 'react';
import { ExternalLink, Layers, Database, Sparkles, CheckCircle2, RotateCcw, GitBranch } from 'lucide-react';
import { IndexResponse } from '../types/api';

interface RepositoryOverviewProps {
  data: IndexResponse;
  onReset: () => void;
}

export const RepositoryOverview: React.FC<RepositoryOverviewProps> = ({ data, onReset }) => {
  const isCached = data.message?.toLowerCase().includes('already indexed') || data.message?.toLowerCase().includes('restored');

  return (
    <div className="bg-surface-100 border border-surface-border rounded-xl p-4 sm:p-5 shadow-lg shadow-black/20 animate-fade-in space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        {/* Repo title & link */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-surface-200 border border-surface-border flex items-center justify-center text-brand-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white tracking-tight font-mono">
                {data.repository}
              </h2>
              <a
                href={`https://github.com/${data.repository}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-brand-400 transition-colors"
                title="View on GitHub"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active vector index target &bull; Ready for grounded querying
            </p>
          </div>
        </div>

        {/* Status badges & reset action */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCached ? 'Index Active (Cached)' : 'Indexed & Ready'}</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-surface-200 hover:bg-surface-300 border border-surface-border px-2.5 py-1 rounded-md transition-colors"
            title="Switch to analyze another repository"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Change</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Chunks */}
        <div className="bg-surface-50 p-3 rounded-lg border border-surface-border space-y-1">
          <span className="text-slate-400 flex items-center font-mono text-[11px]">
            <Layers className="w-3 h-3 mr-1 text-sky-400" />
            Indexed Chunks
          </span>
          <p className="text-base font-semibold text-white font-mono">
            {data.chunks.toLocaleString()}
          </p>
        </div>

        {/* Collection */}
        <div className="bg-surface-50 p-3 rounded-lg border border-surface-border space-y-1 sm:col-span-2">
          <span className="text-slate-400 flex items-center font-mono text-[11px]">
            <Database className="w-3 h-3 mr-1 text-amber-400" />
            ChromaDB Collection
          </span>
          <p className="text-xs font-mono text-slate-200 truncate" title={data.collection}>
            {data.collection}
          </p>
        </div>

        {/* Space Metric */}
        <div className="bg-surface-50 p-3 rounded-lg border border-surface-border space-y-1">
          <span className="text-slate-400 flex items-center font-mono text-[11px]">
            <Sparkles className="w-3 h-3 mr-1 text-brand-400" />
            Vector Metric
          </span>
          <p className="text-xs font-mono text-slate-200">
            Cosine (HNSW)
          </p>
        </div>
      </div>
    </div>
  );
};
