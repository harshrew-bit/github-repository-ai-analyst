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
    category: 'Data & Control Flow',
    question: 'Where is the main entry point and how does the primary execution flow operate?',
    icon: Workflow,
  },
  {
    category: 'Security & Auth',
    question: 'How is authentication, session state, or token validation implemented?',
    icon: Shield,
  },
  {
    category: 'Error Handling',
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
      <p className="text-xs font-medium text-ink-tertiary uppercase tracking-widest">
        Research prompts
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(item.question)}
              disabled={disabled}
              className="group text-left p-3.5 rounded-xl bg-white border border-stone-200 hover:border-cobalt-300 hover:shadow-cobalt-sm transition-all duration-150 flex items-start justify-between gap-3 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500/30"
              aria-label={`Ask: ${item.question}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-stone-50 border border-stone-200 group-hover:bg-cobalt-50 group-hover:border-cobalt-200 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-ink-tertiary group-hover:text-cobalt-500 transition-colors" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="meta-label block mb-1 group-hover:text-cobalt-500 transition-colors">
                    {item.category}
                  </span>
                  <p className="text-xs text-ink-secondary group-hover:text-ink leading-relaxed line-clamp-2 transition-colors">
                    {item.question}
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="w-3.5 h-3.5 text-stone-300 group-hover:text-cobalt-400 flex-shrink-0 mt-0.5 transition-colors"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
