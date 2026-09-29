import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Copy, Check, ShieldCheck, Terminal } from 'lucide-react';

interface AnswerPanelProps {
  answer: string;
  question: string;
  repository: string;
  sourcesCount: number;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-surface-200 border border-surface-border text-brand-300 font-mono text-[12px]"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="my-3 rounded-lg border border-surface-border bg-surface-50 overflow-hidden font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-100 border-b border-surface-border text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span className="font-mono text-slate-300 uppercase">{language || 'code'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  answer,
  question,
  repository,
  sourcesCount,
}) => {
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  return (
    <div className="bg-surface-100 border border-surface-border rounded-xl p-5 sm:p-6 shadow-xl shadow-black/20 space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Grounded Codebase Analysis
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-300 border border-surface-border">
                Gemini &bull; Chroma RAG
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              Query: &ldquo;<span className="text-slate-300">{question}</span>&rdquo;
            </p>
          </div>
        </div>

        {/* Copy Answer Action */}
        <button
          type="button"
          onClick={handleCopyAnswer}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs bg-surface-200 hover:bg-surface-300 border border-surface-border text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
          title="Copy markdown answer"
        >
          {copiedAnswer ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-[11px]">Copied Answer</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px]">Copy Markdown</span>
            </>
          )}
        </button>
      </div>

      {/* Markdown Body */}
      <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed space-y-3 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-semibold prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-5 prose-ol:pl-5 prose-li:my-1 prose-table:w-full prose-table:border-collapse prose-th:border-b prose-th:border-surface-border prose-th:p-2 prose-th:text-left prose-td:border-b prose-td:border-surface-border/50 prose-td:p-2">
        <ReactMarkdown
          components={{
            code: CodeBlock as any,
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>

      {/* Grounding Footer Guarantee */}
      <div className="pt-3 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px]">
            Strictly synthesized from {sourcesCount} verified repository chunks
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Target: {repository}
        </span>
      </div>
    </div>
  );
};
