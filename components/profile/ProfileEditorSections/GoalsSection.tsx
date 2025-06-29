'use client';

import { Plus, X, Target, Heart } from 'lucide-react';

interface GoalsSectionProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  onFieldFocus: (field: string) => void;
}

const INTEREST_SUGGESTIONS = [
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Product Management',
  'Entrepreneurship',
  'Marketing',
  'Finance',
  'Consulting',
  'Research',
  'Public Speaking',
  'Writing',
  'Photography',
  'Video Production'
];

const LOOKING_FOR_OPTIONS = [
  'Internships',
  'Research Opportunities',
  'Project Collaborations',
  'Mentorship',
  'Leadership Roles',
  'Hackathon Teams',
  'Study Groups',
  'Networking',
  'Skill Development',
  'Career Guidance'
];

export function GoalsSection({ 
  register, 
  errors, 
  watch, 
  setValue, 
  onFieldFocus 
}: GoalsSectionProps) {
  const interests = watch('interests') || [];
  const lookingFor = watch('looking_for') || [];

  const addInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setValue('interests', [...interests, interest]);
    }
  };

  const removeInterest = (index: number) => {
    setValue('interests', interests.filter((_: string, i: number) => i !== index));
  };

  const toggleLookingFor = (option: string) => {
    if (lookingFor.includes(option)) {
      setValue('looking_for', lookingFor.filter((item: string) => item !== option));
    } else {
      setValue('looking_for', [...lookingFor, option]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">Goals & Interests</h2>
      
      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Heart className="inline w-4 h-4 mr-1" />
          Your Interests
        </label>
        
        {/* Current interests */}
        <div className="flex flex-wrap gap-2 mb-3">
          {interests.map((interest: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-dark-surface text-gray-300 rounded-full text-sm flex items-center gap-1"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(index)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Interest suggestions */}
        <p className="text-sm text-gray-400 mb-2">Click to add interests:</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_SUGGESTIONS.filter(s => !interests.includes(s)).map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                addInterest(suggestion);
                onFieldFocus('interests');
              }}
              className="px-3 py-1 bg-dark-surface/50 hover:bg-dark-surface text-gray-400 hover:text-white rounded-full text-sm transition-colors"
            >
              <Plus className="inline w-3 h-3 mr-1" />
              {suggestion}
            </button>
          ))}
        </div>

        {/* Custom interest input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Add custom interest..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !interests.includes(value)) {
                  addInterest(value);
                  e.currentTarget.value = '';
                }
              }
            }}
            className="flex-1 px-3 py-1 bg-dark-surface border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-green"
          />
        </div>
      </div>

      {/* Looking For */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Target className="inline w-4 h-4 mr-1" />
          What are you looking for?
        </label>
        <p className="text-sm text-gray-400 mb-3">
          Select all that apply to help others understand how they can connect with you
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {LOOKING_FOR_OPTIONS.map(option => (
            <label
              key={option}
              className={`
                flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all
                ${lookingFor.includes(option) 
                  ? 'bg-neon-green/20 border-neon-green text-white' 
                  : 'bg-dark-surface border-dark-border text-gray-300 hover:text-white hover:border-gray-600'
                }
                border
              `}
            >
              <input
                type="checkbox"
                checked={lookingFor.includes(option)}
                onChange={() => {
                  toggleLookingFor(option);
                  onFieldFocus('looking_for');
                }}
                className="hidden"
              />
              <div className={`
                w-4 h-4 rounded border-2 flex items-center justify-center
                ${lookingFor.includes(option) 
                  ? 'border-neon-green bg-neon-green' 
                  : 'border-gray-500'
                }
              `}>
                {lookingFor.includes(option) && (
                  <div className="w-2 h-2 bg-black rounded-sm" />
                )}
              </div>
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}