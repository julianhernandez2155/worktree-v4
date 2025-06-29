'use client';

import { UseFormReturn } from 'react-hook-form';
import { Mail, Globe } from 'lucide-react';

interface ContactSectionProps {
  form: UseFormReturn<any>;
  onFieldFocus?: (field: string | null) => void;
}

export function ContactSection({ form, onFieldFocus }: ContactSectionProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Contact Information</h2>
        <p className="text-gray-400 text-sm">
          How can interested students reach out to learn more?
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Mail className="inline w-4 h-4 mr-1" />
          Email Address
        </label>
        <input
          {...register('email', { 
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address'
            }
          })}
          onFocus={() => onFieldFocus?.('email')}
          onBlur={() => onFieldFocus?.(null)}
          type="email"
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white 
                   focus:outline-none focus:ring-2 focus:ring-neon-green transition-all"
          placeholder="contact@organization.edu"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          This will be publicly visible on your profile
        </p>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Globe className="inline w-4 h-4 mr-1" />
          Website
        </label>
        <input
          {...register('website', {
            pattern: {
              value: /^https?:\/\/.+\..+/,
              message: 'Please enter a valid URL (e.g., https://example.com)'
            }
          })}
          onFocus={() => onFieldFocus?.('website')}
          onBlur={() => onFieldFocus?.(null)}
          type="url"
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white 
                   focus:outline-none focus:ring-2 focus:ring-neon-green transition-all"
          placeholder="https://yourorg.com"
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-400">{errors.website.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Your organization's website or portal page
        </p>
      </div>

    </div>
  );
}