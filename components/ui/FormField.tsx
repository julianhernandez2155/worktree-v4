import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
            {required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 bg-dark-surface border rounded-lg text-white',
            'placeholder-gray-500 transition-all duration-200',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-dark-border focus:ring-neon-green/50 focus:border-neon-green/50',
            className
          )}
          {...props}
        />
        
        {(error || hint) && (
          <div className={cn('text-sm', error ? 'text-red-400' : 'text-gray-500')}>
            {error && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {hint && !error && <span>{hint}</span>}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Textarea variant
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
            {required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2 bg-dark-surface border rounded-lg text-white',
            'placeholder-gray-500 transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-dark-border focus:ring-neon-green/50 focus:border-neon-green/50',
            className
          )}
          {...props}
        />
        
        {(error || hint) && (
          <div className={cn('text-sm', error ? 'text-red-400' : 'text-gray-500')}>
            {error && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {hint && !error && <span>{hint}</span>}
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';