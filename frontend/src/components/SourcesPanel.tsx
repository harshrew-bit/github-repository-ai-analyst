import React from 'react';
import { FileCode } from 'lucide-react';
import { SourceItem } from '../types/api';
import { SourceCard } from './SourceCard';

interface SourcesPanelProps {
  sources: SourceItem[];
  repository?: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources, repository }) => {
  if (!sources || sources.length === 0) return null;

  const uniqueFiles = new Set(sources.map((s) => s.file_path)).size;

  return (
    <section aria-label="Source evidence" className="space-y-4 animate-fade-up pt-4">

      {/* ── Section Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
            <FileCode className="w-3.5 h-3.5 text-cobalt-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink uppercase font-mono tracking-wider">
              Source Evidence
            </h3>
            <p className="text-2xs text-ink-tertiary">
              {sources.length} chunk{sources.length !== 1 ? 's' : ''} retrieved across{' '}
              {uniqueFiles} source file{uniqueFiles !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-2xs font-mono text-ink-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Ranked by Cosine Similarity</span>
        </div>
      </div>

      {/* ── List of Source Cards */}
      <div className="space-y-2.5">
        {sources.map((source, idx) => (
          <SourceCard
            key={`${source.file_path}-${source.chunk_id}-${idx}`}
            source={source}
            rank={idx + 1}
            repository={repository}
          />
        ))}
      </div>

      {/* ── Technical Citation Guarantee */}
      <p className="text-3xs font-mono text-ink-tertiary text-center pt-2 leading-relaxed">
        Cosine similarity measures angular distance between the query vector and chunk embeddings in the 3,072D manifold. Higher scores indicate greater semantic proximity.
      </p>

    </section>
  );
};
