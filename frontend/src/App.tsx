import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RepositoryInput } from './components/RepositoryInput';
import { AnalysisProgress } from './components/AnalysisProgress';
import { RepositoryOverview } from './components/RepositoryOverview';
import { SuggestedQuestions } from './components/SuggestedQuestions';
import { QuestionInput } from './components/QuestionInput';
import { AnswerPanel } from './components/AnswerPanel';
import { SourcesPanel } from './components/SourcesPanel';
import { Footer } from './components/Footer';
import { api } from './services/api';
import { IndexResponse, QueryResponse } from './types/api';
import { Database, ShieldCheck, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [indexedRepo, setIndexedRepo] = useState<IndexResponse | null>(null);
  const [activeRepoUrl, setActiveRepoUrl] = useState<string>('');
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexError, setIndexError] = useState<string | null>(null);

  const [questionValue, setQuestionValue] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<'searching' | 'generating' | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  // Poll backend health check on mount and interval
  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        const res = await api.checkHealth();
        if (isMounted) {
          setBackendConnected(res.status === 'ok');
        }
      } catch {
        if (isMounted) {
          setBackendConnected(false);
        }
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle repository analysis & indexing
  const handleIndexRepository = async (url: string) => {
    setIsIndexing(true);
    setIndexError(null);
    setQueryResult(null);
    setActiveRepoUrl(url);

    try {
      const response = await api.indexRepository(url);
      setIndexedRepo(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setIndexError(err.message);
      } else {
        setIndexError('Failed to analyze repository.');
      }
      setIndexedRepo(null);
    } finally {
      setIsIndexing(false);
    }
  };

  // Handle asking questions
  const handleAskQuestion = async (question: string, topK: number) => {
    if (!activeRepoUrl) {
      setQueryError('Please analyze and index a repository first.');
      return;
    }

    setIsQuerying(true);
    setLoadingStep('searching');
    setQueryError(null);

    try {
      // Meaningful state progression for query UX
      const stepTimer = setTimeout(() => {
        setLoadingStep('generating');
      }, 600);

      const response = await api.queryRepository(activeRepoUrl, question, topK);
      clearTimeout(stepTimer);
      setQueryResult(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setQueryError(err.message);
      } else {
        setQueryError('Failed to query codebase context.');
      }
    } finally {
      setIsQuerying(false);
      setLoadingStep(null);
    }
  };

  const handleSelectSuggestedQuestion = (questionText: string) => {
    setQuestionValue(questionText);
    handleAskQuestion(questionText, 5);
  };

  const handleResetRepo = () => {
    setIndexedRepo(null);
    setActiveRepoUrl('');
    setQueryResult(null);
    setQuestionValue('');
    setIndexError(null);
    setQueryError(null);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans bg-radial-glow bg-grid-pattern selection:bg-brand-500/30 selection:text-white">
      {/* Sticky Top Header */}
      <Header backendConnected={backendConnected} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* State 1: No repository active and not indexing */}
        {!indexedRepo && !isIndexing && (
          <div className="space-y-6 animate-fade-in">
            <Hero />

            <section>
              <RepositoryInput
                onIndex={handleIndexRepository}
                isLoading={isIndexing}
                error={indexError}
              />
            </section>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-surface-border">
              <div className="bg-surface-100 p-4 rounded-xl border border-surface-border space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-center text-sky-400">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white font-mono">
                  ChromaDB Collections
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deterministic vector collections per repository with idempotent caching to prevent redundant re-embedding.
                </p>
              </div>

              <div className="bg-surface-100 p-4 rounded-xl border border-surface-border space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white font-mono">
                  Source Evidence Grounding
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect exact code chunks, file paths, and cosine similarity metrics behind every synthesized answer.
                </p>
              </div>

              <div className="bg-surface-100 p-4 rounded-xl border border-surface-border space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-center text-brand-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white font-mono">
                  Gemini Generation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero hallucination reasoning strictly constrained to retrieved AST and documentation context.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Actively Indexing Pipeline */}
        {isIndexing && (
          <section className="py-4">
            <AnalysisProgress repositoryUrl={activeRepoUrl} />
          </section>
        )}

        {/* State 3: Repository Indexed & Ready */}
        {indexedRepo && !isIndexing && (
          <div className="space-y-5 animate-fade-in">
            {/* Repository Telemetry Bar */}
            <RepositoryOverview
              data={indexedRepo}
              onReset={handleResetRepo}
            />

            {/* Suggested Question Chips */}
            <SuggestedQuestions
              onSelectQuestion={handleSelectSuggestedQuestion}
              disabled={isQuerying}
            />

            {/* Query Input Panel */}
            <QuestionInput
              onAsk={handleAskQuestion}
              isLoading={isQuerying}
              loadingStep={loadingStep}
              error={queryError}
              repositoryName={indexedRepo.repository}
              questionValue={questionValue}
              onQuestionChange={setQuestionValue}
            />

            {/* AI Answer & Source Evidence */}
            {queryResult && (
              <section className="space-y-5 pt-2">
                <AnswerPanel
                  answer={queryResult.answer}
                  question={queryResult.question}
                  repository={queryResult.repository}
                  sourcesCount={queryResult.sources.length}
                />

                <SourcesPanel
                  sources={queryResult.sources}
                  repository={queryResult.repository}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
export default App;
