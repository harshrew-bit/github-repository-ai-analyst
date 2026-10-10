import React, { useState } from 'react';
import {
  FileCode, ChevronDown, ChevronRight, Copy, Check, ExternalLink,
} from 'lucide-react';
import { SourceItem } from '../types/api';

interface SourceCardProps {
  source: SourceItem;
  rank: number;
  repository?: string;
}

const LANGUAGE_CHIP: Record<string, string> = {
  python:     'bg-sky-50     text-sky-700     border-sky-200',
  typescript: 'bg-amber-50   text-amber-700   border-amber-200',
  javascript: 'bg-yellow-50  text-yellow-700  border-yellow-200',
  go:         'bg-cyan-50    text-cyan-700    border-cyan-200',
  rust:       'bg-orange-50  text-orange-700  border-orange-200',
  markdown:   'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function getLanguageChip(lang?: string): string {
  return LANGUAGE_CHIP[lang?.toLowerCase() ?? ''] ?? 'bg-stone-50 text-stone-600 border-stone-200';
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

  // Cosine score as percent
  const scorePercent = Math.min(100, Math.max(0, source.score * 100));
  const scoreDisplay = scorePercent.toFixed(1);

  // Score color band
  const scoreColor =
    scorePercent >= 80 ? 'text-success'
    : scorePercent >= 60 ? 'text-warning'
    : 'text-ink-tertiary';

  const lines = source.content?.split('\n') ?? [];
  const fileUrl = repository
    ? `https://github.com/${repository}/blob/HEAD/${source.file_path}`
    : undefined;

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-150 hover:border-cobalt-200 hover:shadow-subtle">

      {/* ── Header row (always visible) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/30 focus-visible:rounded-t-xl"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} source: ${source.file_path}`}
      >
        {/* Left: rank + file */}
        <div className="flex items-center gap-3 min-w-0 pr-4">

          {/* Rank */}
          <span
            className="text-2xs font-mono font-bold text-cobalt-400 w-5 flex-shrink-0 text-center"
            aria-hidden="true"
          >
            #{rank}
          </span>

          {/* File icon */}
          <div className="w-7 h-7 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center flex-shrink-0">
            <FileCode className="w-3.5 h-3.5 text-ink-tertiary" aria-hidden="true" />
          </div>

          {/* Path + metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium text-ink truncate block max-w-[16rem] sm:max-w-none">
                {source.file_path}
              </span>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-ink-tertiary hover:text-cobalt-500 transition-colors flex-shrink-0"
                  aria-label={`Open ${source.file_path} on GitHub`}
                >
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-2xs font-mono text-ink-tertiary">
                Chunk #{source.chunk_id}
              </span>
              {source.language && (
                <span
                  className={`text-2xs font-mono px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${getLanguageChip(source.language)}`}
                >
                  {source.language}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: score + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <span className="meta-label block">Cosine</span>
            <div className="flex items-center gap-2 justify-end mt-0.5">
              {/* Score bar */}
              <div className="w-14 h-1.5 bg-stone-100 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-all ${
                    scorePercent >= 80 ? 'bg-success' : scorePercent >= 60 ? 'bg-warning' : 'bg-stone-400'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-semibold ${scoreColor}`}>
                {scoreDisplay}%
              </span>
            </div>
          </div>

          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-cobalt-400" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4 text-ink-tertiary" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* ── Expanded code snippet */}
      {isExpanded && source.content && (
        <div className="border-t border-stone-200 animate-fade-in">

          {/* Snippet toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-stone-50 border-b border-stone-200">
            <span className="text-2xs font-mono text-ink-tertiary">
              {lines.length} lines · Exact source chunk
            </span>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="flex items-center gap-1.5 text-2xs text-ink-tertiary hover:text-ink transition-colors px-2 py-1 rounded-md hover:bg-stone-100"
              aria-label={copied ? 'Snippet copied' : 'Copy snippet'}
            >
              {copied ? (
                <><Check className="w-3 h-3 text-success" /><span className="text-success">Copied</span></>
              ) : (
                <><Copy className="w-3 h-3" /><span>Copy</span></>
              )}
            </button>
          </div>

          {/* Code viewer (dark) */}
          <div className="bg-charcoal-900 overflow-x-auto max-h-80">
            <table className="min-w-full text-left border-collapse" role="presentation">
              <tbody>
                {lines.map((line, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-charcoal-800/50 transition-colors"
                  >
                    <td
                      className="code-line-num select-none py-px align-top text-2xs font-mono sticky left-0 bg-charcoal-900 pr-3"
                      aria-hidden="true"
                    >
                      {idx + 1}
                    </td>
                    <td className="code-content py-px align-top pr-4 text-xs font-mono whitespace-pre leading-5">
                      {line || '\u00A0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile score */}
          <div className="flex sm:hidden items-center justify-between px-4 py-2.5 bg-stone-50 border-t border-stone-200">
            <span className="meta-label">Cosine Similarity</span>
            <span className={`text-xs font-mono font-semibold ${scoreColor}`}>
              {scoreDisplay}%
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
