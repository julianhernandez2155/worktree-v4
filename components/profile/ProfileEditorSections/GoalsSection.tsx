'use client';

import { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { Control, UseFormRegister, Controller } from 'react-hook-form';

interface GoalsSectionProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  onFieldFocus: (field: string) => void;
  onFieldBlur: () => void;
}

const LOOKING_FOR_OPTIONS = [
  'Internships',
  'Research Opportunities',
  'Project Collaborations',
  'Mentorship',
  'Full-time Positions',
  'Part-time Work',
  'Volunteer Work',
  'Networking',
  'Skill Development',
  'Leadership Roles'
];

export function GoalsSection({ control, register, onFieldFocus, onFieldBlur }: GoalsSectionProps) {
  const [newInterest, setNewInterest] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Goals & Interests</h3>
        <p className="text-sm text-gray-400">
          Share what you're passionate about and what opportunities you're seeking
        </p>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Interests
        </label>
        <Controller
          name="interests"
          control={control}
          render={({ field }) => (
            <div 
              className="space-y-3"
              onFocus={() => onFieldFocus('interests')}
              onBlur={onFieldBlur}
            >
              <div className="flex flex-wrap gap-2">
                {field.value.map((interest: string, index: number) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-dark-surface rounded-full hover:bg-dark-card transition-colors"
                  >
                    <span className="text-sm">{interest}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newInterests = [...field.value];
                        newInterests.splice(index, 1);
                        field.onChange(newInterests);
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newInterest.trim()) {
                        field.onChange([...field.value, newInterest.trim()]);
                        setNewInterest('');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
                  placeholder="Add an interest (e.g., Machine Learning, Web Development)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newInterest.trim()) {
                      field.onChange([...field.value, newInterest.trim()]);
                      setNewInterest('');
                    }
                  }}
                  disabled={!newInterest.trim()}
                  className="p-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-xs text-gray-500">
                Press Enter or click + to add interests
              </p>
            </div>
          )}
        />
      </div>

      {/* Looking For */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          What are you looking for?
        </label>
        <Controller
          name="looking_for"
          control={control}
          render={({ field }) => (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              onFocus={() => onFieldFocus('looking_for')}
              onBlur={onFieldBlur}
            >
              {LOOKING_FOR_OPTIONS.map(option => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg hover:bg-dark-card transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={field.value.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        field.onChange([...field.value, option]);
                      } else {
                        field.onChange(field.value.filter((v: string) => v !== option));
                      }
                    }}
                    className="w-4 h-4 text-neon-green bg-dark-surface border-dark-border rounded focus:ring-neon-green focus:ring-offset-0"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}
        />
      </div>

      {/* Open to Opportunities */}
      <div>
        <label 
          className="flex items-center gap-4 p-4 bg-dark-surface rounded-lg hover:bg-dark-card transition-colors cursor-pointer"
          onFocus={() => onFieldFocus('open_to_opportunities')}
          onBlur={onFieldBlur}
        >
          <input
            type="checkbox"
            {...register('open_to_opportunities')}
            className="w-5 h-5 text-neon-green bg-dark-surface border-dark-border rounded focus:ring-neon-green focus:ring-offset-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">Open to Opportunities</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Let organizations know you're actively looking for opportunities
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}