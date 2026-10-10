import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ShieldCheck, FileText } from 'lucide-react';

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

// ─── Code block with copy ─────────────────────────────────────────────────────
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
    <div className="my-3.5 rounded-xl overflow-hidden border border-charcoal-700 bg-charcoal-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-charcoal-800 border-b border-charcoal-700">
        <span className="text-2xs font-mono text-stone-400 uppercase tracking-widest">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-2xs text-stone-400 hover:text-stone-200 transition-colors"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <><Check className="w-3 h-3 text-success" /><span className="text-success">Copied</span></>
          ) : (
            <><Copy className="w-3 h-3" /><span>Copy</span></>
          )}
        </button>
      </div>
      {/* Body */}
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed" style={{ tabSize: 2 }}>
        <code className="text-stone-200 font-mono">{children}</code>
      </pre>
    </div>
  );
};

// ─── Main answer panel ────────────────────────────────────────────────────────
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
    <article className="card-lifted p-5 sm:p-6 space-y-4 animate-fade-up" aria-label="AI-generated answer">

      {/* ── Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-cobalt-50 border border-cobalt-200 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-cobalt-500" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-ink">Analysis</h3>
              <span className="chip text-2xs">
                Gemini · Chroma RAG
              </span>
            </div>
            <p className="text-xs text-ink-tertiary mt-0.5 line-clamp-1" title={question}>
              <span className="italic">&ldquo;{question}&rdquo;</span>
            </p>
          </div>
        </div>

        {/* Copy answer */}
        <button
          type="button"
          onClick={handleCopyAnswer}
          className="btn-ghost text-xs self-start sm:self-auto"
          aria-label={copiedAnswer ? 'Answer copied' : 'Copy answer as Markdown'}
        >
          {copiedAnswer ? (
            <><Check className="w-3.5 h-3.5 text-success" /><span className="text-success">Copied</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
          )}
        </button>
      </div>

      {/* ── Markdown body */}
      <div className="answer-prose">
        <ReactMarkdown
          components={{ code: CodeBlock as React.ComponentType<{inline?: boolean; className?: string; children?: React.ReactNode}> }}
        >
          {answer}
        </ReactMarkdown>
      </div>

      {/* ── Grounding footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-stone-200 text-xs">
        <div className="flex items-center gap-1.5 text-success-text">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            Synthesized from{' '}
            <strong className="font-semibold">{sourcesCount}</strong>{' '}
            verified source chunk{sourcesCount !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-ink-tertiary font-mono text-2xs">{repository}</span>
      </div>

    </article>
  );
};
