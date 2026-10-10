import React, { useState } from 'react';
import {
  GitBranch, Binary, ShieldCheck, FileCode, Cpu, Sparkles
} from 'lucide-react';
import { RepositoryInput } from './RepositoryInput';

interface HeroProps {
  onIndex: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// ─── Technical Living RAG Pipeline Visual Showcase ───────────────────────────
const PipelineShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'fastapi'>('requests');

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 select-none" aria-label="RAG Architecture Showcase">

      {/* Showcase Frame Header — Frosted Technical Console */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-charcoal-900/90 border border-charcoal-700/80 rounded-t-2xl backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-2xs text-stone-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-pulse" />
            rag_pipeline_telemetry.trace
          </span>
        </div>

        {/* Interactive preview tabs */}
        <div className="flex items-center gap-1 bg-charcoal-850/90 p-0.5 rounded-lg border border-charcoal-700">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-2.5 py-1 rounded text-2xs font-mono transition-all duration-150 ${
              activeTab === 'requests'
                ? 'bg-cobalt-500 text-white font-medium shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            psf/requests
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fastapi')}
            className={`px-2.5 py-1 rounded text-2xs font-mono transition-all duration-150 ${
              activeTab === 'fastapi'
                ? 'bg-cobalt-500 text-white font-medium shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            tiangolo/fastapi
          </button>
        </div>
      </div>

      {/* Active Pipeline Data Beam (Living Pipeline Signal) */}
      <div className="relative h-0.5 w-full bg-charcoal-800 overflow-hidden" aria-hidden="true">
        <div className="h-full w-1/3 pipeline-ray animate-beam-flow" />
      </div>

      {/* Showcase Grid Canvas */}
      <div className="bg-charcoal-950/92 border-x border-b border-charcoal-700/80 rounded-b-2xl p-4 sm:p-6 backdrop-blur-2xl shadow-deep">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">

          {/* ══ STAGE 1: Git Ingestion & AST Decomposition ══ */}
          <div className="flex flex-col space-y-3 bg-charcoal-900/75 border border-charcoal-700/60 rounded-xl p-4 hover:border-cobalt-500/40 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-cobalt-950 border border-cobalt-700/60 flex items-center justify-center">
                  <GitBranch className="w-3.5 h-3.5 text-cobalt-400" />
                </div>
                <span className="font-mono text-2xs uppercase tracking-wider text-stone-300">
                  01 · AST Chunking
                </span>
              </div>
              <span className="text-3xs font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/60">
                Grammar Valid
              </span>
            </div>

            <p className="text-2xs text-stone-300 leading-relaxed">
              Code parsed along functional AST boundaries, keeping scopes and signatures intact.
            </p>

            {/* Simulated file excerpt */}
            <div className="bg-charcoal-950 rounded-lg p-2.5 font-mono text-2xs border border-charcoal-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-stone-400 text-3xs border-b border-charcoal-850 pb-1">
                <span className="truncate">
                  {activeTab === 'requests' ? 'requests/adapters.py' : 'fastapi/routing.py'}
                </span>
                <span className="text-cobalt-400 font-semibold">chunk #14</span>
              </div>
              <pre className="text-3xs text-stone-300 leading-normal overflow-x-auto">
{activeTab === 'requests' ? (
`def send(self, request, **kwargs):
    max_retries = self.max_retries
    retries = Retry.from_int(max_retries)
    # timeout backoff policy`
) : (
`async def run_endpoint_function(
    *, dependant: Dependant, values: dict
) -> Any:
    # dependency injection resolution`
)}
              </pre>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between text-3xs font-mono text-stone-400 border-t border-charcoal-800/60">
              <span>Overlap: 120 tokens</span>
              <span className="text-stone-300 font-medium">AST-Scoped</span>
            </div>
          </div>

          {/* ══ STAGE 2: 3,072-Dimensional Vector Projection ══ */}
          <div className="flex flex-col space-y-3 bg-charcoal-900/75 border border-charcoal-700/60 rounded-xl p-4 hover:border-sky-500/40 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-sky-950 border border-sky-700/60 flex items-center justify-center">
                  <Binary className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <span className="font-mono text-2xs uppercase tracking-wider text-stone-300">
                  02 · Vector Space
                </span>
              </div>
              <span className="text-3xs font-mono text-sky-300 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-800/60">
                Gemini 2
              </span>
            </div>

            <p className="text-2xs text-stone-300 leading-relaxed">
              Mapped into high-density 3,072-dimensional space stored in ChromaDB HNSW cosine spaces.
            </p>

            {/* Vector matrix preview */}
            <div className="bg-charcoal-950 rounded-lg p-2.5 font-mono text-2xs border border-charcoal-800/80 space-y-2">
              <div className="flex items-center justify-between text-stone-400 text-3xs">
                <span>Projection Dimensions</span>
                <span className="text-sky-400 font-semibold">3,072 float32</span>
              </div>

              {/* Graphical vector representation */}
              <div className="space-y-1.5 py-1">
                <div className="flex items-center justify-between text-3xs text-stone-400">
                  <span>Cosine Proximity</span>
                  <span className="text-emerald-400 font-bold font-mono">0.9621 · 96.2%</span>
                </div>
                <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cobalt-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: '96.2%' }}
                  />
                </div>
              </div>

              <div className="p-1.5 rounded bg-charcoal-900 border border-charcoal-800 text-3xs text-stone-400 flex items-center justify-between">
                <span>HNSW Index Space</span>
                <span className="text-stone-300">Cosine Distance</span>
              </div>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between text-3xs font-mono text-stone-400 border-t border-charcoal-800/60">
              <span>Collection: v2_hnsw</span>
              <span className="text-emerald-400 font-medium">Deterministic</span>
            </div>
          </div>

          {/* ══ STAGE 3: Semantic Retrieval & Grounded Answer ══ */}
          <div className="flex flex-col space-y-3 bg-charcoal-900/75 border border-charcoal-700/60 rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-700/60 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-mono text-2xs uppercase tracking-wider text-stone-300">
                  03 · Grounded Proof
                </span>
              </div>
              <span className="text-3xs font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/60">
                Verified
              </span>
            </div>

            <p className="text-2xs text-stone-300 leading-relaxed">
              Gemini generates rigorous technical answers strictly bounded by the retrieved AST code context.
            </p>

            {/* Grounded synthesis preview */}
            <div className="bg-charcoal-950 rounded-lg p-2.5 font-mono text-2xs border border-charcoal-800/80 space-y-1.5">
              <div className="text-3xs text-cobalt-400 font-semibold border-b border-charcoal-850 pb-1">
                {activeTab === 'requests'
                  ? 'Q: How does retry backoff function?'
                  : 'Q: How are async dependencies injected?'}
              </div>
              <p className="text-3xs text-stone-300 leading-relaxed line-clamp-3">
                {activeTab === 'requests'
                  ? 'The HTTPAdapter delegates retries to urllib3.util.Retry, passing max_retries into the transport connection pool…'
                  : 'FastAPI resolves dependants recursively via solve_dependencies, executing async callables prior to route execution…'}
              </p>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between text-3xs font-mono text-stone-400 border-t border-charcoal-800/60">
              <span>Citations: 100% verified</span>
              <span className="text-emerald-400 font-medium">Zero Hallucination</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

