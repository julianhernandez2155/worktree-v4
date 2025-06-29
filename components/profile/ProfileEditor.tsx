'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Save, 
  X,
  ChevronRight,
  User,
  BookOpen,
  GraduationCap,
  Target,
  Camera,
  Check,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { UserProfile } from './UserProfile';
import { BasicInfoSection } from './ProfileEditorSections/BasicInfoSection';
import { AboutSection } from './ProfileEditorSections/AboutSection';
import { AcademicSection } from './ProfileEditorSections/AcademicSection';
import { GoalsSection } from './ProfileEditorSections/GoalsSection';
import { MediaSection } from './ProfileEditorSections/MediaSection';
import { cn } from '@/lib/utils';

interface ProfileEditorProps {
  profile: any;
  previewData: {
    stats: {
      projectsCompleted: number;
      organizationsJoined: number;
      skillsVerified: number;
      totalSkills: number;
      contributionHours: number;
    };
    contributions: any[];
    recentActivity: any[];
  };
}

interface FormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  tagline: string;
  major: string;
  year_of_study: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  interests: string[];
  looking_for: string[];
  open_to_opportunities: boolean;
  avatar_url: string;
  cover_photo_url: string;
}

const SECTIONS = [
  { id: 'media', label: 'Photos', icon: Camera },
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'about', label: 'About', icon: BookOpen },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'goals', label: 'Goals & Interests', icon: Target },
];

// Map fields to highlighted sections in the preview
const FIELD_TO_HIGHLIGHT_MAP: Record<string, string> = {
  // Media fields
  avatar_url: 'avatar',
  cover_photo_url: 'cover',
  
  // Basic info fields
  full_name: 'header',
  username: 'header',
  email: 'header',
  phone: 'header',
  tagline: 'header',
  
  // About fields
  bio: 'bio',
  location: 'bio',
  website: 'bio',
  linkedin_url: 'bio',
  github_url: 'bio',
  
  // Academic fields
  major: 'header',
  year_of_study: 'header',
  
  // Goals fields
  interests: 'interests',
  looking_for: 'looking_for',
  open_to_opportunities: 'header'
};

