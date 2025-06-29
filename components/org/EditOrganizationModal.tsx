'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Globe, 
  Mail, 
  MapPin,
  Calendar,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: any;
  onUpdate: () => void;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  mission: string;
  what_we_do: string;
  values: string[];
  email: string;
  website: string;
  location: string;
  meeting_schedule: string;
  join_process: string;
  social_links: Array<{ platform: string; url: string }>;
}

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'discord', label: 'Discord', icon: MessageCircle },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

const CATEGORIES = [
  'academic',
  'cultural',
  'engineering',
  'professional',
  'social',
  'sports',
  'volunteer',
  'other'
];

export function EditOrganizationModal({ 
  isOpen, 
  onClose, 
  organization,
  onUpdate 
}: EditOrganizationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: organization.name || '',
      description: organization.description || '',
      category: organization.category || 'other',
      mission: organization.mission || '',
      what_we_do: organization.what_we_do || '',
      values: organization.values || ['', '', ''],
      email: organization.email || '',
      website: organization.website || '',
      location: organization.location || '',
      meeting_schedule: organization.meeting_schedule || '',
      join_process: organization.join_process || '',
      social_links: organization.social_links || []
    }
  });

  const values = watch('values');
  const socialLinks = watch('social_links');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      
      // Filter out empty values
      const filteredValues = data.values.filter(v => v.trim() !== '');
      const filteredSocialLinks = data.social_links.filter(
        link => link.platform && link.url
      );

      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: data.name,
          description: data.description,
          category: data.category,
          mission: data.mission,
          what_we_do: data.what_we_do,
          values: filteredValues,
          email: data.email,
          website: data.website,
          location: data.location,
          meeting_schedule: data.meeting_schedule,
          join_process: data.join_process,
          social_links: filteredSocialLinks,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      setSuccessMessage('Organization profile updated successfully!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update organization');
    } finally {
      setIsLoading(false);
    }
  };

  const addValue = () => {
    const currentValues = watch('values');
    setValue('values', [...currentValues, '']);
  };

  const removeValue = (index: number) => {
    const currentValues = watch('values');
    setValue('values', currentValues.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    const currentLinks = watch('social_links');
    setValue('social_links', [...currentLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    const currentLinks = watch('social_links');
    setValue('social_links', currentLinks.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <GlassCard className="relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-border">
                <h2 className="text-2xl font-bold text-white">Edit Organization Profile</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                    {successMessage}
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Organization Name
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        {...register('category', { required: 'Category is required' })}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Short Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={2}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green resize-none"
                    />
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-6 mt-8">
                  <h3 className="text-lg font-semibold text-white">About</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Our Mission
                    </label>
                    <textarea
                      {...register('mission')}
                      rows={3}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green resize-none"
                      placeholder="What is your organization's mission?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      What We Do
                    </label>
                    <textarea
                      {...register('what_we_do')}
                      rows={3}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green resize-none"
                      placeholder="Describe your organization's activities and focus areas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Our Values
                    </label>
                    <div className="space-y-2">
                      {values.map((_, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            {...register(`values.${index}` as const)}
                            className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                            placeholder={`Value ${index + 1}`}
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
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-dark-surface hover:bg-dark-card border border-dark-border rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Value
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6 mt-8">
                  <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Mail className="inline w-4 h-4 mr-1" />
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
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Globe className="inline w-4 h-4 mr-1" />
                        Website
                      </label>
                      <input
                        {...register('website')}
                        type="url"
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Location
                    </label>
                    <input
                      {...register('location')}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      placeholder="e.g., Student Union Room 301"
                    />
                  </div>
                </div>

                {/* Meeting & Joining */}
                <div className="space-y-6 mt-8">
                  <h3 className="text-lg font-semibold text-white">Meeting & Application Info</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Regular Meeting Schedule
                    </label>
                    <input
                      {...register('meeting_schedule')}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      placeholder="e.g., Thursdays at 7:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How to Join
                    </label>
                    <textarea
                      {...register('join_process')}
                      rows={2}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green resize-none"
                      placeholder="Describe your application or joining process"
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-6 mt-8">
                  <h3 className="text-lg font-semibold text-white">Social Media</h3>
                  
                  <div className="space-y-2">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <select
                          {...register(`social_links.${index}.platform` as const)}
                          className="w-40 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                        >
                          <option value="">Select...</option>
                          {SOCIAL_PLATFORMS.map(platform => (
                            <option key={platform.value} value={platform.value}>
                              {platform.label}
                            </option>
                          ))}
                        </select>
                        <input
                          {...register(`social_links.${index}.url` as const)}
                          className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                          placeholder="URL"
                        />
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {socialLinks.length < 6 && (
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-dark-surface hover:bg-dark-card border border-dark-border rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Social Link
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-dark-border">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-6 py-2 text-gray-300 hover:text-white bg-dark-card hover:bg-dark-surface border border-dark-border rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-neon-green text-black font-medium rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}