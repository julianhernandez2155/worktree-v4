'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface AcademicSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  onFieldFocus: (field: string) => void;
  onFieldBlur: () => void;
}

const YEAR_OPTIONS = [
  { value: 'freshman', label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'graduate', label: 'Graduate Student' },
  { value: 'alumni', label: 'Alumni' }
];

export function AcademicSection({ register, errors, onFieldFocus, onFieldBlur }: AcademicSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Academic Information</h3>
        <p className="text-sm text-gray-400">
          Tell us about your academic background
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Major
          </label>
          <input
            {...register('major')}
            type="text"
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            placeholder="Computer Science"
            onFocus={() => onFieldFocus('major')}
            onBlur={onFieldBlur}
          />
          {errors.major && (
            <p className="mt-1 text-sm text-red-400">{String(errors.major.message)}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your field of study or concentration
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Year of Study
          </label>
          <select
            {...register('year_of_study')}
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-neon-green focus:outline-none transition-colors"
            onFocus={() => onFieldFocus('year_of_study')}
            onBlur={onFieldBlur}
          >
            <option value="">Select your year</option>
            {YEAR_OPTIONS.map(year => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
          {errors.year_of_study && (
            <p className="mt-1 text-sm text-red-400">{String(errors.year_of_study.message)}</p>
          )}
        </div>
      </div>
    </div>
  );
}