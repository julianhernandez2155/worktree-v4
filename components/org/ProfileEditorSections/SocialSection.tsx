'use client';

import { UseFormReturn } from 'react-hook-form';
import { 
  Trash2, 
  Instagram, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  Link as LinkIcon
} from 'lucide-react';

interface SocialSectionProps {
  form: UseFormReturn<any>;
  onFieldFocus?: (field: string | null) => void;
}

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', placeholder: 'https://instagram.com/yourorg' },
  { value: 'discord', label: 'Discord', icon: MessageCircle, color: 'text-purple-400', placeholder: 'https://discord.gg/invite' },
  { value: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-400', placeholder: 'https://twitter.com/yourorg' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', placeholder: 'https://linkedin.com/company/yourorg' },
];

export function SocialSection({ form, onFieldFocus }: SocialSectionProps) {
  const { register, watch, setValue } = form;
  const socialLinks = watch('social_links') || [];

  const addSocialLink = (platform: string) => {
    const currentLinks = watch('social_links');
    // Check if platform already exists
    if (currentLinks.some((link: any) => link.platform === platform)) {
      return;
    }
    setValue('social_links', [...currentLinks, { platform, url: '' }]);
    // Trigger focus to highlight the social section
    onFieldFocus?.('social_links');
    setTimeout(() => onFieldFocus?.(null), 1000);
  };

  const removeSocialLink = (index: number) => {
    const currentLinks = watch('social_links');
    setValue('social_links', currentLinks.filter((_: any, i: number) => i !== index));
  };

  const getAvailablePlatforms = () => {
    const usedPlatforms = socialLinks.map((link: any) => link.platform);
    return SOCIAL_PLATFORMS.filter(platform => !usedPlatforms.includes(platform.value));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Social Media</h2>
        <p className="text-gray-400 text-sm">
          Connect with students on the platforms they use most.
        </p>
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        {socialLinks.map((link: any, index: number) => {
          const platform = SOCIAL_PLATFORMS.find(p => p.value === link.platform);
          if (!platform) return null;
          const Icon = platform.icon;

          return (
            <div key={index} className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg">
                <Icon className={`w-5 h-5 ${platform.color}`} />
                <span className="text-sm text-white font-medium">{platform.label}</span>
              </div>
              <input
                {...register(`social_links.${index}.url` as const)}
                onFocus={() => onFieldFocus?.('social_links')}
                onBlur={() => onFieldFocus?.(null)}
                className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white 
                         focus:outline-none focus:ring-2 focus:ring-neon-green transition-all"
                placeholder={platform.placeholder}
              />
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}

        {/* Add Platform Buttons */}
        {getAvailablePlatforms().length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Add platform:</p>
            <div className="flex flex-wrap gap-2">
              {getAvailablePlatforms().map(platform => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() => addSocialLink(platform.value)}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border 
                             rounded-lg hover:bg-dark-card hover:border-neon-green/30 transition-colors"
                  >
                    <Icon className={`w-4 h-4 ${platform.color}`} />
                    <span className="text-sm text-gray-300">{platform.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-400 mb-2 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Discord is King
        </h4>
        <p className="text-xs text-gray-400">
          Most student organizations use Discord as their primary communication channel. 
          Make sure to include your Discord invite link if you have a server!
        </p>
      </div>
    </div>
  );
}