// ─── Editorial Architectural Manifesto ─────────────────────────────────────────
const principles = [
  {
    num: '01',
    title: 'Syntax-Aware AST Chunking',
    subtitle: 'Preserve code semantic coherence',
    description:
      'Rather than slicing text at arbitrary token limits, files are tokenized along logical programming syntax boundaries. Function signatures, class contracts, and docstrings remain intact for accurate semantic representation.',
    icon: FileCode,
  },
  {
    num: '02',
    title: 'High-Density 3,072D Embedding Vectors',
    subtitle: 'State-of-the-art semantic representations',
    description:
      'Powered by Google Gemini Embedding 2, every code chunk is mapped into a 3,072-dimensional manifold optimized for retrieval and query-code similarity, indexed using ChromaDB HNSW cosine spaces.',
    icon: Cpu,
  },
  {
    num: '03',
    title: 'Deterministic Source Attribution',
    subtitle: 'Zero fabrication, full transparency',
    description:
      'Answers are synthesized exclusively from verified codebase chunks. Every claim is attributed to specific file paths and line numbers with cosine similarity metrics for engineering accountability.',
    icon: ShieldCheck,
  },
];

export const Hero: React.FC<HeroProps> = ({ onIndex, isLoading, error }) => {
  return (
    <div className="w-full">

      {/* ══════════════════════════════════════════════════════════════════════
          ATMOSPHERIC HERO SECTION (SEAMLESS CONTINUOUS BACKGROUND)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-5xl mx-auto space-y-8 text-center">

          {/* System tag badge with live pulse */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/90 text-xs font-mono text-ink-secondary shadow-xs transition-transform duration-200 hover:scale-105">
            <span className="w-2 h-2 rounded-full bg-cobalt-500 animate-pulse" />
            <span className="font-medium text-ink">GEMINI EMBEDDING 2 · CHROMADB · FASTAPI RAG</span>
            <Sparkles className="w-3 h-3 text-amber-500 opacity-80" />
          </div>

          {/* Oversized Confident Editorial Headline */}
          <div className="space-y-4">
            <h1 className="text-hero-headline text-ink tracking-tighter">
              Understand the code
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cobalt-600 via-indigo-600 to-rose-600">
                behind every repository.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-ink-secondary leading-relaxed max-w-2xl mx-auto font-normal">
              Deterministic codebase intelligence for engineers. Explore architectures, follow execution flows, and receive answers strictly verified against real AST syntax.
            </p>
          </div>

          {/* Naturally Integrated Command Input Bar */}
          <div className="pt-2">
            <RepositoryInput
              onIndex={onIndex}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Panoramic Living RAG Architecture Showcase */}
          <PipelineShowcase />

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          EDITORIAL ARCHITECTURE PRINCIPLES (WARM MESH CONTINUITY)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Section Masthead */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-300/80">
            <div>
              <span className="text-2xs font-mono uppercase tracking-widest text-cobalt-600 font-semibold block mb-1">
                Engineering Foundations
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                How Codebase Intelligence Works
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-md leading-relaxed">
              A high-precision RAG pipeline built from recursive AST chunking, modern embedding models, and grounded synthesis.
            </p>
          </div>

          {/* Editorial 3-Column Grid with Translucent Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.num}
                  className="glass-panel-interactive rounded-2xl p-6 sm:p-7 space-y-4 group cursor-default"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
                    <span className="text-sm font-mono font-bold text-cobalt-600">
                      {p.num}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-cobalt-50 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4 text-ink-tertiary group-hover:text-cobalt-600 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-ink group-hover:text-cobalt-700 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs font-mono text-ink-tertiary mt-0.5">
                      {p.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};
