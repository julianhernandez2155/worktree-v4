import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
  title?: string;
}

export function ErrorMessage({ 
  error, 
  onRetry, 
  className,
  title = 'Something went wrong' 
}: ErrorMessageProps) {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={cn(
      "bg-red-500/10 border border-red-500/30 rounded-lg p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-400">{title}</h3>
          <p className="text-sm text-gray-300 mt-1">{errorMessage}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 
                   hover:text-red-300 border border-red-500/30 hover:border-red-500/50 
                   rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}