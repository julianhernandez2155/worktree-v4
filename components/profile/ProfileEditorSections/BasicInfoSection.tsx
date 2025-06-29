'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface BasicInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  onFieldFocus: (field: string) => void;
  onFieldBlur: () => void;
}

export function BasicInfoSection({ 
  register, 
  errors,
  onFieldFocus,
  onFieldBlur
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Basic Information</h3>
        <p className="text-sm text-gray-400">
          Your name and how people can identify you
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            {...register('full_name', { required: 'Full name is required' })}
            type="text"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="John Doe"
            onFocus={() => onFieldFocus('full_name')}
            onBlur={onFieldBlur}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-400">{String(errors.full_name.message)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
            <input
              {...register('username', { 
                required: 'Username is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Username can only contain lowercase letters, numbers, and hyphens'
                }
              })}
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
              placeholder="johndoe"
              onFocus={() => onFieldFocus('username')}
              onBlur={onFieldBlur}
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">{String(errors.username.message)}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your unique identifier on Worktree
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="john@university.edu"
            onFocus={() => onFieldFocus('email')}
            onBlur={onFieldBlur}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{String(errors.email.message)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="+1 (555) 123-4567"
            onFocus={() => onFieldFocus('phone')}
            onBlur={onFieldBlur}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Professional Headline
          </label>
          <input
            {...register('tagline', {
              maxLength: {
                value: 100,
                message: 'Headline must be 100 characters or less'
              }
            })}
            type="text"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="Aspiring Software Engineer | CS Student | AI Enthusiast"
            onFocus={() => onFieldFocus('tagline')}
            onBlur={onFieldBlur}
          />
          {errors.tagline && (
            <p className="mt-1 text-sm text-red-400">{String(errors.tagline.message)}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            A brief professional summary that appears below your name
          </p>
        </div>
      </div>
    </div>
  );
}