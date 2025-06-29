'use client';

import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { createClient } from '@/lib/supabase/client';
import { AvatarFallback } from '@/components/ui/avatar-fallback';

interface MediaSectionProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  onFieldFocus: (field: string) => void;
  onFieldBlur: () => void;
  currentAvatar?: string;
  currentCover?: string;
}

export function MediaSection({ 
  control, 
  setValue, 
  watch,
  onFieldFocus, 
  onFieldBlur,
  currentAvatar,
  currentCover
}: MediaSectionProps) {
  const [showAvatarCropper, setShowAvatarCropper] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const [avatarToCrop, setAvatarToCrop] = useState<string | null>(null);
  const [coverToCrop, setCoverToCrop] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const supabase = createClient();

  const profileName = watch('full_name');

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarToCrop(reader.result as string);
        setShowAvatarCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverToCrop(reader.result as string);
        setShowCoverCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (base64Image: string, path: string) => {
    const base64Data = base64Image.split(',')[1];
    
    // Convert base64 to blob for browser environment
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleAvatarCrop = async (croppedImage: string) => {
    setIsUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const publicUrl = await uploadImage(croppedImage, `${user.id}/avatar.png`);
      setValue('avatar_url', publicUrl);
      setShowAvatarCropper(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverCrop = async (croppedImage: string) => {
    setIsUploadingCover(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const publicUrl = await uploadImage(croppedImage, `${user.id}/cover.png`);
      setValue('cover_photo_url', publicUrl);
      setShowCoverCropper(false);
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      alert('Failed to upload cover photo. Please try again.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Profile Photos</h3>
        <p className="text-sm text-gray-400 mb-6">
          Upload your avatar and cover photo to personalize your profile
        </p>
      </div>

      {/* Cover Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cover Photo
        </label>
        <div 
          className="relative h-48 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-neon-green/20 rounded-lg overflow-hidden group cursor-pointer"
          onFocus={() => onFieldFocus('cover_photo_url')}
          onBlur={onFieldBlur}
        >
          {currentCover && (
            <Image
              src={currentCover}
              alt="Cover photo"
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-4 py-2 bg-dark-card/80 backdrop-blur-sm rounded-lg hover:bg-dark-card transition-colors">
                <Camera className="w-5 h-5" />
                <span>Change Cover Photo</span>
              </div>
            </label>
          </div>
          {isUploadingCover && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Recommended size: 1500x160px (9.4:1 ratio)
        </p>
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div 
            className="relative group"
            onFocus={() => onFieldFocus('avatar_url')}
            onBlur={onFieldBlur}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden bg-dark-surface">
              {currentAvatar ? (
                <Image
                  src={currentAvatar}
                  alt="Avatar"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback
                  name={profileName}
                  className="w-full h-full"
                  size={128}
                />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                <div className="p-3 bg-dark-card/80 backdrop-blur-sm rounded-full hover:bg-dark-card transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
              </label>
            </div>
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/75 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Upload a professional photo</p>
            <p className="text-xs text-gray-500">JPG, PNG. Max size 5MB</p>
          </div>
        </div>
      </div>

      {/* Image Croppers */}
      {showAvatarCropper && avatarToCrop && (
        <ImageCropper
          image={avatarToCrop}
          onCropComplete={handleAvatarCrop}
          onCancel={() => setShowAvatarCropper(false)}
          aspectRatio={1}
          cropShape="round"
        />
      )}

      {showCoverCropper && coverToCrop && (
        <ImageCropper
          image={coverToCrop}
          onCropComplete={handleCoverCrop}
          onCancel={() => setShowCoverCropper(false)}
          aspectRatio={9.4/1}
          cropShape="rect"
        />
      )}
    </div>
  );
}