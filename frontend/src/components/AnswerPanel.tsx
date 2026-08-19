import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Copy, Check, Sparkles } from 'lucide-react';

interface AnswerPanelProps {
  answer: string;
  question: string;
  repository: string;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  answer,
  question,
  repository,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-[#f0f6fc]">
                Grounded AI Answer
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                Gemini 3.5 Flash
              </span>
            </div>
            <p className="text-xs text-[#8b949e] line-clamp-1 mt-0.5">
              Q: &ldquo;{question}&rdquo;
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] px-2.5 py-1.5 rounded-md flex items-center space-x-1.5 transition-colors"
          title="Copy answer to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#3fb950]" />
              <span className="text-[#3fb950]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Markdown Answer Render */}
      <div className="prose prose-invert max-w-none text-sm text-[#f0f6fc] leading-relaxed space-y-3 prose-p:leading-relaxed prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[#30363d] prose-pre:rounded-lg prose-code:text-[#58a6ff] prose-code:bg-[#0d1117] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-headings:text-[#f0f6fc] prose-headings:font-semibold prose-a:text-[#58a6ff] prose-strong:text-[#f0f6fc] prose-ul:list-disc prose-ol:list-decimal">
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>

      <div className="pt-2 border-t border-[#30363d]/60 flex items-center justify-between text-[11px] text-[#8b949e]">
        <span className="flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-[#58a6ff]" />
          Answer strictly constrained to {repository} context
        </span>
      </div>
    </div>
  );
};
