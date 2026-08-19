import React, { useState } from 'react';
import {
  FileCode,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Percent,
} from 'lucide-react';
import { SourceItem } from '../types/api';

interface SourcesPanelProps {
  sources: SourceItem[];
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleCopySnippet = (content: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#d29922]">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0f6fc]">
              Retrieved Repository Sources ({sources.length})
            </h3>
            <p className="text-xs text-[#8b949e]">
              Context chunks ranked by cosine similarity
            </p>
          </div>
        </div>
        <span className="text-[11px] text-[#8b949e] font-mono">
          Top-k: {sources.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {sources.map((source, idx) => {
          const isExpanded = expandedIndex === idx;
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={idx}
              className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden transition-colors hover:border-[#58a6ff]/40"
            >
              <div
                onClick={() => toggleExpand(idx)}
                className="p-3 cursor-pointer flex items-center justify-between select-none"
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <span className="text-xs font-mono text-[#8b949e] font-semibold">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-mono font-medium text-[#58a6ff] hover:underline truncate block">
                      {source.file_path}
                    </span>
                    <div className="flex items-center space-x-2 text-[11px] text-[#8b949e] mt-0.5">
                      <span>Chunk {source.chunk_id}</span>
                      {source.language && (
                        <>
                          <span>•</span>
                          <span className="uppercase text-[10px] bg-[#21262d] px-1.5 py-0.2 rounded border border-[#30363d] text-[#f0f6fc]">
                            {source.language}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-[#8b949e] block">
                      Similarity Score
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#3fb950] flex items-center justify-end">
                      <Percent className="w-3 h-3 mr-0.5 opacity-70" />
                      {source.score.toFixed(4)}
                    </span>
                  </div>

                  <div className="text-[#8b949e] p-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && source.content && (
                <div className="border-t border-[#30363d] bg-[#161b22]/90 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8b949e]">
                    <span className="font-mono text-[11px]">
                      Retrieved Chunk Context:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopySnippet(source.content || '', idx, e)}
                      className="text-[11px] text-[#8b949e] hover:text-[#f0f6fc] bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] px-2 py-1 rounded flex items-center space-x-1 transition-colors"
                      title="Copy chunk content"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-[#3fb950]" />
                          <span className="text-[#3fb950]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-[#f0f6fc]/90 bg-[#0d1117] p-3 rounded-lg border border-[#30363d] overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                    <code>{source.content}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
