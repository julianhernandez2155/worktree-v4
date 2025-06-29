'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField, FormTextarea, FormSelect } from './FormField';
import { Mail, Lock, User, Globe, Search, Eye, EyeOff } from 'lucide-react';

/**
 * Example usage of the FormField components
 * This file demonstrates all the different ways to use the new standardized form components
 */

export function FormFieldExamples() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors }, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: '',
      username: '',
      bio: '',
      category: '',
      website: ''
    }
  });

  const onSubmit = (data: any) => {
    console.log('Form data:', data);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold text-white mb-8">FormField Component Examples</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Input */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Basic Input</h2>
          <FormField
            label="Full Name"
            placeholder="John Doe"
            required
            register={register('fullName', { required: 'Full name is required' })}
            error={errors.fullName}
            hint="Enter your full legal name"
          />
        </section>

        {/* Input with Icon in Label */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Input with Icon in Label</h2>
          <FormField
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="john@example.com"
            required
            register={register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email}
          />
        </section>

        {/* Input with Prefix Icon (no label) */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Input with Prefix Icon</h2>
          <FormField
            type="text"
            icon={User}
            placeholder="@username"
            register={register('username', {
              required: 'Username is required',
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: 'Username can only contain lowercase letters, numbers, and hyphens'
              }
            })}
            error={errors.username}
            hint="Your unique identifier on the platform"
          />
        </section>

        {/* Password Input with Toggle */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Password with Toggle</h2>
          <FormField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            placeholder="Enter your password"
            required
            register={register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            error={errors.password}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </section>

        {/* Search Input */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Search Input</h2>
          <FormField
            type="search"
            icon={Search}
            placeholder="Search..."
            containerClassName="max-w-md"
          />
        </section>

        {/* URL Input */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">URL Input</h2>
          <FormField
            label="Website"
            type="url"
            icon={Globe}
            placeholder="https://example.com"
            register={register('website', {
              pattern: {
                value: /^https?:\/\/.+\..+/,
                message: 'Please enter a valid URL'
              }
            })}
            error={errors.website}
          />
        </section>

        {/* Textarea */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Textarea</h2>
          <FormTextarea
            label="Bio"
            placeholder="Tell us about yourself..."
            rows={4}
            register={register('bio', {
              maxLength: {
                value: 500,
                message: 'Bio must be less than 500 characters'
              }
            })}
            error={errors.bio}
            hint="Maximum 500 characters"
          />
        </section>

        {/* Select with Options */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Select with Options</h2>
          <FormSelect
            label="Category"
            required
            register={register('category', { required: 'Please select a category' })}
            error={errors.category}
            options={[
              { value: '', label: 'Select a category' },
              { value: 'academic', label: 'Academic' },
              { value: 'cultural', label: 'Cultural' },
              { value: 'engineering', label: 'Engineering' },
              { value: 'professional', label: 'Professional' },
              { value: 'social', label: 'Social' },
              { value: 'sports', label: 'Sports' },
              { value: 'volunteer', label: 'Volunteer' }
            ]}
          />
        </section>

        {/* Custom Styled Input */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Custom Styled Input</h2>
          <FormField
            label="Custom Input"
            placeholder="With custom classes"
            className="py-3 text-lg"
            containerClassName="bg-dark-card p-4 rounded-lg"
            labelClassName="text-neon-green"
            helperTextClassName="text-xs"
            hint="This input has custom styling applied"
          />
        </section>

        {/* Number Input */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Number Input</h2>
          <FormField
            label="Age"
            type="number"
            placeholder="Enter your age"
            min="18"
            max="100"
            register={register('age', {
              required: 'Age is required',
              min: { value: 18, message: 'Must be at least 18' },
              max: { value: 100, message: 'Must be less than 100' }
            })}
            error={errors.age}
          />
        </section>

        {/* Date Input */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Date Input</h2>
          <FormField
            label="Start Date"
            type="date"
            register={register('startDate')}
            hint="When will you start?"
          />
        </section>

        {/* Form with Field Focus Callbacks */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">With Focus Tracking</h2>
          <FormField
            label="Tracked Input"
            placeholder="Focus tracking enabled"
            onFieldFocus={(field) => console.log('Focused:', field)}
            onFieldBlur={() => console.log('Blurred')}
          />
        </section>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green/90 transition-colors"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
}