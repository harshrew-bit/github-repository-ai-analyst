import React, { useState } from 'react';
import {
  FileCode,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { SourceItem } from '../types/api';

interface SourceCardProps {
  source: SourceItem;
  rank: number;
  repository?: string;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  rank,
  repository,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySnippet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!source.content) return;
    navigator.clipboard.writeText(source.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format cosine score to clean percentage
  const relevancePercent = Math.min(100, Math.max(0, source.score * 100)).toFixed(1);

  // Language pill color badge
  const getLanguageColor = (lang?: string) => {
    switch (lang?.toLowerCase()) {
      case 'python':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'typescript':
      case 'javascript':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'go':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'rust':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'markdown':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-300 bg-surface-200 border-surface-border';
    }
  };

  const lines = source.content ? source.content.split('\n') : [];

  return (
    <div className="bg-surface-100 border border-surface-border rounded-lg overflow-hidden transition-all hover:border-slate-600/80">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 cursor-pointer flex items-center justify-between select-none bg-surface-100 hover:bg-surface-200/50 transition-colors"
      >
        {/* Left: Rank, file path, chunk */}
        <div className="flex items-center space-x-3 min-w-0 pr-3">
          <span className="text-[11px] font-mono font-semibold text-slate-500 w-5 flex-shrink-0">
            #{rank}
          </span>
          <div className="p-1.5 rounded-md bg-surface-50 border border-surface-border text-brand-400 flex-shrink-0">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-medium text-white truncate block hover:text-brand-300">
                {source.file_path}
              </span>
              {repository && (
                <a
                  href={`https://github.com/${repository}/blob/HEAD/${source.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-white transition-colors"
                  title="View file on GitHub"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-0.5">
              <span>Chunk #{source.chunk_id}</span>
              {source.language && (
                <>
                  <span>&bull;</span>
                  <span
                    className={`px-1.5 py-0.2 rounded border font-mono uppercase text-[9px] ${getLanguageColor(
                      source.language
                    )}`}
                  >
                    {source.language}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Relevance score & expand chevron */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 block">
              Cosine Match
            </span>
            <div className="flex items-center space-x-1.5 justify-end">
              <div className="w-12 h-1.5 bg-surface-50 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${relevancePercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                {relevancePercent}%
              </span>
            </div>
          </div>

          <div className="text-slate-400 p-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-brand-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Code Snippet Viewer */}
      {isExpanded && source.content && (
        <div className="border-t border-surface-border bg-surface-50 p-3 space-y-2 animate-fade-in font-mono text-xs">
          {/* Action row */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono text-slate-400">
              Lines: {lines.length} &bull; Exact Context Chunk
            </span>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-surface-100 hover:bg-surface-200 border border-surface-border text-slate-300 hover:text-white transition-colors"
              title="Copy snippet"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px]">Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Code Container with Line Numbers */}
          <div className="rounded-md border border-surface-border bg-background p-3 overflow-x-auto max-h-72">
            <table className="w-full text-left border-collapse text-[11px] leading-relaxed">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="pr-3 select-none text-right font-mono text-slate-600 text-[10px] w-8 align-top">
                      {idx + 1}
                    </td>
                    <td className="text-slate-200 font-mono whitespace-pre font-normal align-top">
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
