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
  Target,
  Briefcase,
  Link as LinkIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { UserProfile } from './UserProfile';
import { BasicInfoSection } from './ProfileEditorSections/BasicInfoSection';
import { AboutSection } from './ProfileEditorSections/AboutSection';
import { GoalsSection } from './ProfileEditorSections/GoalsSection';
import { ExperienceSection } from './ProfileEditorSections/ExperienceSection';
import { LinksSection } from './ProfileEditorSections/LinksSection';
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
  avatar_url: string;
  tagline: string;
  bio: string;
  major: string;
  year_of_study: string;
  interests: string[];
  looking_for: string[];
  skills: string[];
  external_links: Array<{ platform: string; url: string }>;
}

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'about', label: 'About You', icon: BookOpen },
  { id: 'goals', label: 'Goals & Interests', icon: Target },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'links', label: 'External Links', icon: LinkIcon },
];

// Map fields to their corresponding tabs in the preview
const FIELD_TO_TAB_MAP: Record<string, 'overview' | 'experience' | 'skills' | 'portfolio'> = {
  // Overview tab fields
  full_name: 'overview',
  username: 'overview',
  avatar_url: 'overview',
  tagline: 'overview',
  bio: 'overview',
  major: 'overview',
  year_of_study: 'overview',
  
  // Skills tab fields
  skills: 'skills',
  
  // Experience tab fields
  interests: 'experience',
  looking_for: 'overview',
  
  // Portfolio tab (external links show in overview)
  external_links: 'overview'
};

