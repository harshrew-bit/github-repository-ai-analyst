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
    <section aria-label="Source evidence" className="space-y-3 animate-fade-up">

      {/* ── Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
            <FileCode className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink">Source Evidence</h4>
            <p className="text-2xs text-ink-tertiary">
              {sources.length} chunk{sources.length !== 1 ? 's' : ''} across{' '}
              {uniqueFiles} file{uniqueFiles !== 1 ? 's' : ''} · ranked by cosine similarity
            </p>
          </div>
        </div>

        <span className="chip text-2xs">
          Top-{sources.length}
        </span>
      </div>

      {/* ── Source cards */}
      <div className="space-y-2">
        {sources.map((source, idx) => (
          <SourceCard
            key={`${source.file_path}-${source.chunk_id}-${idx}`}
            source={source}
            rank={idx + 1}
            repository={repository}
          />
        ))}
      </div>

      {/* ── Footer note */}
      <p className="text-2xs text-ink-tertiary text-center pt-1">
        Scores are cosine similarities between your query embedding and each retrieved chunk.
        They indicate retrieval relevance, not answer confidence.
      </p>

    </section>
  );
};
