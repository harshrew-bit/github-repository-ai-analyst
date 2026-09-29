import React from 'react';
import { AlertCircle, AlertTriangle, WifiOff, ShieldAlert, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'general' | 'auth' | 'not_found' | 'network';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  variant = 'general',
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'not_found':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'auth':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'network':
        return <WifiOff className="w-5 h-5 text-rose-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'not_found':
        return 'Repository Not Found';
      case 'auth':
        return 'GitHub Authentication or Rate Limit Issue';
      case 'network':
        return 'Backend API Unavailable';
      default:
        return 'Operation Failed';
    }
  };

  return (
    <div className="bg-surface-100 border border-surface-border rounded-xl p-5 shadow-lg space-y-3 animate-fade-in">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-surface-50 border border-surface-border flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {title || getDefaultTitle()}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-200 hover:bg-surface-300 border border-surface-border text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
