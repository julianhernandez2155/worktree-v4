'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Save, 
  X,
  ChevronRight,
  Building,
  BookOpen,
  Phone,
  Calendar,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { OrganizationProfile } from './OrganizationProfile';
import { BasicInfoSection } from './ProfileEditorSections/BasicInfoSection';
import { StorySection } from './ProfileEditorSections/StorySection';
import { ContactSection } from './ProfileEditorSections/ContactSection';
import { MeetingSection } from './ProfileEditorSections/MeetingSection';
import { SocialSection } from './ProfileEditorSections/SocialSection';
import { cn } from '@/lib/utils';

interface ProfileEditorProps {
  organization: any;
  previewData: {
    memberCount: number;
    projectCount: number;
    publicProjects: any[];
    completedProjects: any[];
    skillsCount: number;
    skillsList: string[];
    leadershipTeam: any[];
    recentActivities: any[];
    isMember: boolean;
    isAdmin: boolean;
  };
}

interface FormData {
  name: string;
  description: string;
  category: string;
  logo_url: string;
  mission: string;
  what_we_do: string;
  values: string[];
  email: string;
  website: string;
  location: string;
  meeting_schedule: Record<string, { enabled: boolean; time: string }>;
  join_process: string;
  social_links: Array<{ platform: string; url: string }>;
}

const SECTIONS = [
  { id: 'basic', label: 'Essentials', icon: Building },
  { id: 'story', label: 'Your Story', icon: BookOpen },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'meeting', label: 'Meetings', icon: Calendar },
  { id: 'social', label: 'Social Media', icon: Share2 },
];

// Map fields to their corresponding tabs in the preview
const FIELD_TO_TAB_MAP: Record<string, 'about' | 'projects' | 'contact'> = {
  // About tab fields
  name: 'about',
  description: 'about',
  category: 'about',
  logo_url: 'about',
  mission: 'about',
  what_we_do: 'about',
  values: 'about',
  
  // Contact tab fields
  email: 'contact',
  website: 'contact',
  location: 'contact',
  meeting_schedule: 'contact',
  join_process: 'contact',
  social_links: 'contact'
};

