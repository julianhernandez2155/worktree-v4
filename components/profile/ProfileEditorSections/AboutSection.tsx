'use client';

import { BookOpen, GraduationCap, Calendar } from 'lucide-react';

interface AboutSectionProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  onFieldFocus: (field: string) => void;
}

const MAJORS = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Data Science',
  'Computer Engineering',
  'Business Administration',
  'Marketing',
  'Finance',
  'Economics',
  'Psychology',
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Statistics',
  'Political Science',
  'Communications',
  'Journalism',
  'Graphic Design',
  'Other'
];

const YEARS = [
  '2024',
  '2025',
  '2026',
  '2027',
  '2028'
];

export function AboutSection({ 
  register, 
  errors, 
  watch, 
  setValue, 
  onFieldFocus 
}: AboutSectionProps) {
  const bio = watch('bio');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">About You</h2>
      
      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <BookOpen className="inline w-4 h-4 mr-1" />
          Bio
        </label>
        <textarea
          {...register('bio')}
          onFocus={() => onFieldFocus('bio')}
          rows={4}
          className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green resize-none"
          placeholder="Tell us about yourself, your passions, and what drives you..."
        />
        <div className="mt-1 flex justify-between text-sm">
          <p className="text-gray-400">
            Write a compelling bio that showcases your personality and goals
          </p>
          <span className={`${bio?.length > 500 ? 'text-red-400' : 'text-gray-400'}`}>
            {bio?.length || 0}/500
          </span>
        </div>
      </div>

      {/* Major */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <GraduationCap className="inline w-4 h-4 mr-1" />
          Major
        </label>
        <select
          {...register('major', { required: 'Please select your major' })}
          onFocus={() => onFieldFocus('major')}
          className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
        >
          <option value="">Select your major</option>
          {MAJORS.map(major => (
            <option key={major} value={major}>{major}</option>
          ))}
        </select>
        {errors.major && (
          <p className="mt-1 text-sm text-red-400">{errors.major.message}</p>
        )}
      </div>

      {/* Year of Study */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          Expected Graduation Year
        </label>
        <select
          {...register('year_of_study', { required: 'Please select your graduation year' })}
          onFocus={() => onFieldFocus('year_of_study')}
          className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
        >
          <option value="">Select graduation year</option>
          {YEARS.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        {errors.year_of_study && (
          <p className="mt-1 text-sm text-red-400">{errors.year_of_study.message}</p>
        )}
      </div>
    </div>
  );
}