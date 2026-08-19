import React, { useState } from 'react';
import { Send, Loader2, MessageSquare, AlertCircle, Sliders } from 'lucide-react';

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

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <label
            htmlFor="question-input"
            className="block text-sm font-medium text-[#f0f6fc]"
          >
            Ask a Question
          </label>
          <p className="text-xs text-[#8b949e] mt-0.5">
            {repositoryName
              ? `Query grounded context from ${repositoryName}`
              : 'Index a repository first to begin querying'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center space-x-1 px-2 py-1 rounded bg-[#21262d] border border-[#30363d]"
          title="Retrieval settings"
        >
          <Sliders className="w-3 h-3" />
          <span>Top {topK} chunks</span>
        </button>
      </div>

      {showSettings && (
        <div className="mb-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#8b949e]">Context chunks to retrieve (top_k):</span>
            <span className="font-mono text-[#58a6ff] font-semibold">{topK}</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full accent-[#58a6ff] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8b949e]">
            <span>1 (Fast)</span>
            <span>5 (Balanced)</span>
            <span>15 (Deep Context)</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute top-3 left-3.5 text-[#8b949e] pointer-events-none">
            <MessageSquare className="w-4 h-4" />
          </div>
          <textarea
            id="question-input"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              disabled
                ? 'Please index a repository above before asking questions...'
                : 'e.g., How does Requests handle authentication and retry logic?'
            }
            disabled={disabled || isLoading}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-10 pr-28 py-2.5 text-sm text-[#f0f6fc] placeholder-[#8b949e]/60 focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent transition-all resize-none disabled:opacity-50"
          />
          <div className="absolute bottom-2.5 right-2 flex items-center">
            <button
              type="submit"
              disabled={!question.trim() || isLoading || disabled}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  {loadingStep === 'searching'
                    ? 'Searching...'
                    : 'Generating...'}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Ask Question
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start space-x-2 text-xs text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Query Error</p>
              <p className="text-[#f0f6fc]/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
