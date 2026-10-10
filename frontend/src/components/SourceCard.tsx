import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, Copy, Check, ExternalLink,
} from 'lucide-react';
import { SourceItem } from '../types/api';

interface SourceCardProps {
  source: SourceItem;
  rank: number;
  repository?: string;
}

const LANGUAGE_BADGE: Record<string, string> = {
  python:     'bg-sky-50 text-sky-800 border-sky-200',
  typescript: 'bg-amber-50 text-amber-800 border-amber-200',
  javascript: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  go:         'bg-cyan-50 text-cyan-800 border-cyan-200',
  rust:       'bg-orange-50 text-orange-800 border-orange-200',
  markdown:   'bg-emerald-50 text-emerald-800 border-emerald-200',
};

function getLanguageBadge(lang?: string): string {
  return LANGUAGE_BADGE[lang?.toLowerCase() ?? ''] ?? 'bg-stone-100 text-stone-700 border-stone-200';
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, rank, repository }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySnippet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!source.content) return;
    navigator.clipboard.writeText(source.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cosine score calculation
  const scorePercent = Math.min(100, Math.max(0, source.score * 100));
  const scoreDisplay = scorePercent.toFixed(1);
  const rawScore = source.score.toFixed(4);

  const scoreColor =
    scorePercent >= 80 ? 'text-emerald-700'
    : scorePercent >= 60 ? 'text-amber-700'
    : 'text-stone-600';

  const barColor =
    scorePercent >= 80 ? 'bg-emerald-500'
    : scorePercent >= 60 ? 'bg-amber-500'
    : 'bg-stone-400';

  const lines = source.content?.split('\n') ?? [];
  const fileUrl = repository
    ? `https://github.com/${repository}/blob/HEAD/${source.file_path}`
    : undefined;

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-150 hover:border-cobalt-300 shadow-subtle">

      {/* ── Technical Header Row */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/30"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} source: ${source.file_path}`}
      >
        {/* Left: Rank, File, Metadata */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-4">

          {/* Sequential Rank */}
          <span
            className="text-2xs font-mono font-bold text-cobalt-600 bg-cobalt-50 border border-cobalt-200/80 rounded-md px-1.5 py-0.5 flex-shrink-0"
            aria-hidden="true"
          >
            #{rank.toString().padStart(2, '0')}
          </span>

          {/* Path & Metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-mono font-medium text-ink truncate block max-w-[15rem] sm:max-w-none">
                {source.file_path}
              </span>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-ink-tertiary hover:text-cobalt-600 transition-colors flex-shrink-0"
                  aria-label={`Open ${source.file_path} on GitHub`}
                >
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-3xs font-mono text-ink-tertiary">
                Chunk ID: #{source.chunk_id}
              </span>
              {source.language && (
                <span
                  className={`text-3xs font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider ${getLanguageBadge(source.language)}`}
                >
                  {source.language}
                </span>
              )}
              <span className="text-3xs font-mono text-ink-tertiary hidden sm:inline">
                {lines.length} lines
              </span>
            </div>
          </div>
        </div>

        {/* Right: Technical Cosine Metric & Toggle */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block font-mono">
            <span className="text-3xs uppercase tracking-wider text-ink-tertiary block">
              Cosine Similarity
            </span>
            <div className="flex items-center gap-2 justify-end mt-0.5">
              <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${scoreColor}`}>
                {scoreDisplay}%
              </span>
            </div>
          </div>

          <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-ink-tertiary">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-cobalt-600" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </div>
        </div>
      </button>

      {/* ── Expanded Code Editor Surface (Dark Charcoal) */}
      {isExpanded && source.content && (
        <div className="border-t border-stone-200 animate-fade-in">

          {/* Subheader Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-charcoal-850 border-b border-charcoal-750 text-stone-400">
            <span className="text-3xs font-mono">
              Cosine Score: {rawScore} · Exact Source Code Chunk
            </span>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="flex items-center gap-1.5 text-3xs font-mono text-stone-300 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-charcoal-700"
              aria-label={copied ? 'Code snippet copied' : 'Copy chunk snippet'}
            >
              {copied ? (
                <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
              ) : (
                <><Copy className="w-3 h-3" /><span>Copy Snippet</span></>
              )}
            </button>
          </div>

          {/* Dark Charcoal Code Inspector */}
          <div className="bg-charcoal-900 overflow-x-auto max-h-96">
            <table className="min-w-full text-left border-collapse" role="presentation">
              <tbody>
                {lines.map((line, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-charcoal-800/60 transition-colors"
                  >
                    <td
                      className="code-line-num select-none py-0.5 align-top text-3xs font-mono sticky left-0 bg-charcoal-900"
                      aria-hidden="true"
                    >
                      {idx + 1}
                    </td>
                    <td className="code-content py-0.5 align-top pr-4 text-xs font-mono whitespace-pre leading-5">
                      {line || '\u00A0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cosine Metric Display */}
          <div className="flex sm:hidden items-center justify-between px-4 py-2.5 bg-stone-50 border-t border-stone-200 font-mono">
            <span className="text-3xs uppercase tracking-wider text-ink-tertiary">Cosine Match</span>
            <span className={`text-xs font-semibold ${scoreColor}`}>
              {scoreDisplay}% ({rawScore})
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
