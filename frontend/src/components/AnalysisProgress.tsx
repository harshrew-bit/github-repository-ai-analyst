import React, { useState, useEffect } from 'react';
import {
  GitBranch, FileSearch, Code2, Cpu, Database,
  CheckCircle2, Loader2, Clock,
} from 'lucide-react';

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
    detail: 'Verifying repository access and reading default branch metadata',
    icon: GitBranch,
  },
  {
    id: 'tree',
    label: 'Reading repository tree',
    detail: 'Traversing Git tree and filtering non-code assets',
    icon: FileSearch,
  },
  {
    id: 'parse',
    label: 'Parsing source files',
    detail: 'Extracting documents and chunking at code boundaries',
    icon: Code2,
  },
  {
    id: 'embed',
    label: 'Generating embeddings',
    detail: 'Batch processing vector representations via Gemini',
    icon: Cpu,
  },
  {
    id: 'index',
    label: 'Indexing into ChromaDB',
    detail: 'Persisting HNSW cosine vector index',
    icon: Database,
  },
  {
    id: 'ready',
    label: 'Repository ready',
    detail: 'Vector store initialized and ready for semantic retrieval',
    icon: CheckCircle2,
  },
];

function formatTime(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

// Extract owner/repo from URL for display
function parseRepoName(url: string): string {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1].replace(/\.git$/, '') : url;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ repositoryUrl }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const repoName = parseRepoName(repositoryUrl);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

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
    <div className="w-full max-w-2xl mx-auto animate-fade-up" role="status" aria-live="polite" aria-label="Indexing progress">

      {/* Header card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6 shadow-glass">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cobalt-50 border border-cobalt-200 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-cobalt-500 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Indexing Pipeline</p>
              <p className="text-2xs text-ink-tertiary font-mono truncate max-w-[14rem] sm:max-w-xs">
                {repoName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-ink-tertiary">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span aria-label={`${elapsedSeconds} seconds elapsed`}>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-stone-200/70 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cobalt-500 via-sky-400 to-indigo-500 transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${Math.min(95, (activeStepIndex / (PIPELINE_STEPS.length - 1)) * 100)}%` }}
              role="progressbar"
              aria-valuenow={activeStepIndex}
              aria-valuemin={0}
              aria-valuemax={PIPELINE_STEPS.length - 1}
            />
          </div>
          <div className="flex justify-between text-2xs font-mono text-ink-tertiary">
            <span>Connecting</span>
            <span>Ready</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isComplete = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-cobalt-50/90 border-cobalt-200/90 shadow-subtle'
                    : isComplete
                    ? 'bg-white/70 border-stone-200/80'
                    : 'bg-white/30 border-stone-200/40 opacity-40'
                }`}
              >
                {/* Indicator */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isComplete
                      ? 'bg-success-light border border-success/30'
                      : isCurrent
                      ? 'bg-cobalt-100 border border-cobalt-300'
                      : 'bg-stone-100 border border-stone-200'
                  }`}
                  aria-hidden="true"
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-cobalt-500 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-ink-tertiary" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        isCurrent
                          ? 'text-cobalt-700 font-semibold'
                          : isComplete
                          ? 'text-ink-secondary'
                          : 'text-ink-tertiary'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-2xs font-mono text-cobalt-600 bg-cobalt-100 px-1.5 py-0.5 rounded-md border border-cobalt-200 animate-pulse">
                        Running
                      </span>
                    )}
                    {isComplete && (
                      <span className="text-2xs font-mono text-success-text">
                        Done
                      </span>
                    )}
                  </div>
                  <p className={`text-2xs mt-0.5 leading-relaxed ${
                    isCurrent ? 'text-cobalt-600' : 'text-ink-tertiary'
                  }`}>
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info note */}
        <p className="text-xs text-ink-tertiary text-center pt-1">
          Embedding generation may take 30–120 seconds depending on repository size.
          <br />
          Subsequent analyses of the same repository load from cache instantly.
        </p>

      </div>
    </div>
  );
};
