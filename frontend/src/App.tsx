import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RepositoryInput } from './components/RepositoryInput';
import { RepositoryStatus } from './components/RepositoryStatus';
import { SuggestedQuestions } from './components/SuggestedQuestions';
import { QuestionInput } from './components/QuestionInput';
import { AnswerPanel } from './components/AnswerPanel';
import { SourcesPanel } from './components/SourcesPanel';
import { api } from './services/api';
import { IndexResponse, QueryResponse } from './types/api';
import { Code2, Sparkles, Database, ShieldCheck } from 'lucide-react';

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

  // Check backend health on initial load
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

  // Handle repository indexing
  const handleIndexRepository = async (url: string) => {
    setIsIndexing(true);
    setIndexError(null);
    setQueryResult(null);

    try {
      const response = await api.indexRepository(url);
      setIndexedRepo(response);
      setActiveRepoUrl(url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setIndexError(err.message);
      } else {
        setIndexError('Failed to index repository.');
      }
    } finally {
      setIsIndexing(false);
    }
  };

  // Handle asking question
  const handleAskQuestion = async (question: string, topK: number) => {
    if (!activeRepoUrl) {
      setQueryError('Please analyze and index a repository first.');
      return;
    }

    setIsQuerying(true);
    setLoadingStep('searching');
    setQueryError(null);

    try {
      // Simulate sub-step indicator for UX
      setTimeout(() => {
        setLoadingStep('generating');
      }, 700);

      const response = await api.queryRepository(activeRepoUrl, question, topK);
      setQueryResult(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setQueryError(err.message);
      } else {
        setQueryError('Failed to query repository.');
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

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col font-sans">
      <Header backendConnected={backendConnected} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Hero Banner when no repository is selected yet */}
        {!indexedRepo && !isIndexing && (
          <div className="text-center py-6 px-4 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#8b949e]">
              <Code2 className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Full Repository AST & Vector Embeddings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f6fc]">
              Understand any codebase in seconds
            </h2>
            <p className="text-sm text-[#8b949e] max-w-xl mx-auto leading-relaxed">
              Paste a public GitHub repository URL to index its source files into
              ChromaDB and ask architectural or implementation questions grounded by Gemini.
            </p>
          </div>
        )}

        {/* Section 1: Repository Input */}
        <section>
          <RepositoryInput
            onIndex={handleIndexRepository}
            isLoading={isIndexing}
            error={indexError}
          />
        </section>

        {/* Section 2: Repository Status if indexed */}
        {indexedRepo && (
          <section className="space-y-4">
            <RepositoryStatus data={indexedRepo} />

            {/* Suggested Questions */}
            <SuggestedQuestions
              onSelectQuestion={handleSelectSuggestedQuestion}
              disabled={isQuerying}
            />

            {/* Question Input */}
            <QuestionInput
              onAsk={handleAskQuestion}
              isLoading={isQuerying}
              loadingStep={loadingStep}
              error={queryError}
              repositoryName={indexedRepo.repository}
              questionValue={questionValue}
              onQuestionChange={setQuestionValue}
            />
          </section>
        )}

        {/* Section 3: AI Answer & Sources */}
        {queryResult && (
          <section className="space-y-5">
            <AnswerPanel
              answer={queryResult.answer}
              question={queryResult.question}
              repository={queryResult.repository}
            />

            <SourcesPanel sources={queryResult.sources} />
          </section>
        )}

        {/* Feature Highlights on empty state */}
        {!indexedRepo && !isIndexing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#30363d]">
            <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] space-y-2">
              <div className="p-2 w-fit rounded-lg bg-[#21262d] text-[#58a6ff]">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">
                ChromaDB Collections
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Deterministic collection names per repository with idempotent caching to prevent re-embedding.
              </p>
            </div>

            <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] space-y-2">
              <div className="p-2 w-fit rounded-lg bg-[#21262d] text-[#3fb950]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">
                Source Attribution
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Inspect exact code chunks, file paths, and cosine similarity metrics grounding every answer.
              </p>
            </div>

            <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] space-y-2">
              <div className="p-2 w-fit rounded-lg bg-[#21262d] text-[#d29922]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">
                Gemini 3.5 Generation
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Accurate, strictly grounded reasoning over retrieved code and documentation files.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#30363d] py-5 mt-auto bg-[#161b22]/40 text-center text-xs text-[#8b949e]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GitHub Repository AI Analyst &bull; Portfolio Project</span>
          <span className="text-[11px] text-[#8b949e]/80">
            Powered by FastAPI, ChromaDB & Google Gemini
          </span>
        </div>
      </footer>
    </div>
  );
};
