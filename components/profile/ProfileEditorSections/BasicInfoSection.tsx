'use client';

import { useState } from 'react';
import { Upload, User, AtSign, AlertCircle, Camera } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ImageCropper } from '@/components/ui/ImageCropper';

interface BasicInfoSectionProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  onFieldFocus: (field: string) => void;
  profile: any;
}

export function BasicInfoSection({ 
  register, 
  errors, 
  watch, 
  setValue, 
  onFieldFocus,
  profile 
}: BasicInfoSectionProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const currentAvatar = watch('avatar_url');
  const currentUsername = watch('username');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be less than 5MB');
      return;
    }

    // Read file and open cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const supabase = createClient();
      
      // Delete old avatar if exists
      if (currentAvatar && currentAvatar.includes('avatars/')) {
        const oldPath = currentAvatar.split('avatars/')[1];
        await supabase.storage.from('avatars').remove([`${profile.id}/${oldPath}`]);
      }

      // Upload new avatar
      const timestamp = Date.now();
      const fileName = `${profile.id}/avatar-${timestamp}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setValue('avatar_url', publicUrl);
      setShowCropper(false);
      setSelectedImage(null);
    } catch (error: any) {
      setAvatarError(error.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Check username availability
  const checkUsername = async (username: string) => {
    if (!username || username === profile.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();

      setUsernameAvailable(!data);
    } catch (error) {
      // Error means username not found, so it's available
      setUsernameAvailable(true);
    } finally {
      setCheckingUsername(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
      
      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-surface">
              {currentAvatar ? (
                <Image
                  src={currentAvatar}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2 bg-neon-green text-black rounded-full cursor-pointer hover:bg-neon-green/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">
              Upload a professional photo that represents you well
            </p>
            {avatarError && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {avatarError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <User className="inline w-4 h-4 mr-1" />
          Full Name
        </label>
        <input
          {...register('full_name', { required: 'Full name is required' })}
          onFocus={() => onFieldFocus('full_name')}
          className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <AtSign className="inline w-4 h-4 mr-1" />
          Username
        </label>
        <div className="relative">
          <input
            {...register('username', { 
              required: 'Username is required',
              pattern: {
                value: /^[a-z0-9._-]+$/,
                message: 'Username can only contain lowercase letters, numbers, dots, underscores, and hyphens'
              },
              onChange: (e) => checkUsername(e.target.value)
            })}
            onFocus={() => onFieldFocus('username')}
            className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
            placeholder="johndoe"
          />
          {checkingUsername && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!checkingUsername && usernameAvailable !== null && currentUsername !== profile.username && (
            <div className="absolute right-3 top-3">
              {usernameAvailable ? (
                <div className="text-neon-green">✓</div>
              ) : (
                <div className="text-red-400">✗</div>
              )}
            </div>
          )}
        </div>
        {errors.username && (
          <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
        )}
        {!checkingUsername && usernameAvailable === false && (
          <p className="mt-1 text-sm text-red-400">This username is already taken</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          Your profile URL will be: /u/{currentUsername || 'username'}
        </p>
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Professional Tagline
        </label>
        <input
          {...register('tagline')}
          onFocus={() => onFieldFocus('tagline')}
          className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
          placeholder="Aspiring Software Engineer | AI Enthusiast | Syracuse '26"
        />
        <p className="mt-1 text-sm text-gray-400">
          A short headline that captures your professional identity
        </p>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
          }}
          aspectRatio={1}
          cropShape="round"
        />
      )}
    </div>
  );
}