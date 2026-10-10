import React from 'react';
import { Database, ShieldCheck, Layers } from 'lucide-react';

// ─── Product visualization: shows a mini research canvas ──────────────────────
const ProductVisualization: React.FC = () => (
  <div className="relative w-full max-w-sm mx-auto select-none" aria-hidden="true">

    {/* Ambient glow */}
    <div className="absolute -inset-8 bg-cobalt-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

    <div className="relative space-y-2.5">

      {/* Card 1 — Repository + file */}
      <div className="card-lifted p-3.5 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-md bg-cobalt-50 border border-cobalt-200 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1C3.24 1 1 3.24 1 6c0 2.21 1.43 4.09 3.42 4.75.25.05.34-.11.34-.24v-.84c-1.39.3-1.68-.67-1.68-.67-.23-.58-.56-.73-.56-.73-.45-.31.04-.3.04-.3.5.04.76.51.76.51.44.76 1.16.54 1.44.41.05-.32.17-.54.31-.66-1.1-.13-2.26-.55-2.26-2.46 0-.54.19-.99.51-1.33-.05-.13-.22-.64.05-1.32 0 0 .42-.13 1.37.51.4-.11.82-.16 1.24-.16.42 0 .84.06 1.24.16.95-.65 1.37-.51 1.37-.51.27.69.1 1.2.05 1.32.32.34.51.79.51 1.33 0 1.91-1.16 2.33-2.27 2.45.18.15.33.46.33.92v1.37c0 .13.09.29.34.24A5.01 5.01 0 0011 6c0-2.76-2.24-5-5-5z" fill="#1570EF"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink truncate">psf / requests</p>
            <p className="text-2xs text-ink-tertiary font-mono">main · Python</p>
          </div>
          <span className="chip text-2xs text-success-text border-success/30 bg-success-light">
            Indexed
          </span>
        </div>

        {/* Fake file tree line */}
        <div className="rounded-lg bg-stone-50 border border-stone-200 px-3 py-2 font-mono text-2xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-ink-tertiary">
            <span className="text-stone-400">├──</span>
            <span className="text-cobalt-600 font-medium">requests/</span>
            <span className="text-stone-400">adapters.py</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-tertiary">
            <span className="text-stone-400">├──</span>
            <span className="text-cobalt-600 font-medium">requests/</span>
            <span className="text-stone-400">sessions.py</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-tertiary">
            <span className="text-stone-400">└──</span>
            <span className="text-cobalt-600 font-medium">requests/</span>
            <span className="text-stone-400">auth.py</span>
          </div>
        </div>
      </div>

      {/* Connecting line */}
      <div className="flex items-center gap-2 px-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cobalt-300 to-transparent" />
        <div className="w-5 h-5 rounded-full bg-cobalt-50 border border-cobalt-200 flex items-center justify-center flex-shrink-0">
          <Layers className="w-2.5 h-2.5 text-cobalt-500" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cobalt-300 to-transparent" />
      </div>

      {/* Card 2 — Question */}
      <div className="card-lifted p-3.5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <p className="text-2xs font-mono text-ink-tertiary mb-1.5 uppercase tracking-widest">Research question</p>
        <p className="text-sm text-ink font-medium leading-snug">
          How does the retry mechanism handle connection timeouts?
        </p>
      </div>

      {/* Card 3 — Retrieved evidence */}
      <div className="card-lifted p-3.5 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-2xs font-mono text-ink-tertiary uppercase tracking-widest">Source evidence</p>
          <span className="text-2xs font-mono text-success-text bg-success-light px-2 py-0.5 rounded-full border border-success/20">
            97.3% match
          </span>
        </div>
        <div className="rounded-lg overflow-hidden border border-charcoal-700 bg-charcoal-900">
          <div className="px-3 py-1.5 border-b border-charcoal-700 flex items-center justify-between">
            <span className="font-mono text-2xs text-stone-400">requests/adapters.py</span>
            <span className="font-mono text-2xs text-stone-600">chunk #14</span>
          </div>
          <pre className="px-3 py-2.5 text-2xs font-mono overflow-x-auto leading-relaxed">
<span className="code-keyword">def</span> <span className="code-function">send</span>(self, request, <span className="text-stone-300">**kwargs</span>):
  <span className="code-keyword">    max_retries</span> = self.max_retries
  <span className="code-keyword">    retries</span> = Retry.from_int(max_retries)
  <span className="code-comment">    # timeout backoff logic</span>
          </pre>
        </div>
      </div>

      {/* Card 4 — Generated answer excerpt */}
      <div className="card-lifted p-3.5 border-l-2 border-l-cobalt-500 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <ShieldCheck className="w-3 h-3 text-cobalt-500" />
          <p className="text-2xs font-mono text-cobalt-600 uppercase tracking-widest">Grounded answer</p>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3">
          The retry mechanism in <code className="text-2xs bg-stone-100 px-1 rounded font-mono text-cobalt-700">adapters.py</code> uses the
          <code className="text-2xs bg-stone-100 px-1 rounded font-mono text-cobalt-700">urllib3.util.Retry</code> class, configured via <code className="text-2xs bg-stone-100 px-1 rounded font-mono text-cobalt-700">max_retries</code>…
        </p>
      </div>

    </div>
  </div>
);

// ─── Architecture feature cards ────────────────────────────────────────────────
const features = [
  {
    icon: Layers,
    title: 'Semantic Chunking',
    body: 'Source files chunked at code boundaries, embedded into ChromaDB vector collections with cosine similarity indexing.',
  },
  {
    icon: Database,
    title: 'Grounded Retrieval',
    body: 'Every answer is constrained to retrieved context. No hallucination — every claim traces back to a real file and chunk.',
  },
  {
    icon: ShieldCheck,
    title: 'Source Evidence',
    body: 'Inspect the exact code excerpts, file paths, chunk IDs, and similarity scores that support each answer.',
  },
];

// ─── Main Hero ─────────────────────────────────────────────────────────────────
export const Hero: React.FC = () => {
  return (
    <section className="pt-12 pb-6 space-y-20">

      {/* ── Top badge */}
      <div className="flex justify-center">
        <div className="chip text-xs gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 flex-shrink-0" />
          Powered by Gemini Embeddings &amp; ChromaDB
        </div>
      </div>

      {/* ── Hero headline */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <h1 className="text-display-lg text-ink">
          Understand the code
          <br />
          <span className="text-cobalt-500">behind every repository.</span>
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl mx-auto">
          Explore any public codebase through natural language. Trace implementation details,
          understand architecture decisions, and get answers grounded in actual source code.
        </p>
      </div>

      {/* ── Product visualization */}
      <div className="max-w-sm mx-auto">
        <ProductVisualization />
      </div>

      {/* ── Feature row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="space-y-2.5 py-2">
              <div className="w-8 h-8 rounded-lg bg-cobalt-50 border border-cobalt-200 flex items-center justify-center">
                <Icon className="w-4 h-4 text-cobalt-500" />
              </div>
              <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
              <p className="text-xs text-ink-tertiary leading-relaxed">{f.body}</p>
            </div>
          );
        })}
      </div>

    </section>
  );
};
