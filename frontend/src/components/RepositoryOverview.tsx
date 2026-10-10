import React from 'react';
import {
  ExternalLink, CheckCircle2, RotateCcw, GitBranch
} from 'lucide-react';
import { IndexResponse } from '../types/api';

interface RepositoryOverviewProps {
  data: IndexResponse;
  onReset: () => void;
}

export const RepositoryOverview: React.FC<RepositoryOverviewProps> = ({ data, onReset }) => {
  const isCached =
    data.message?.toLowerCase().includes('already indexed') ||
    data.message?.toLowerCase().includes('restored');

  const parts = data.repository.split('/');
  const owner = parts[0] ?? '';
  const repo  = parts[1] ?? data.repository;

  return (
    <div className="w-full space-y-6 animate-fade-up">

      {/* ── Editorial Masthead: Identity & Action (No Card!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-300">

        {/* Identity & Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-cobalt-50 border border-cobalt-200 flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-4 h-4 text-cobalt-600" aria-hidden="true" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span className="text-ink-tertiary font-normal">{owner} /</span>
              <span>{repo}</span>
            </h1>

            <a
              href={`https://github.com/${data.repository}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-ink-tertiary hover:text-cobalt-600 transition-colors py-1 px-2 rounded-md hover:bg-stone-200/50"
              aria-label={`Open ${data.repository} on GitHub`}
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
            {/* Status indicator */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                isCached
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              {isCached ? 'Index Active · Checkpoint Cache' : 'Index Active · Ready for Queries'}
            </span>

            <span className="text-2xs font-mono text-ink-tertiary">
              Model: Gemini Embedding 2
            </span>
          </div>
        </div>

        {/* Switch repository button */}
        <button
          type="button"
          onClick={onReset}
          className="btn-ghost text-xs self-start sm:self-auto border border-stone-200/90 bg-white/80 backdrop-blur-xs shadow-subtle hover:bg-white hover:shadow-lifted hover:-translate-y-0.5 active:translate-y-0 transition-all"
          aria-label="Analyze a different repository"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Switch repository</span>
        </button>
      </div>

      {/* ── Technical Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 px-5 rounded-2xl bg-white/75 backdrop-blur-md border border-stone-200/80 shadow-glass font-mono text-xs">

        {/* Chunks */}
        <div className="space-y-0.5">
          <span className="text-3xs uppercase tracking-wider text-ink-tertiary block">
            AST Chunks
          </span>
          <p className="text-base font-semibold text-ink">
            {data.chunks.toLocaleString()}
          </p>
        </div>

        {/* Embedding Dimensions */}
        <div className="space-y-0.5">
          <span className="text-3xs uppercase tracking-wider text-ink-tertiary block">
            Vector Dimension
          </span>
          <p className="text-base font-semibold text-cobalt-600">
            3,072 float32
          </p>
        </div>

        {/* Vector Metric */}
        <div className="space-y-0.5">
          <span className="text-3xs uppercase tracking-wider text-ink-tertiary block">
            Index Metric
          </span>
          <p className="text-base font-semibold text-ink">
            Cosine · HNSW
          </p>
        </div>

        {/* ChromaDB Collection */}
        <div className="space-y-0.5">
          <span className="text-3xs uppercase tracking-wider text-ink-tertiary block">
            Chroma Collection
          </span>
          <p className="text-xs font-semibold text-ink truncate" title={data.collection}>
            {data.collection}
          </p>
        </div>

      </div>

    </div>
  );
};
