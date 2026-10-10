import React from 'react';
import {
  ExternalLink, Layers, Database, CheckCircle2,
  RotateCcw, GitBranch, Hash,
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

  // Parse owner/repo for display
  const parts = data.repository.split('/');
  const owner = parts[0] ?? '';
  const repo  = parts[1] ?? data.repository;

  return (
    <div className="card-lifted p-4 sm:p-5 animate-fade-up space-y-4">

      {/* ── Top row: identity + actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

        {/* Repository identity */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cobalt-50 border border-cobalt-200 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-5 h-5 text-cobalt-500" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-ink">
                <span className="text-ink-tertiary font-normal">{owner} /</span>{' '}
                {repo}
              </h2>
              <a
                href={`https://github.com/${data.repository}`}
                target="_blank"
                rel="noreferrer"
                className="text-ink-tertiary hover:text-cobalt-500 transition-colors"
                aria-label={`Open ${data.repository} on GitHub`}
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                  isCached
                    ? 'bg-warning-light text-warning-text border-warning/20'
                    : 'bg-success-light text-success-text border-success/20'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                {isCached ? 'Restored from cache' : 'Indexed & ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Change repo button */}
        <button
          type="button"
          onClick={onReset}
          className="btn-ghost text-xs self-start sm:self-auto"
          aria-label="Analyze a different repository"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Change repository
        </button>
      </div>

      {/* ── Metrics row */}
      <div className="section-separator" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">

        {/* Chunks */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-cobalt-400" aria-hidden="true" />
            <span className="meta-label">Indexed Chunks</span>
          </div>
          <p className="text-xl font-semibold text-ink font-mono" aria-label={`${data.chunks.toLocaleString()} indexed chunks`}>
            {data.chunks.toLocaleString()}
          </p>
        </div>

        {/* Vector metric */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-cobalt-400" aria-hidden="true" />
            <span className="meta-label">Vector Metric</span>
          </div>
          <p className="text-sm font-mono text-ink-secondary">Cosine · HNSW</p>
        </div>

        {/* Collection */}
        <div className="col-span-2 sm:col-span-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-cobalt-400" aria-hidden="true" />
            <span className="meta-label">ChromaDB Collection</span>
          </div>
          <p
            className="text-xs font-mono text-ink-secondary truncate"
            title={data.collection}
          >
            {data.collection}
          </p>
        </div>

      </div>

      {/* ── Optional message */}
      {data.message && (
        <p className="text-xs text-ink-tertiary pt-1">{data.message}</p>
      )}

    </div>
  );
};
