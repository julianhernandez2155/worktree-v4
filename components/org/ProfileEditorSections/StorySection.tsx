'use client';

import { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface StorySectionProps {
  form: UseFormReturn<any>;
  onFieldFocus?: (field: string | null) => void;
}

export function StorySection({ form, onFieldFocus }: StorySectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const values = watch('values') || [''];
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);

  const addValue = () => {
    const currentValues = watch('values');
    setValue('values', [...currentValues, '']);
    // Trigger focus to highlight the values section
    onFieldFocus?.('values');
    setTimeout(() => onFieldFocus?.(null), 1000);
  };

  const removeValue = (index: number) => {
    const currentValues = watch('values');
    setValue('values', currentValues.filter((_: string, i: number) => i !== index));
  };

  const generateMissionSuggestions = async () => {
    setIsGeneratingMission(true);
    // TODO: Implement AI mission generation
    // For now, just show a placeholder
    setTimeout(() => {
      alert('AI mission generation coming soon!');
      setIsGeneratingMission(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Craft Your Story</h2>
        <p className="text-gray-400 text-sm">
          Help students understand your organization's purpose and values.
        </p>
      </div>

      {/* Mission Statement */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Our Mission
          </label>
          <button
            type="button"
            onClick={generateMissionSuggestions}
            disabled={isGeneratingMission}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-500/20 text-purple-400 
                     border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3 h-3" />
            {isGeneratingMission ? 'Generating...' : 'Need inspiration?'}
          </button>
        </div>
        <textarea
          {...register('mission')}
          onFocus={() => onFieldFocus?.('mission')}
          onBlur={() => onFieldFocus?.(null)}
          rows={3}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white 
                   focus:outline-none focus:ring-2 focus:ring-neon-green transition-all resize-none"
          placeholder="What is the ultimate purpose of your organization? What impact do you want to make?"
        />
        <p className="mt-2 text-xs text-gray-500">
          A clear mission helps students understand if your organization aligns with their goals
        </p>
      </div>

      {/* What We Do */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          What We Do
        </label>
        <textarea
          {...register('what_we_do')}
          onFocus={() => onFieldFocus?.('what_we_do')}
          onBlur={() => onFieldFocus?.(null)}
          rows={3}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white 
                   focus:outline-none focus:ring-2 focus:ring-neon-green transition-all resize-none"
          placeholder="Describe your typical activities. Do you build things, host events, compete, discuss topics?"
        />
        <p className="mt-2 text-xs text-gray-500">
          Give specific examples of projects, events, or activities members participate in
        </p>
      </div>

      {/* Our Values */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Our Values
        </label>
        <p className="text-xs text-gray-500 mb-3">
          What principles guide your organization? (Add up to 5)
        </p>
        <div className="space-y-2">
          {values.map((value: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                {...register(`values.${index}` as const)}
                onFocus={() => onFieldFocus?.('values')}
                onBlur={() => onFieldFocus?.(null)}
                className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg 
                         text-white focus:outline-none focus:ring-2 focus:ring-neon-green transition-all"
                placeholder={`Value ${index + 1} (e.g., Innovation, Collaboration, Excellence)`}
              />
              {values.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {values.length < 5 && (
            <button
              type="button"
              onClick={addValue}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white 
                       bg-dark-surface hover:bg-dark-card border border-dark-border rounded-lg 
                       transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Another Value
            </button>
          )}
        </div>
      </div>
    </div>
  );
}