export function ProfileEditor({ profile, previewData }: ProfileEditorProps) {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [activeSection, setActiveSection] = useState('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [previousSidebarState, setPreviousSidebarState] = useState<boolean | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'overview' | 'experience' | 'skills' | 'portfolio'>('overview');
  const previewRef = useRef<any>(null);
  const [lastSavedValues, setLastSavedValues] = useState<FormData | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      full_name: profile.full_name || '',
      username: profile.username || '',
      avatar_url: profile.avatar_url || '',
      tagline: profile.tagline || '',
      bio: profile.bio || '',
      major: profile.major || '',
      year_of_study: profile.year_of_study || '',
      interests: profile.interests || [],
      looking_for: profile.looking_for || [],
      skills: profile.member_skills?.map(ms => ms.skills.name) || [],
      external_links: profile.external_links || []
    }
  });

  const formValues = watch();

  // Function to compare form values
  const areFormValuesEqual = (a: FormData, b: FormData | null): boolean => {
    if (!b) return false;
    return (
      a.full_name === b.full_name &&
      a.username === b.username &&
      a.avatar_url === b.avatar_url &&
      a.tagline === b.tagline &&
      a.bio === b.bio &&
      a.major === b.major &&
      a.year_of_study === b.year_of_study &&
      JSON.stringify(a.interests) === JSON.stringify(b.interests) &&
      JSON.stringify(a.looking_for) === JSON.stringify(b.looking_for) &&
      JSON.stringify(a.skills) === JSON.stringify(b.skills) &&
      JSON.stringify(a.external_links) === JSON.stringify(b.external_links)
    );
  };

  // Initialize lastSavedValues on mount
  useEffect(() => {
    setLastSavedValues(formValues);
  }, []); // Run only once on mount

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = !areFormValuesEqual(formValues, lastSavedValues);
    setHasUnsavedChanges(hasChanges);
    setSaveStatus(hasChanges ? 'idle' : saveStatus === 'idle' ? 'idle' : 'saved');
  }, [formValues, lastSavedValues]);

  // Calculate profile completion
  useEffect(() => {
    const fields = [
      formValues.full_name,
      formValues.bio,
      formValues.avatar_url,
      formValues.tagline,
      formValues.major,
      formValues.year_of_study,
      formValues.interests?.length > 0,
      formValues.looking_for?.length > 0,
      formValues.skills?.length > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    setCompletionPercentage(Math.round((completed / fields.length) * 100));
  }, [formValues]);

  // Handle sidebar state
  useEffect(() => {
    if (previousSidebarState === null) {
      setPreviousSidebarState(sidebarOpen);
      if (sidebarOpen) {
        setSidebarOpen(false);
      }
    }

    return () => {
      if (previousSidebarState !== null) {
        setSidebarOpen(previousSidebarState);
      }
    };
  }, [sidebarOpen, setSidebarOpen, previousSidebarState]);

  // Handle field focus
  const handleFieldFocus = useCallback((field: string) => {
    setActiveField(field);
    
    // Change preview tab based on field
    const targetTab = FIELD_TO_TAB_MAP[field];
    if (targetTab && targetTab !== previewTab) {
      setPreviewTab(targetTab);
    }

    // Scroll to the relevant section in preview
    if (previewRef.current?.scrollToSection) {
      previewRef.current.scrollToSection(field);
    }
  }, [previewTab]);

  const onSubmit = async (data: FormData) => {
    setSaveStatus('saving');
    setError(null);

    try {
      const supabase = createClient();
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          username: data.username,
          avatar_url: data.avatar_url,
          tagline: data.tagline,
          bio: data.bio,
          major: data.major,
          year_of_study: data.year_of_study,
          interests: data.interests,
          looking_for: data.looking_for,
          external_links: data.external_links,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // TODO: Update skills in member_skills table

      setSaveStatus('saved');
      setLastSavedValues(data); // Update last saved values
      
      // Redirect to public profile after a short delay
      setTimeout(() => {
        router.push(`/u/${data.username}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setSaveStatus('error');
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    router.push(profile.username ? `/u/${profile.username}` : '/dashboard');
  };

  // Create preview profile object
  const previewProfile = {
    ...profile,
    ...formValues,
    organization_members: profile.organization_members,
    member_skills: profile.member_skills
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left Panel - Form */}
      <div className="w-[500px] bg-dark-card border-r border-dark-border flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-yellow-500">Unsaved changes</span>
              )}
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  hasUnsavedChanges
                    ? "bg-neon-green text-black hover:bg-neon-green/90"
                    : "bg-dark-surface text-gray-400 cursor-not-allowed"
                )}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Now
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Profile Completion</span>
              <span className="text-white font-medium">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neon-green"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Sections Navigation */}
        <div className="flex-1 overflow-hidden flex">
          <div className="w-48 bg-dark-bg p-4 overflow-y-auto">
            <nav className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                      activeSection === section.id
                        ? "bg-dark-surface text-white"
                        : "text-gray-400 hover:text-white hover:bg-dark-surface/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{section.label}</span>
                    <ChevronRight className={cn(
                      "w-4 h-4 ml-auto transition-transform",
                      activeSection === section.id && "rotate-90"
                    )} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Form Content */}
          <form className="flex-1 overflow-y-auto p-6">
            {activeSection === 'basic' && (
              <BasicInfoSection
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                onFieldFocus={handleFieldFocus}
                profile={profile}
              />
            )}
            
            {activeSection === 'about' && (
              <AboutSection
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                onFieldFocus={handleFieldFocus}
              />
            )}
            
            {activeSection === 'goals' && (
              <GoalsSection
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                onFieldFocus={handleFieldFocus}
              />
            )}
            
            {activeSection === 'experience' && (
              <ExperienceSection
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                onFieldFocus={handleFieldFocus}
                memberSkills={profile.member_skills}
              />
            )}
            
            {activeSection === 'links' && (
              <LinksSection
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                onFieldFocus={handleFieldFocus}
              />
            )}
          </form>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="flex-1 bg-gradient-to-b from-dark-card to-dark-bg overflow-y-auto">
        <UserProfile
          ref={previewRef}
          profile={previewProfile}
          stats={previewData.stats}
          contributions={previewData.contributions}
          recentActivity={previewData.recentActivity}
          isOwnProfile={true}
          currentUserId={profile.id}
          highlightedSection={activeField}
          activeTab={previewTab}
          onTabChange={setPreviewTab}
        />
      </div>
    </div>
  );
}