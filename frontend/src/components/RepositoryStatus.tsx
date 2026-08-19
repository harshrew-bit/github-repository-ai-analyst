import React from 'react';
import { CheckCircle2, Layers, Database, ExternalLink, GitFork } from 'lucide-react';
import { IndexResponse } from '../types/api';

interface RepositoryStatusProps {
  data: IndexResponse;
}

export const RepositoryStatus: React.FC<RepositoryStatusProps> = ({ data }) => {
  const isAlreadyIndexed = data.message?.includes('already indexed');

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-sm animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-[#f0f6fc]">
                {data.repository}
              </span>
              <a
                href={`https://github.com/${data.repository}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                title="Open repository on GitHub"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-[#8b949e]">
              Active vector index target
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-xs font-medium text-[#3fb950] bg-[#238636]/15 border border-[#238636]/30 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          {isAlreadyIndexed ? 'Already Indexed' : 'Indexed'}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
          <span className="text-[#8b949e] flex items-center mb-1">
            <Layers className="w-3 h-3 mr-1 text-[#58a6ff]" />
            Indexed Chunks
          </span>
          <span className="text-sm font-semibold text-[#f0f6fc]">
            {data.chunks.toLocaleString()}
          </span>
        </div>

        <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d] sm:col-span-2">
          <span className="text-[#8b949e] flex items-center mb-1">
            <Database className="w-3 h-3 mr-1 text-[#d29922]" />
            ChromaDB Collection
          </span>
          <span className="text-xs font-mono text-[#f0f6fc] break-all">
            {data.collection}
          </span>
        </div>
      </div>
    </div>
  );
};
