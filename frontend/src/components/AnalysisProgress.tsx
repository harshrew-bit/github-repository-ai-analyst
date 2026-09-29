import React, { useState, useEffect } from 'react';
import { GitBranch, FileSearch, Code2, Cpu, Database, CheckCircle2, Loader2, Clock } from 'lucide-react';

interface AnalysisProgressProps {
  repositoryUrl: string;
}

interface Step {
  id: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PIPELINE_STEPS: Step[] = [
  {
    id: 'connect',
    label: 'Connecting to GitHub API',
    detail: 'Verifying repository access & default branch metadata',
    icon: GitBranch,
  },
  {
    id: 'tree',
    label: 'Reading repository tree',
    detail: 'Traversing recursive Git tree & filtering non-code assets',
    icon: FileSearch,
  },
  {
    id: 'parse',
    label: 'Parsing source files',
    detail: 'Extracting text documents and chunking code boundaries',
    icon: Code2,
  },
  {
    id: 'embed',
    label: 'Generating embeddings',
    detail: 'Batch processing vector representations via Google Gemini',
    icon: Cpu,
  },
  {
    id: 'index',
    label: 'Indexing into ChromaDB',
    detail: 'Persisting HNSW cosine vector index to disk storage',
    icon: Database,
  },
  {
    id: 'ready',
    label: 'Repository ready',
    detail: 'Vector store initialized and ready for semantic retrieval',
    icon: CheckCircle2,
  },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ repositoryUrl }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Dynamic step progression for request lifecycle feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Progress through realistic timeframes during long-running embedding/indexing calls
    const stepIntervals = [
      setTimeout(() => setActiveStepIndex(1), 1200),
      setTimeout(() => setActiveStepIndex(2), 3000),
      setTimeout(() => setActiveStepIndex(3), 6000),
      setTimeout(() => setActiveStepIndex(4), 10000),
    ];

    return () => {
      clearInterval(timer);
      stepIntervals.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface-100 border border-surface-border rounded-xl p-5 shadow-xl animate-fade-in space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
          <span className="text-sm font-semibold text-white tracking-tight">
            Indexing Repository Pipeline
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsedSeconds}s elapsed</span>
        </div>
      </div>

      {/* Target repo banner */}
      <div className="px-3 py-2 rounded-lg bg-surface-50 border border-surface-border font-mono text-xs text-slate-300 truncate">
        Target: <span className="text-brand-400 font-semibold">{repositoryUrl}</span>
      </div>

      {/* Pipeline Steps Tracker */}
      <div className="space-y-2.5 pt-1">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start space-x-3 p-2.5 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-surface-200 border-brand-500/40 shadow-sm shadow-brand-500/10'
                  : isComplete
                  ? 'bg-surface-50/50 border-surface-border text-slate-400'
                  : 'border-transparent opacity-40'
              }`}
            >
              {/* Step indicator */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-mono transition-colors ${
                  isComplete
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isCurrent
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                    : 'bg-surface-50 text-slate-600 border border-surface-border'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Step details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-medium tracking-tight ${
                      isCurrent
                        ? 'text-white font-semibold'
                        : isComplete
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-1.5 py-0.2 rounded border border-brand-500/20 animate-pulse">
                      In progress
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal truncate">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
