'use client';

import { Plus, Trash2, ExternalLink, Github, Linkedin, Globe, Link as LinkIcon } from 'lucide-react';

interface LinksSectionProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  onFieldFocus: (field: string) => void;
}

const PLATFORM_OPTIONS = [
  { value: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { value: 'portfolio', label: 'Portfolio', icon: Globe, placeholder: 'https://yourportfolio.com' },
  { value: 'other', label: 'Other', icon: LinkIcon, placeholder: 'https://example.com' },
];

export function LinksSection({ 
  register, 
  errors, 
  watch, 
  setValue, 
  onFieldFocus 
}: LinksSectionProps) {
  const links = watch('external_links') || [];

  const addLink = () => {
    setValue('external_links', [...links, { platform: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setValue('external_links', links.filter((_: any, i: number) => i !== index));
  };

  const updateLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setValue('external_links', newLinks);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">External Links</h2>
      
      <p className="text-sm text-gray-400">
        Add links to your professional profiles, portfolio, or personal website
      </p>

      {/* Links */}
      <div className="space-y-3">
        {links.map((link: any, index: number) => {
          const platform = PLATFORM_OPTIONS.find(p => p.value === link.platform);
          const Icon = platform?.icon || LinkIcon;
          
          return (
            <div key={index} className="flex gap-2">
              <select
                value={link.platform}
                onChange={(e) => {
                  updateLink(index, 'platform', e.target.value);
                  onFieldFocus('external_links');
                }}
                className="w-40 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
              >
                <option value="">Select...</option>
                {PLATFORM_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <div className="flex-1 relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={link.url}
                  onChange={(e) => {
                    updateLink(index, 'url', e.target.value);
                    onFieldFocus('external_links');
                  }}
                  placeholder={platform?.placeholder || 'https://...'}
                  className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
        
        {links.length < 5 && (
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-dark-surface hover:bg-dark-card border border-dark-border rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        )}
      </div>

      {/* Preview */}
      {links.length > 0 && links.some((l: any) => l.url) && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
          <div className="p-4 bg-dark-surface rounded-lg space-y-2">
            {links.filter((l: any) => l.url).map((link: any, index: number) => {
              const platform = PLATFORM_OPTIONS.find(p => p.value === link.platform);
              const Icon = platform?.icon || LinkIcon;
              
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-neon-green transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{platform?.label || 'Link'}</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}