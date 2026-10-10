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
      case 'not_found': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'auth':      return <ShieldAlert   className="w-4 h-4 text-error"   />;
      case 'network':   return <WifiOff        className="w-4 h-4 text-error"   />;
      default:          return <AlertCircle   className="w-4 h-4 text-error"   />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'not_found': return 'Repository Not Found';
      case 'auth':      return 'GitHub Authentication or Rate Limit Issue';
      case 'network':   return 'Backend API Unavailable';
      default:          return 'Operation Failed';
    }
  };

  const bgClass =
    variant === 'not_found'
      ? 'bg-warning-light border-warning/20'
      : 'bg-error-light border-error/20';

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 sm:p-5 space-y-3 animate-fade-up ${bgClass}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-ink">
            {title ?? getDefaultTitle()}
          </h4>
          <p className="text-xs text-ink-secondary leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="btn-ghost text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
