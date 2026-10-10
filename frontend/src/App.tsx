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

type AppView = 'landing' | 'indexing' | 'workspace';

export const App: React.FC = () => {
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [view, setView] = useState<AppView>('landing');

  const [indexedRepo, setIndexedRepo] = useState<IndexResponse | null>(null);
  const [activeRepoUrl, setActiveRepoUrl] = useState<string>('');
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexError, setIndexError] = useState<string | null>(null);

  const [questionValue, setQuestionValue] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<'searching' | 'generating' | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  // ── Health check polling ──────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const res = await api.checkHealth();
        if (isMounted) setBackendConnected(res.status === 'ok');
      } catch {
        if (isMounted) setBackendConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 15_000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // ── Sync view state ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isIndexing) {
      setView('indexing');
    } else if (indexedRepo) {
      setView('workspace');
    } else {
      setView('landing');
    }
  }, [isIndexing, indexedRepo]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleIndexRepository = async (url: string) => {
    setIsIndexing(true);
    setIndexError(null);
    setQueryResult(null);
    setActiveRepoUrl(url);
    setQuestionValue('');

    try {
      const response = await api.indexRepository(url);
      setIndexedRepo(response);
    } catch (err: unknown) {
      setIndexError(err instanceof Error ? err.message : 'Failed to analyze repository.');
      setIndexedRepo(null);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleAskQuestion = async (question: string, topK: number) => {
    if (!activeRepoUrl) {
      setQueryError('Please analyze and index a repository first.');
      return;
    }
    setIsQuerying(true);
    setLoadingStep('searching');
    setQueryError(null);

    try {
      const stepTimer = setTimeout(() => setLoadingStep('generating'), 600);
      const response = await api.queryRepository(activeRepoUrl, question, topK);
      clearTimeout(stepTimer);
      setQueryResult(response);
    } catch (err: unknown) {
      setQueryError(err instanceof Error ? err.message : 'Failed to query codebase context.');
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
    <div className="min-h-screen bg-canvas canvas-texture text-ink flex flex-col selection:bg-cobalt-100 selection:text-cobalt-700">

      {/* ── Header (passes logo-click → reset to landing) */}
      <Header
        backendConnected={backendConnected}
        onLogoClick={view === 'workspace' || view === 'indexing' ? handleResetRepo : undefined}
      />

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ═══ VIEW: Landing ═══ */}
        {view === 'landing' && (
          <div className="space-y-8 animate-fade-up">
            <Hero />

            {/* Divider */}
            <div className="section-separator" />

            {/* Input zone */}
            <section aria-labelledby="start-heading">
              <div className="text-center space-y-2 mb-8">
                <h2 id="start-heading" className="text-2xl font-bold text-ink tracking-tight">
                  Start exploring
                </h2>
                <p className="text-sm text-ink-tertiary">
                  Paste any public GitHub repository URL to begin.
                </p>
              </div>
              <RepositoryInput
                onIndex={handleIndexRepository}
                isLoading={isIndexing}
                error={indexError}
              />
            </section>

          </div>
        )}

        {/* ═══ VIEW: Indexing ═══ */}
        {view === 'indexing' && (
          <div className="py-8 animate-fade-up">
            <AnalysisProgress repositoryUrl={activeRepoUrl} />
          </div>
        )}

        {/* ═══ VIEW: Workspace ═══ */}
        {view === 'workspace' && indexedRepo && (
          <div className="space-y-6 animate-fade-up">

            {/* Repository identity bar */}
            <RepositoryOverview
              data={indexedRepo}
              onReset={handleResetRepo}
            />

            {/* ── Research zone ─────────────────────────────────────────── */}
            <section aria-label="Research workspace" className="space-y-5">

              {/* Suggested questions */}
              <SuggestedQuestions
                onSelectQuestion={handleSelectSuggestedQuestion}
                disabled={isQuerying}
              />

              {/* Divider */}
              <div className="section-separator" />

              {/* Question composer */}
              <QuestionInput
                onAsk={handleAskQuestion}
                isLoading={isQuerying}
                loadingStep={loadingStep}
                error={queryError}
                repositoryName={indexedRepo.repository}
                questionValue={questionValue}
                onQuestionChange={setQuestionValue}
              />

              {/* Answer + Evidence (shown after first query) */}
              {queryResult && (
                <div className="space-y-5 pt-2">
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
                </div>
              )}

            </section>

          </div>
        )}

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
};

export default App;