export function ProfileEditor({ profile, previewData }: ProfileEditorProps) {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [activeSection, setActiveSection] = useState('media');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [previousSidebarState, setPreviousSidebarState] = useState<boolean | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [lastSavedValues, setLastSavedValues] = useState<FormData | null>(null);
  const previewRef = useRef<any>(null);
  const supabase = createClient();

  const { register, control, formState: { errors }, watch, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      tagline: profile?.tagline || '',
      major: profile?.major || '',
      year_of_study: profile?.year_of_study || '',
      location: profile?.location || '',
      website: profile?.website || '',
      linkedin_url: profile?.linkedin_url || '',
      github_url: profile?.github_url || '',
      interests: profile?.interests || [],
      looking_for: profile?.looking_for || [],
      open_to_opportunities: profile?.open_to_opportunities || false,
      avatar_url: profile?.avatar_url || '',
      cover_photo_url: profile?.cover_photo_url || ''
    }
  });

  const formValues = watch();

  // Initialize last saved values
  useEffect(() => {
    const initialValues = getValues();
    setLastSavedValues(initialValues);
  }, []);

  // Hide sidebar on mount if open
  useEffect(() => {
    if (sidebarOpen) {
      setPreviousSidebarState(true);
      setSidebarOpen(false);
    }
    
    return () => {
      // Restore sidebar state on unmount
      if (previousSidebarState) {
        setSidebarOpen(true);
      }
    };
  }, []);

  // Calculate completion percentage
  useEffect(() => {
    const fields = [
      formValues.full_name,
      formValues.username,
      formValues.email,
      formValues.bio,
      formValues.tagline,
      formValues.major,
      formValues.year_of_study,
      formValues.location,
      formValues.website || formValues.linkedin_url || formValues.github_url,
      formValues.interests.length > 0,
      formValues.looking_for.length > 0,
      formValues.avatar_url,
      formValues.cover_photo_url
    ];

    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setCompletionPercentage(percentage);
  }, [formValues]);

  // Helper function to deep compare form values
  const areFormValuesEqual = (a: FormData, b: FormData | null): boolean => {
    if (!b) return false;
    
    return (
      a.full_name === b.full_name &&
      a.username === b.username &&
      a.email === b.email &&
      a.phone === b.phone &&
      a.bio === b.bio &&
      a.tagline === b.tagline &&
      a.major === b.major &&
      a.year_of_study === b.year_of_study &&
      a.location === b.location &&
      a.website === b.website &&
      a.linkedin_url === b.linkedin_url &&
      a.github_url === b.github_url &&
      JSON.stringify(a.interests) === JSON.stringify(b.interests) &&
      JSON.stringify(a.looking_for) === JSON.stringify(b.looking_for) &&
      a.open_to_opportunities === b.open_to_opportunities &&
      a.avatar_url === b.avatar_url &&
      a.cover_photo_url === b.cover_photo_url
    );
  };

  // Mark as having unsaved changes only if values differ from last saved
  useEffect(() => {
    if (lastSavedValues) {
      const hasChanges = !areFormValuesEqual(formValues, lastSavedValues);
      setHasUnsavedChanges(hasChanges);
      if (hasChanges) {
        setSaveStatus('idle');
      }
    }
  }, [formValues, lastSavedValues]);

  // Auto-save functionality
  const saveData = useCallback(async (data: FormData) => {
    setSaveStatus('saving');
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Filter out empty interests
      const filteredInterests = data.interests.filter(i => i.trim() !== '');

      const updateData = {
        full_name: data.full_name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        tagline: data.tagline,
        major: data.major,
        year_of_study: data.year_of_study,
        location: data.location,
        website: data.website,
        linkedin_url: data.linkedin_url,
        github_url: data.github_url,
        interests: filteredInterests,
        looking_for: data.looking_for,
        open_to_opportunities: data.open_to_opportunities,
        avatar_url: data.avatar_url,
        cover_photo_url: data.cover_photo_url,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Update last saved values
      setLastSavedValues(data);

      // Auto-hide saved message after 3 seconds
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('idle');
        }
      }, 3000);
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }, [supabase, saveStatus]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveData(formValues);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formValues, hasUnsavedChanges, saveData]);

  const handleSave = () => {
    saveData(formValues);
  };

  const handleExit = () => {
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm('You have unsaved changes. Are you sure you want to exit?');
      if (!confirmExit) return;
    }
    
    if (profile?.username) {
      router.push(`/u/${profile.username}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    setActiveField(fieldName);
    const highlightSection = FIELD_TO_HIGHLIGHT_MAP[fieldName];
    
    if (highlightSection && previewRef.current) {
      previewRef.current.scrollToSection(highlightSection);
    }
  };

  const handleFieldBlur = () => {
    setActiveField(null);
  };

  // Create preview profile with current form values
  const previewProfile = {
    ...profile,
    ...formValues
  };

  return (
    <>
      {/* Dark overlay for modal effect */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={handleExit}
      />
      
      {/* Editor Panels */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex"
      >
        {/* Left Panel - Form */}
        <div className="w-full md:w-[480px] bg-dark-card border-r border-dark-border flex flex-col h-full shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-dark-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                {saveStatus === 'idle' && hasUnsavedChanges && (
                  <p className="text-xs text-gray-400 mt-1">Unsaved changes</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {saveStatus === 'saving' && (
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-sm text-green-400 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Saved
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-green text-black font-medium rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Now</span>
                </button>
                <button
                  onClick={handleExit}
                  className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Profile Completion</span>
                <span className="text-white font-medium">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-dark-surface rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content Area - Navigation + Form */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation */}
            <nav className="p-4 border-b border-dark-border">
              <div className="space-y-1">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                        activeSection === section.id
                          ? "bg-dark-surface text-white"
                          : "text-gray-400 hover:text-white hover:bg-dark-surface/50"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.label}</span>
                      {activeSection !== section.id && (
                        <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Form Sections */}
            <form className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {activeSection === 'media' && (
                <MediaSection
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  onFieldFocus={handleFieldFocus}
                  onFieldBlur={handleFieldBlur}
                  currentAvatar={formValues.avatar_url}
                  currentCover={formValues.cover_photo_url}
                />
              )}

              {activeSection === 'basic' && (
                <BasicInfoSection
                  register={register}
                  errors={errors}
                  onFieldFocus={handleFieldFocus}
                  onFieldBlur={handleFieldBlur}
                />
              )}

              {activeSection === 'about' && (
                <AboutSection
                  register={register}
                  errors={errors}
                  onFieldFocus={handleFieldFocus}
                  onFieldBlur={handleFieldBlur}
                />
              )}

              {activeSection === 'academic' && (
                <AcademicSection
                  register={register}
                  errors={errors}
                  onFieldFocus={handleFieldFocus}
                  onFieldBlur={handleFieldBlur}
                />
              )}

              {activeSection === 'goals' && (
                <GoalsSection
                  control={control}
                  register={register}
                  onFieldFocus={handleFieldFocus}
                  onFieldBlur={handleFieldBlur}
                />
              )}
            </form>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 bg-dark-bg flex flex-col h-full shadow-2xl overflow-hidden">
          <div className="bg-dark-card/80 backdrop-blur-sm border-b border-dark-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Live Preview</h2>
              <span className="text-sm text-gray-400">This is how your profile will look</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <UserProfile
                ref={previewRef}
                profile={previewProfile}
                {...previewData}
                isOwnProfile={true}
                highlightedSection={activeField ? FIELD_TO_HIGHLIGHT_MAP[activeField] : null}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}