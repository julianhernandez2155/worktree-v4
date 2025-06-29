'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Globe, Linkedin, Github, MapPin } from 'lucide-react';

interface AboutSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  onFieldFocus: (field: string) => void;
  onFieldBlur: () => void;
}

export function AboutSection({ 
  register, 
  errors,
  onFieldFocus,
  onFieldBlur
}: AboutSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">About You</h3>
        <p className="text-sm text-gray-400">
          Tell others about yourself and how to connect with you
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            {...register('bio', {
              maxLength: {
                value: 500,
                message: 'Bio must be 500 characters or less'
              }
            })}
            rows={4}
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors resize-none"
            placeholder="Tell us about yourself, your interests, and what drives you..."
            onFocus={() => onFieldFocus('bio')}
            onBlur={onFieldBlur}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-400">{String(errors.bio.message)}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            A brief introduction about yourself (max 500 characters)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Location
          </label>
          <input
            {...register('location')}
            type="text"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="Syracuse, NY"
            onFocus={() => onFieldFocus('location')}
            onBlur={onFieldBlur}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Globe className="inline w-4 h-4 mr-1" />
            Personal Website
          </label>
          <input
            {...register('website', {
              pattern: {
                value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                message: 'Please enter a valid URL'
              }
            })}
            type="url"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="https://johndoe.com"
            onFocus={() => onFieldFocus('website')}
            onBlur={onFieldBlur}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-400">{String(errors.website.message)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Linkedin className="inline w-4 h-4 mr-1" />
            LinkedIn Profile
          </label>
          <input
            {...register('linkedin_url', {
              pattern: {
                value: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
                message: 'Please enter a valid LinkedIn profile URL'
              }
            })}
            type="url"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="https://linkedin.com/in/johndoe"
            onFocus={() => onFieldFocus('linkedin_url')}
            onBlur={onFieldBlur}
          />
          {errors.linkedin_url && (
            <p className="mt-1 text-sm text-red-400">{String(errors.linkedin_url.message)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Github className="inline w-4 h-4 mr-1" />
            GitHub Profile
          </label>
          <input
            {...register('github_url', {
              pattern: {
                value: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/,
                message: 'Please enter a valid GitHub profile URL'
              }
            })}
            type="url"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="https://github.com/johndoe"
            onFocus={() => onFieldFocus('github_url')}
            onBlur={onFieldBlur}
          />
          {errors.github_url && (
            <p className="mt-1 text-sm text-red-400">{String(errors.github_url.message)}</p>
          )}
        </div>
      </div>
    </div>
  );
}