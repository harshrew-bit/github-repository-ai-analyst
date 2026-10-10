import React from 'react';
import { Layers, Workflow, Shield, Terminal, ArrowUpRight } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

interface Suggestion {
  category: string;
  question: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SUGGESTIONS: Suggestion[] = [
  {
    category: 'Architecture',
    question: 'Explain the high-level architecture and core module responsibilities.',
    icon: Layers,
  },
  {
    category: 'Execution Flow',
    question: 'Where is the main entry point and how does the primary execution flow operate?',
    icon: Workflow,
  },
  {
    category: 'Security & State',
    question: 'How is authentication, session state, or token validation implemented?',
    icon: Shield,
  },
  {
    category: 'Error Policies',
    question: 'How are exceptions, HTTP errors, and request retries handled?',
    icon: Terminal,
  },
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-mono uppercase tracking-widest text-ink-tertiary">
          Research Inquiries
        </span>
        <span className="text-3xs font-mono text-ink-tertiary hidden sm:inline">
          Click to analyze codebase
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(item.question)}
              disabled={disabled}
              className="group text-left p-3.5 rounded-xl bg-white border border-stone-200/90 hover:border-cobalt-400 hover:shadow-cobalt-sm transition-all duration-150 flex items-start justify-between gap-3 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/30"
              aria-label={`Ask: ${item.question}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-stone-100/80 group-hover:bg-cobalt-50 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-ink-tertiary group-hover:text-cobalt-600 transition-colors" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-3xs font-mono uppercase tracking-wider text-cobalt-600 font-semibold block">
                    {item.category}
                  </span>
                  <p className="text-xs text-ink-secondary group-hover:text-ink leading-snug line-clamp-2 transition-colors">
                    {item.question}
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="w-3.5 h-3.5 text-stone-300 group-hover:text-cobalt-500 flex-shrink-0 mt-0.5 transition-colors"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
