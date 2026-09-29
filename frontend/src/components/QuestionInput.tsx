import React, { useState } from 'react';
import { Send, Loader2, Sliders, Sparkles, AlertCircle, CornerDownLeft } from 'lucide-react';

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
  const setQuestion = onQuestionChange || setInternalQuestion;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading || disabled) return;
    onAsk(question.trim(), topK);
  };

  const getTopKLabel = (val: number) => {
    if (val <= 3) return 'Fast Retrieval (1-3 chunks)';
    if (val <= 7) return 'Balanced Context (4-7 chunks)';
    return 'Deep Comprehensive (8-15 chunks)';
  };

  return (
    <div className="bg-surface-100 border border-surface-border rounded-xl p-4 sm:p-5 shadow-lg shadow-black/20 space-y-3 transition-all focus-within:border-brand-500/40">
      {/* Top bar with retrieval settings toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="codebase-query" className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Ask anything about this codebase:</span>
        </label>

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
            showSettings
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
              : 'bg-surface-50 border-surface-border text-slate-400 hover:text-white'
          }`}
          title="Configure retrieval parameters"
        >
          <Sliders className="w-3 h-3" />
          <span>Top-k: {topK}</span>
        </button>
      </div>

      {/* Advanced retrieval slider settings popover */}
      {showSettings && (
        <div className="p-3 bg-surface-50 border border-surface-border rounded-lg space-y-2 text-xs animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Context Chunks Retrieved:</span>
            <span className="font-mono text-brand-400 font-semibold">{topK} chunks</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer h-1.5 bg-surface-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>1 (Fast)</span>
            <span>5 (Recommended)</span>
            <span>15 (Deep Context)</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-surface-border">
            Mode: <span className="text-slate-200">{getTopKLabel(topK)}</span>
          </p>
        </div>
      )}

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
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
                ? `Ask how ${repositoryName} implements a feature, handles errors, or structures modules...`
                : 'Index a repository first to query codebase architecture...'
            }
            disabled={disabled || isLoading}
            className="w-full bg-surface-50 border border-surface-border rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none disabled:opacity-50"
          />

          {/* Action bar inside textarea */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
              Press <kbd className="px-1 py-0.5 bg-surface-200 border border-surface-border rounded text-[10px]">Enter</kbd> to query, <kbd className="px-1 py-0.5 bg-surface-200 border border-surface-border rounded text-[10px]">Shift+Enter</kbd> for newline
            </span>

            <div className="ml-auto flex items-center space-x-2">
              {question.trim() && !isLoading && (
                <button
                  type="button"
                  onClick={() => setQuestion('')}
                  className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
                >
                  Clear
                </button>
              )}

              <button
                type="submit"
                disabled={!question.trim() || isLoading || disabled}
                className="px-4 py-2 text-xs font-medium bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-sm shadow-brand-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {loadingStep === 'searching'
                        ? 'Retrieving Chunks...'
                        : 'Synthesizing with Gemini...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask AI Copilot</span>
                    <CornerDownLeft className="w-3 h-3 ml-0.5 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Query error alert */}
        {error && (
          <div className="flex items-start space-x-2.5 text-xs text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg p-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold text-rose-200">Query failed</p>
              <p className="text-rose-300/80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
