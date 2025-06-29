'use client';

import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, LucideIcon } from 'lucide-react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

// Base props shared by all form field variants
interface BaseFormFieldProps {
  label?: string | undefined;
  error?: string | FieldError | undefined;
  hint?: string | undefined;
  required?: boolean | undefined;
  icon?: LucideIcon | undefined;
  rightElement?: ReactNode | undefined;
  containerClassName?: string | undefined;
  labelClassName?: string | undefined;
  helperTextClassName?: string | undefined;
  onFieldFocus?: ((field: string) => void) | undefined;
  onFieldBlur?: (() => void) | undefined;
}

// Input field props
interface FormFieldInputProps extends BaseFormFieldProps, 
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | undefined;
  register?: UseFormRegisterReturn | undefined;
}

// Textarea field props
interface FormFieldTextareaProps extends BaseFormFieldProps,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  register?: UseFormRegisterReturn | undefined;
}

// Select field props
interface FormFieldSelectProps extends BaseFormFieldProps,
  React.SelectHTMLAttributes<HTMLSelectElement> {
  register?: UseFormRegisterReturn | undefined;
  options?: Array<{ value: string; label: string }> | undefined;
}

// Helper component for labels
const FormLabel = ({ 
  label, 
  required, 
  icon: Icon,
  className 
}: { 
  label: string; 
  required?: boolean | undefined; 
  icon?: LucideIcon | undefined;
  className?: string | undefined;
}) => (
  <label className={cn(
    "block text-sm font-medium text-gray-300 mb-2",
    className
  )}>
    {Icon && <Icon className="inline w-4 h-4 mr-1" />}
    {label}
    {required && <span className="ml-1 text-red-400">*</span>}
  </label>
);

// Helper component for error/hint messages
const FormHelperText = ({ 
  error, 
  hint,
  className 
}: { 
  error?: string | FieldError | undefined; 
  hint?: string | undefined;
  className?: string | undefined;
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  if (!errorMessage && !hint) return null;
  
  return (
    <div className={cn(
      'mt-2 text-sm',
      errorMessage ? 'text-red-400' : 'text-gray-500',
      className
    )}>
      {errorMessage ? (
        <div className="flex items-start gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      ) : (
        <span>{hint}</span>
      )}
    </div>
  );
};

// Main FormField component for inputs
export const FormField = forwardRef<HTMLInputElement, FormFieldInputProps>(
  ({ 
    label, 
    error, 
    hint, 
    required, 
    icon,
    rightElement,
    containerClassName,
    labelClassName,
    helperTextClassName,
    className, 
    type = 'text',
    register,
    onFieldFocus,
    onFieldBlur,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const Icon = icon;
    
    // Merge register props if provided
    const inputProps = register ? { ...register, ...props } : props;
    
    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <FormLabel 
            label={label} 
            required={required} 
            icon={Icon}
            className={labelClassName}
          />
        )}
        
        <div className="relative">
          {Icon && !label && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
          
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full px-4 py-2 bg-dark-surface border rounded-lg text-white',
              'placeholder-gray-500 transition-all duration-200',
              'focus:outline-none focus:ring-2',
              Icon && !label && 'pl-10',
              rightElement && 'pr-10',
              hasError
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-dark-border focus:ring-neon-green/50 focus:border-neon-green/50',
              className
            )}
            onFocus={(e) => {
              onFieldFocus?.(props.name || '');
              onFocus?.(e);
            }}
            onBlur={(e) => {
              onFieldBlur?.();
              onBlur?.(e);
            }}
            {...inputProps}
          />
          
          {rightElement && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        
        <FormHelperText 
          error={error} 
          hint={hint} 
          className={helperTextClassName}
        />
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// FormTextarea component
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormFieldTextareaProps>(
  ({ 
    label, 
    error, 
    hint, 
    required,
    icon,
    containerClassName,
    labelClassName,
    helperTextClassName,
    className,
    register,
    onFieldFocus,
    onFieldBlur,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const Icon = icon;
    
    // Merge register props if provided
    const textareaProps = register ? { ...register, ...props } : props;
    
    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <FormLabel 
            label={label} 
            required={required} 
            icon={Icon}
            className={labelClassName}
          />
        )}
        
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2 bg-dark-surface border rounded-lg text-white',
            'placeholder-gray-500 transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2',
            hasError
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-dark-border focus:ring-neon-green/50 focus:border-neon-green/50',
            className
          )}
          onFocus={(e) => {
            onFieldFocus?.(props.name || '');
            onFocus?.(e);
          }}
          onBlur={(e) => {
            onFieldBlur?.();
            onBlur?.(e);
          }}
          {...textareaProps}
        />
        
        <FormHelperText 
          error={error} 
          hint={hint} 
          className={helperTextClassName}
        />
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// FormSelect component
export const FormSelect = forwardRef<HTMLSelectElement, FormFieldSelectProps>(
  ({ 
    label, 
    error, 
    hint, 
    required,
    icon,
    options,
    containerClassName,
    labelClassName,
    helperTextClassName,
    className,
    register,
    onFieldFocus,
    onFieldBlur,
    onFocus,
    onBlur,
    children,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const Icon = icon;
    
    // Merge register props if provided
    const selectProps = register ? { ...register, ...props } : props;
    
    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <FormLabel 
            label={label} 
            required={required} 
            icon={Icon}
            className={labelClassName}
          />
        )}
        
        <div className="relative">
          {Icon && !label && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
          
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-2 bg-dark-surface border rounded-lg text-white',
              'placeholder-gray-500 transition-all duration-200 appearance-none',
              'focus:outline-none focus:ring-2',
              Icon && !label && 'pl-10',
              hasError
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-dark-border focus:ring-neon-green/50 focus:border-neon-green/50',
              className
            )}
            onFocus={(e) => {
              onFieldFocus?.(props.name || '');
              onFocus?.(e);
            }}
            onBlur={(e) => {
              onFieldBlur?.();
              onBlur?.(e);
            }}
            {...selectProps}
          >
            {children || options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        <FormHelperText 
          error={error} 
          hint={hint} 
          className={helperTextClassName}
        />
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Export types for external use
export type { FormFieldInputProps, FormFieldTextareaProps, FormFieldSelectProps };