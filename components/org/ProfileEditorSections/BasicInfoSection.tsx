'use client';

import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { 
  GraduationCap,
  Wrench,
  Globe2,
  Briefcase,
  Users,
  Trophy,
  Heart,
  Sparkles,
  Upload,
  Camera,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { ImageCropper } from '@/components/ui/ImageCropper';

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
  onFieldFocus?: (field: string | null) => void;
  organization?: any;
}

const CATEGORIES = [
  { value: 'academic', label: 'Academic', icon: GraduationCap, color: 'text-blue-400' },
  { value: 'engineering', label: 'Engineering', icon: Wrench, color: 'text-orange-400' },
  { value: 'cultural', label: 'Cultural', icon: Globe2, color: 'text-purple-400' },
  { value: 'professional', label: 'Professional', icon: Briefcase, color: 'text-green-400' },
  { value: 'social', label: 'Social', icon: Users, color: 'text-pink-400' },
  { value: 'sports', label: 'Sports', icon: Trophy, color: 'text-yellow-400' },
  { value: 'volunteer', label: 'Volunteer', icon: Heart, color: 'text-red-400' },
  { value: 'other', label: 'Other', icon: Sparkles, color: 'text-gray-400' },
];

export function BasicInfoSection({ form, onFieldFocus, organization }: BasicInfoSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const selectedCategory = watch('category');
  const description = watch('description');
  const logoUrl = watch('logo_url');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    // Create a temporary URL for the cropper
    const url = URL.createObjectURL(file);
    setTempImageUrl(url);
    setShowCropper(true);
    setUploadError(null);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!organization?.id) return;
    
    setIsUploading(true);
    setShowCropper(false);

    try {
      const supabase = createClient();
      
      // If there's an existing logo, try to delete it from storage
      if (logoUrl && logoUrl.includes('org-logos')) {
        const oldFileName = logoUrl.split('/').slice(-2).join('/');
        await supabase.storage
          .from('org-logos')
          .remove([oldFileName])
          .catch(err => console.warn('Failed to delete old logo:', err));
      }
      
      // Create a unique file name
      const fileName = `${organization.id}/logo-${Date.now()}.jpg`;

      // Upload to Supabase storage - org-logos bucket
      const { error } = await supabase.storage
        .from('org-logos')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('org-logos')
        .getPublicUrl(fileName);

      // Update form value
      setValue('logo_url', publicUrl);
      
      // Trigger focus to highlight the header
      onFieldFocus?.('logo_url');
      setTimeout(() => onFieldFocus?.(null), 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Clean up temp URL
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  const removeLogo = () => {
    setValue('logo_url', '');
    setUploadError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">The Essentials</h2>
        <p className="text-gray-400 text-sm">
          Let's start with the basics. This information helps students find your organization.
        </p>
      </div>

      {/* Profile Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Organization Logo
        </label>
        <div className="flex items-start gap-4">
          {/* Current Logo or Placeholder */}
          <div className="relative">
            {logoUrl ? (
              <div className="relative">
                <Image
                  src={logoUrl}
                  alt="Organization logo"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 
                           rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <label className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploading}
                className="hidden"
              />
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer",
                "bg-dark-surface border border-dark-border hover:bg-dark-card",
                isUploading && "opacity-50 cursor-not-allowed"
              )}>
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-300">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </>
                )}
              </div>
            </label>
            
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG or GIF (max 5MB). Recommended: 400x400px
            </p>
            
            {uploadError && (
              <p className="mt-2 text-sm text-red-400">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Organization Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Organization Name
        </label>
        <input
          {...register('name', { required: 'Organization name is required' })}
          onFocus={() => onFieldFocus?.('name')}
          onBlur={() => onFieldFocus?.(null)}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green transition-all"
          placeholder="e.g., Syracuse Robotics Club"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name.message as string}</p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Category
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.value;
            
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => {
                  setValue('category', category.value);
                  onFieldFocus?.('category');
                  setTimeout(() => onFieldFocus?.(null), 1000);
                }}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all",
                  "hover:bg-dark-surface/50",
                  isSelected
                    ? "border-neon-green bg-dark-surface"
                    : "border-dark-border bg-dark-surface/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5", category.color)} />
                  <span className={cn(
                    "font-medium",
                    isSelected ? "text-white" : "text-gray-300"
                  )}>
                    {category.label}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-neon-green rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tagline/Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your Elevator Pitch
        </label>
        <div className="relative">
          <textarea
            {...register('description', { 
              maxLength: {
                value: 160,
                message: 'Description must be 160 characters or less'
              }
            })}
            onFocus={() => onFieldFocus?.('description')}
            onBlur={() => onFieldFocus?.(null)}
            rows={2}
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green transition-all resize-none"
            placeholder="In one sentence, what makes your organization special?"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {description?.length || 0}/160
          </div>
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description.message as string}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          This appears right under your organization name in search results
        </p>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          image={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="rect"
        />
      )}
    </div>
  );
}