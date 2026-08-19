import React, { useState } from 'react';
import { Search, Loader2, Github, AlertCircle } from 'lucide-react';

interface RepositoryInputProps {
  onIndex: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  disabled?: boolean;
}

export const RepositoryInput: React.FC<RepositoryInputProps> = ({
  onIndex,
  isLoading,
  error,
  disabled = false,
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onIndex(url.trim());
  };

  const handleQuickSelect = (exampleUrl: string) => {
    setUrl(exampleUrl);
    onIndex(exampleUrl);
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <label
            htmlFor="repository-url"
            className="block text-sm font-medium text-[#f0f6fc]"
          >
            GitHub Repository URL
          </label>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Index any public GitHub repository into ChromaDB vector collections
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b949e]">
            <Github className="w-4 h-4" />
          </div>
          <input
            id="repository-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/psf/requests"
            disabled={isLoading || disabled}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-10 pr-32 py-2.5 text-sm text-[#f0f6fc] placeholder-[#8b949e]/60 focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!url.trim() || isLoading || disabled}
            className="absolute right-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Analyze Repository
              </>
            )}
          </button>
        </div>

        {/* Preset quick examples */}
        <div className="flex items-center space-x-2 text-xs text-[#8b949e] pt-1">
          <span>Try popular repos:</span>
          <button
            type="button"
            onClick={() => handleQuickSelect('https://github.com/psf/requests')}
            disabled={isLoading}
            className="text-[#58a6ff] hover:underline bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] disabled:opacity-50"
          >
            psf/requests
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('https://github.com/tiangolo/fastapi')}
            disabled={isLoading}
            className="text-[#58a6ff] hover:underline bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] disabled:opacity-50"
          >
            tiangolo/fastapi
          </button>
        </div>

        {error && (
          <div className="flex items-start space-x-2 text-xs text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/20 rounded-lg p-3 mt-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error analyzing repository</p>
              <p className="text-[#f0f6fc]/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
