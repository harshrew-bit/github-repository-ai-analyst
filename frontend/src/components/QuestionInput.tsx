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

  const loadingLabel =
    loadingStep === 'searching'
      ? 'Retrieving relevant AST chunks…'
      : 'Synthesizing answer with Gemini…';

  return (
    <div className="space-y-3">

      {/* ── Query Composer Container */}
      <div
        className={`bg-white rounded-2xl border transition-all duration-200 shadow-lifted ${
          error
            ? 'border-error/40 ring-2 ring-error/10'
            : 'border-stone-300 hover:border-stone-400 focus-within:border-cobalt-500 focus-within:ring-4 focus-within:ring-cobalt-500/15'
        }`}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 space-y-3">

            {/* Top Toolbar: Context & Retrieval Presets */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <label
                htmlFor="codebase-query-input"
                className="text-2xs font-mono uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5"
              >
                <span>Target Query</span>
                {repositoryName && (
                  <span className="text-cobalt-600 font-semibold truncate max-w-[14rem] sm:max-w-none">
                    · {repositoryName}
                  </span>
                )}
              </label>

              {/* Retrieval Preset Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-3xs font-mono text-ink-tertiary mr-1 hidden sm:inline">Top-K Chunks:</span>
                {[3, 5, 8].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTopK(val)}
                    className={`px-2 py-0.5 rounded text-2xs font-mono transition-colors ${
                      topK === val
                        ? 'bg-cobalt-500 text-white font-medium'
                        : 'bg-stone-100 text-ink-tertiary hover:text-ink hover:bg-stone-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1 rounded text-2xs border transition-colors ml-1 ${
                    showSettings
                      ? 'bg-cobalt-50 border-cobalt-200 text-cobalt-600'
                      : 'bg-stone-50 border-stone-200 text-ink-tertiary hover:text-ink hover:border-stone-300'
                  }`}
                  aria-expanded={showSettings}
                  title="Custom retrieval settings"
                  aria-label="Toggle custom retrieval slider"
                >
                  <Sliders className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Custom Slider Drawer (if toggled) */}
            {showSettings && (
              <div
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2 animate-slide-down"
                role="region"
                aria-label="Custom retrieval chunk count"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary font-medium">Context chunks retrieved:</span>
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
                <div className="flex justify-between text-3xs font-mono text-ink-tertiary">
                  <span>1 · Focused (Fast)</span>
                  <span>15 · Comprehensive (Deep)</span>
                </div>
              </div>
            )}

            {/* Query Textarea */}
            <textarea
              id="codebase-query-input"
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
                  ? `e.g. How does ${repositoryName} handle authentication? Where is the main request dispatch entry point?`
                  : 'Enter a research inquiry about the codebase…'
              }
              disabled={disabled || isLoading}
              className="w-full resize-none border-0 p-0 text-sm sm:text-base text-ink placeholder:text-ink-placeholder bg-transparent focus:ring-0 focus:outline-none leading-relaxed"
              aria-label="Research inquiry"
              aria-describedby={error ? 'query-error' : undefined}
            />

            {/* Action Strip */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <p className="text-3xs text-ink-tertiary hidden sm:flex items-center gap-1 font-mono">
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-3xs">↵ Enter</kbd>
                <span>to execute</span>
                <span className="opacity-40">·</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-3xs">⇧ Shift+Enter</kbd>
                <span>for newline</span>
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
                  className="btn-primary text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-cobalt-sm"
                  aria-busy={isLoading}
                  aria-label={isLoading ? loadingLabel : 'Execute research query'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      <span>{loadingStep === 'searching' ? 'Retrieving AST…' : 'Synthesizing…'}</span>
                    </>
                  ) : (
                    <>
                      <span>Ask Codebase</span>
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* ── Error Banner */}
      {error && (
        <div
          id="query-error"
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-xl bg-error-light border border-error/20 animate-fade-up text-error-text"
        >
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider font-mono">Query Execution Error</p>
            <p className="text-xs leading-relaxed opacity-90">{error}</p>
          </div>
        </div>
      )}

    </div>
  );
};
