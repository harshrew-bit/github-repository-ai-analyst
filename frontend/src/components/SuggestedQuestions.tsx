import React from 'react';
import { Sparkles, Terminal, Shield, Workflow, Layers, ArrowUpRight } from 'lucide-react';

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
    category: 'Reliability',
    question: 'How are exceptions, HTTP errors, and request retries handled?',
    icon: Terminal,
  },
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center space-x-1.5 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span className="font-medium text-slate-300">Suggested Codebase Inquiries:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(item.question)}
              disabled={disabled}
              className="group text-left p-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-border hover:border-brand-500/40 transition-all flex items-start justify-between space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="p-1 rounded bg-surface-50 text-slate-400 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider mb-0.5">
                    {item.category}
                  </span>
                  <p className="text-xs text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                    {item.question}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 flex-shrink-0 transition-colors mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
