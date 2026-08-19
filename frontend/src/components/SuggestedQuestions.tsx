import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  'What is the core architecture and purpose of this repository?',
  'How does authentication or session management work?',
  'Where is the main entry point and execution flow?',
  'How are errors and retries handled in this project?',
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1.5 text-xs text-[#8b949e]">
        <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
        <span>Suggested questions to explore:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuestion(q)}
            disabled={disabled}
            className="text-left text-xs bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff]/50 rounded-lg p-2.5 text-[#f0f6fc] transition-all flex items-start space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#8b949e] group-hover:text-[#58a6ff] flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
