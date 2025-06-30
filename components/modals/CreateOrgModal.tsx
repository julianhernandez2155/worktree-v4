'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Building, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Modal } from '@/components/ui/Modal';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface CreateOrgModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (org: any) => void;
}

const CATEGORIES = [
  'Academic',
  'Arts & Culture',
  'Business & Entrepreneurship',
  'Community Service',
  'Environmental',
  'Gaming & Esports',
  'Health & Wellness',
  'Honor Society',
  'International & Cultural',
  'Media & Publications',
  'Political & Advocacy',
  'Professional Development',
  'Religious & Spiritual',
  'Social & Recreational',
  'Sports & Athletics',
  'STEM',
  'Technology',
  'Other'
];

export function CreateOrgModal({ open, onClose, onSuccess }: CreateOrgModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    logo: null as File | null
  });

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create an organization');

      let logoUrl = null;

      // Upload logo if provided
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${formData.slug}-logo-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('org-logos')
          .upload(fileName, formData.logo);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('org-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: formData.slug,
          category: formData.category,
          description: formData.description,
          logo_url: logoUrl,
          admin_id: user.id,
          verified: false // Start unverified
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as admin member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Success!
      if (onSuccess) {
        onSuccess(orgData);
      }
      
      // Redirect to new org dashboard
      router.push(`/dashboard/org/${orgData.slug}`);
      onClose();
      
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Organization</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-card transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input-field"
              placeholder="e.g. Syracuse Robotics Club"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/org/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="input-field flex-1"
                placeholder="syracuse-robotics"
                pattern="[a-z0-9-]+"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field min-h-[100px]"
              placeholder="Brief description of your organization..."
              required
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Organization Logo (Optional)
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className={cn(
                "w-20 h-20 rounded-lg border-2 border-dashed border-dark-border",
                "flex items-center justify-center",
                logoPreview && "border-solid"
              )}>
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <Building className="w-8 h-8 text-gray-600" />
                )}
              </div>

              {/* Upload button */}
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="btn btn-secondary flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <NeonButton
              type="submit"
              disabled={loading}
              loading={loading}
              className="flex-1"
            >
              Create Organization
            </NeonButton>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}