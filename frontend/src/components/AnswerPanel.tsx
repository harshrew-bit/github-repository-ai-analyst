import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ShieldCheck, Terminal } from 'lucide-react';

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

// ─── Technical Code Surface with Copy ─────────────────────────────────────────
const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className ?? '');
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
        className="px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-cobalt-700 font-mono text-xs"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-charcoal-750 bg-charcoal-900 shadow-lg">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-charcoal-850 border-b border-charcoal-750">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-stone-400" />
          <span className="text-3xs font-mono uppercase tracking-widest text-stone-300">
            {language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-3xs font-mono text-stone-400 hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-charcoal-750"
          aria-label={copied ? 'Code snippet copied' : 'Copy code snippet'}
        >
          {copied ? (
            <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
          ) : (
            <><Copy className="w-3 h-3" /><span>Copy</span></>
          )}
        </button>
      </div>

      {/* Editor Content Area */}
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-stone-200" style={{ tabSize: 2 }}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

// ─── Main Editorial Answer Canvas ─────────────────────────────────────────────
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
    <article
      className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-lifted animate-fade-up"
      aria-label="Codebase analysis answer"
    >

      {/* ── Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono uppercase tracking-widest text-cobalt-600 font-semibold">
              Synthesized Analysis
            </span>
            <span className="text-3xs text-ink-tertiary">·</span>
            <span className="text-3xs font-mono text-ink-tertiary">
              Gemini 2 RAG
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-ink leading-snug">
            &ldquo;{question}&rdquo;
          </h2>
        </div>

        {/* Copy full answer action */}
        <button
          type="button"
          onClick={handleCopyAnswer}
          className="btn-ghost text-xs self-start sm:self-auto border border-stone-200 bg-stone-50/50 hover:bg-stone-100 flex-shrink-0"
          aria-label={copiedAnswer ? 'Answer copied to clipboard' : 'Copy answer as Markdown'}
        >
          {copiedAnswer ? (
            <><Check className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-700">Copied</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /><span>Copy Analysis</span></>
          )}
        </button>
      </div>

      {/* ── Rich Markdown Body */}
      <div className="answer-prose text-ink-secondary">
        <ReactMarkdown
          components={{
            code: CodeBlock as React.ComponentType<{inline?: boolean; className?: string; children?: React.ReactNode}>
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>

      {/* ── Grounding & Trust Guarantee Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-stone-200 text-xs">
        <div className="flex items-center gap-2 text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span>
            Synthesized strictly from <strong className="font-semibold">{sourcesCount}</strong> verified AST chunk{sourcesCount !== 1 ? 's' : ''} in <span className="font-mono text-2xs">{repository}</span>
          </span>
        </div>

        <span className="text-3xs font-mono text-ink-tertiary">
          Zero Hallucination Attribution
        </span>
      </div>

    </article>
  );
};