export function ProfileEditor({ organization, previewData }: ProfileEditorProps) {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [activeSection, setActiveSection] = useState('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [previousSidebarState, setPreviousSidebarState] = useState<boolean | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'about' | 'projects' | 'contact'>('about');
  const previewRef = useRef<any>(null);
  const [lastSavedValues, setLastSavedValues] = useState<FormData | null>(null);

  // Parse meeting_schedule if it's a string
  const parseMeetingSchedule = (schedule: any) => {
    if (typeof schedule === 'string') {
      try {
        return JSON.parse(schedule);
      } catch (e) {
        console.error('Failed to parse meeting_schedule:', e);
        return {};
      }
    }
    return schedule || {};
  };

  const form = useForm<FormData>({
    defaultValues: {
      name: organization.name || '',
      description: organization.description || '',
      category: organization.category || 'other',
      logo_url: organization.logo_url || '',
      mission: organization.mission || '',
      what_we_do: organization.what_we_do || '',
      values: organization.values || [''],
      email: organization.email || '',
      website: organization.website || '',
      location: organization.location || '',
      meeting_schedule: parseMeetingSchedule(organization.meeting_schedule),
      join_process: organization.join_process || '',
      social_links: organization.social_links || []
    }
  });

  const formValues = form.watch();

  // Initialize lastSavedValues with the initial form data
  useEffect(() => {
    if (!lastSavedValues) {
      setLastSavedValues({
        name: organization.name || '',
        description: organization.description || '',
        category: organization.category || 'other',
        logo_url: organization.logo_url || '',
        mission: organization.mission || '',
        what_we_do: organization.what_we_do || '',
        values: organization.values || [''],
        email: organization.email || '',
        website: organization.website || '',
        location: organization.location || '',
        meeting_schedule: parseMeetingSchedule(organization.meeting_schedule),
        join_process: organization.join_process || '',
        social_links: organization.social_links || []
      });
    }
  }, []);

  // Auto-close sidebar when editor opens
  useEffect(() => {
    // Store current sidebar state
    setPreviousSidebarState(sidebarOpen);
    // Close sidebar
    if (sidebarOpen) {
      setSidebarOpen(false);
    }

    // Cleanup: restore previous state when unmounting
    return () => {
      if (previousSidebarState !== null) {
        setSidebarOpen(previousSidebarState);
      }
    };
  }, []); // Only run on mount/unmount

  // Handle tab switching and scrolling based on active field
  useEffect(() => {
    if (activeField && FIELD_TO_TAB_MAP[activeField]) {
      const targetTab = FIELD_TO_TAB_MAP[activeField];
      if (targetTab !== previewTab) {
        setPreviewTab(targetTab);
        // Wait for tab animation to complete before scrolling
        setTimeout(() => {
          previewRef.current?.scrollToSection(activeField);
        }, 300);
      } else {
        // Tab is already active, just scroll
        previewRef.current?.scrollToSection(activeField);
      }
    }
  }, [activeField, previewTab]);

  // Calculate completion percentage
  useEffect(() => {
    const fields = [
      formValues.name,
      formValues.description,
      formValues.category !== 'other',
      formValues.mission,
      formValues.what_we_do,
      formValues.values.some(v => v.trim() !== ''),
      formValues.email,
      formValues.website,
      formValues.location,
      formValues.meeting_schedule,
      formValues.join_process,
      formValues.social_links.length > 0
    ];

    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setCompletionPercentage(percentage);
  }, [formValues]);

  // Helper function to deep compare form values
  const areFormValuesEqual = (a: FormData, b: FormData | null): boolean => {
    if (!b) return false;
    
    // Compare all fields
    return (
      a.name === b.name &&
      a.description === b.description &&
      a.category === b.category &&
      a.logo_url === b.logo_url &&
      a.mission === b.mission &&
      a.what_we_do === b.what_we_do &&
      JSON.stringify(a.values) === JSON.stringify(b.values) &&
      a.email === b.email &&
      a.website === b.website &&
      a.location === b.location &&
      JSON.stringify(a.meeting_schedule) === JSON.stringify(b.meeting_schedule) &&
      a.join_process === b.join_process &&
      JSON.stringify(a.social_links) === JSON.stringify(b.social_links)
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
      const supabase = createClient();
      
      // Filter out empty values
      const filteredValues = data.values.filter(v => v.trim() !== '');
      const filteredSocialLinks = data.social_links.filter(
        link => link.platform && link.url
      );

      const updateData = {
        name: data.name,
        description: data.description,
        category: data.category,
        logo_url: data.logo_url,
        mission: data.mission,
        what_we_do: data.what_we_do,
        values: filteredValues,
        email: data.email,
        website: data.website,
        location: data.location,
        meeting_schedule: typeof data.meeting_schedule === 'string' 
          ? JSON.parse(data.meeting_schedule) 
          : data.meeting_schedule,
        join_process: data.join_process,
        social_links: filteredSocialLinks,
        updated_at: new Date().toISOString()
      };

      const { data: result, error: updateError } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', organization.id)
        .select();

      if (updateError) throw updateError;

      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Update last saved values to current form values
      setLastSavedValues({
        name: data.name,
        description: data.description,
        category: data.category,
        logo_url: data.logo_url,
        mission: data.mission,
        what_we_do: data.what_we_do,
        values: filteredValues,
        email: data.email,
        website: data.website,
        location: data.location,
        meeting_schedule: data.meeting_schedule,
        join_process: data.join_process,
        social_links: filteredSocialLinks
      });
      
      // Reset to idle after showing saved state
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
      setSaveStatus('error');
    }
  }, [organization.id]);

  // Auto-save removed - manual save only

  // Handle manual save
  const handleSave = async () => {
    await saveData(formValues);
  };

  // Handle exit
  const handleExit = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    router.push(`/dashboard/org/${organization.slug}/profile`);
  };

  // Create preview organization with current form values
  // Filter out empty values for cleaner preview
  const filteredValues = formValues.values.filter((v: string) => v.trim() !== '');
  const filteredSocialLinks = formValues.social_links.filter(
    (link: any) => link.platform && link.url
  );
  
  const previewOrganization = {
    ...organization,
    ...formValues,
    values: filteredValues,
    social_links: filteredSocialLinks
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
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                    <ChevronRight className={cn(
                      "w-4 h-4 ml-auto transition-transform",
                      activeSection === section.id && "rotate-90"
                    )} />
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Form Content */}
          <div className="p-6">
            {activeSection === 'basic' && (
              <BasicInfoSection form={form} onFieldFocus={setActiveField} organization={organization} />
            )}
            {activeSection === 'story' && (
              <StorySection form={form} onFieldFocus={setActiveField} />
            )}
            {activeSection === 'contact' && (
              <ContactSection form={form} onFieldFocus={setActiveField} />
            )}
            {activeSection === 'meeting' && (
              <MeetingSection form={form} onFieldFocus={setActiveField} />
            )}
            {activeSection === 'social' && (
              <SocialSection form={form} onFieldFocus={setActiveField} />
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 border-t border-dark-border bg-dark-card">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
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
              <OrganizationProfile
                ref={previewRef}
                organization={previewOrganization}
                {...previewData}
                highlightedSection={activeField}
                activeTab={previewTab}
                onTabChange={setPreviewTab}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}