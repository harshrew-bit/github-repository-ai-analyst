import React, { useState } from 'react';
import { Send, Loader2, Sliders, AlertCircle } from 'lucide-react';

interface QuestionInputProps {
  onAsk: (question: string, topK: number) => Promise<void>;
  isLoading: boolean;
  loadingStep?: 'searching' | 'generating' | null;
  error: string | null;
  repositoryName?: string;
  disabled?: boolean;
  questionValue?: string;
  onQuestionChange?: (val: string) => void;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  onAsk,
  isLoading,
  loadingStep,
  error,
  repositoryName,
  disabled = false,
  questionValue,
  onQuestionChange,
}) => {
  const [internalQuestion, setInternalQuestion] = useState('');
  const [topK, setTopK] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  const question = questionValue !== undefined ? questionValue : internalQuestion;
  const setQuestion = onQuestionChange ?? setInternalQuestion;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading || disabled) return;
    onAsk(question.trim(), topK);
  };

  const getTopKLabel = (val: number): string => {
    if (val <= 3) return 'Fast · fewer context chunks';
    if (val <= 7) return 'Balanced · recommended';
    return 'Deep · maximum context';
  };

  const loadingLabel =
    loadingStep === 'searching'
      ? 'Retrieving relevant chunks…'
      : 'Generating answer with Gemini…';

  return (
    <div className="space-y-3">

      {/* ── Main input card */}
      <div
        className={`card-lifted transition-all duration-200 ${
          error
            ? 'border-error/30 ring-1 ring-error/15'
            : 'focus-within:border-cobalt-300 focus-within:ring-1 focus-within:ring-cobalt-500/20'
        }`}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3">

            {/* Label + settings toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="codebase-query"
                className="text-xs font-semibold text-ink-secondary"
              >
                {repositoryName
                  ? `Ask about ${repositoryName}`
                  : 'Research question'}
              </label>

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/30 ${
                  showSettings
                    ? 'bg-cobalt-50 border-cobalt-200 text-cobalt-600'
                    : 'bg-stone-50 border-stone-200 text-ink-tertiary hover:text-ink hover:border-stone-300'
                }`}
                aria-expanded={showSettings}
                aria-controls="retrieval-settings"
                title="Retrieval settings"
              >
                <Sliders className="w-3 h-3" aria-hidden="true" />
                <span>top-k: {topK}</span>
              </button>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div
                id="retrieval-settings"
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 animate-slide-down"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary font-medium">Context chunks retrieved</span>
                  <span className="font-mono font-semibold text-cobalt-600">{topK} chunks</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-cobalt-500"
                  aria-label={`Retrieve ${topK} chunks`}
                />
                <div className="flex justify-between text-2xs font-mono text-ink-tertiary">
                  <span>1 · Fast</span>
                  <span className="text-cobalt-600">{getTopKLabel(topK)}</span>
                  <span>15 · Deep</span>
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              id="codebase-query"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                repositoryName
                  ? `How does ${repositoryName} handle authentication? What is the main entry point? …`
                  : 'Index a repository above to start asking questions…'
              }
              disabled={disabled || isLoading}
              className="input-field resize-none focus:ring-0 focus:border-cobalt-400 px-0 py-0 border-0 shadow-none bg-transparent text-sm placeholder:text-ink-placeholder"
              aria-label="Research question"
              aria-describedby={error ? 'query-error' : undefined}
            />

            {/* Action bar */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-100">
              <p className="text-2xs text-ink-tertiary hidden sm:block font-mono">
                <kbd className="px-1 py-0.5 bg-stone-100 border border-stone-200 rounded text-2xs">↵ Enter</kbd>
                {' '}to ask ·{' '}
                <kbd className="px-1 py-0.5 bg-stone-100 border border-stone-200 rounded text-2xs">⇧ Shift+Enter</kbd>
                {' '}for newline
              </p>

              <div className="flex items-center gap-2 ml-auto">
                {question.trim() && !isLoading && (
                  <button
                    type="button"
                    onClick={() => setQuestion('')}
                    className="text-xs text-ink-tertiary hover:text-ink transition-colors px-2 py-1"
                    aria-label="Clear question"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!question.trim() || isLoading || disabled}
                  className="btn-primary text-xs px-4 py-2 rounded-lg"
                  aria-busy={isLoading}
                  aria-label={isLoading ? loadingLabel : 'Submit question'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      <span>{loadingStep === 'searching' ? 'Retrieving…' : 'Generating…'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Ask</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* ── Error */}
      {error && (
        <div
          id="query-error"
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-xl bg-error-light border border-error/20 animate-fade-up"
        >
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-error-text">Query failed</p>
            <p className="text-xs text-error-text/80 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

    </div>
  );
};
