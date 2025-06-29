'use client';

import { 
  Users,
  Target,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { OrgQuickSetup } from '@/lib/types/onboarding';


export default function OrgLeaderOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrgQuickSetup>({
    name: '',
    type: 'academic',
    size: 'small',
    primaryChallenge: ''
  });
  const [universityId, setUniversityId] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user already has a profile to get university
      const { data: profile } = await supabase
        .from('profiles')
        .select('university_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.university_id) {
        setUniversityId(profile.university_id);
      } else {
        // If no profile, detect from email domain
        const domain = user.email?.split('@')[1];
        const { data: uni } = await supabase
          .from('universities')
          .select('id')
          .eq('domain', domain)
          .single();
        
        if (uni) {
          setUniversityId(uni.id);
        }
      }
    }
  };

  const orgTypes = [
    { value: 'academic', label: 'Academic/Professional' },
    { value: 'cultural', label: 'Cultural/Identity' },
    { value: 'service', label: 'Service/Volunteer' },
    { value: 'greek', label: 'Greek Life' },
    { value: 'other', label: 'Other' }
  ];

  const challenges = [
    { 
      value: 'finding_skills',
      icon: Target,
      label: 'Finding members with specific skills',
      description: 'Hard to know who can do what'
    },
    { 
      value: 'project_management',
      icon: Calendar,
      label: 'Managing multiple projects',
      description: 'Keeping track of who\'s doing what'
    },
    { 
      value: 'member_engagement',
      icon: Users,
      label: 'Member engagement',
      description: 'Getting members involved and active'
    },
    { 
      value: 'meeting_deadlines',
      icon: Clock,
      label: 'Meeting deadlines',
      description: 'Projects often run late or incomplete'
    },
    { 
      value: 'knowledge_transfer',
      icon: TrendingUp,
      label: 'Knowledge transfer',
      description: 'Losing expertise when members graduate'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('No user found');}

      // Create organization
      const orgSlug = formData.name.toLowerCase().replace(/\s+/g, '-');
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: orgSlug,
          category: formData.type,
          university_id: universityId,
          settings: {
            size: formData.size,
            primaryChallenge: formData.primaryChallenge
          }
        })
        .select()
        .single();

      if (orgError) {throw orgError;}

      // Add user as organization admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {throw memberError;}

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          university_id: universityId,
          user_type: ['org_leader'],
          role: 'leader',
          onboarding_completed: false
        });

      if (profileError) {throw profileError;}

      // Update onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: { 
            path_selected: true,
            org_setup: true 
          },
          completion_percentage: 40,
          last_prompt_shown: 'org_created'
        })
        .eq('user_id', user.id);

      if (progressError) {throw progressError;}

      // Navigate to project setup
      router.push(`/onboarding-v2/org-leader/project?org=${org.id}`);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Set Up Your Organization</h1>
          <p className="text-gray-400">Let's get your workspace ready in 2 minutes</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Organization Name
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g., Data Science Club"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Organization Type
              </label>
              <select
                required
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                {orgTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Organization Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Organization Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'small', label: '< 20 members' },
                  { value: 'medium', label: '20-50 members' },
                  { value: 'large', label: '50+ members' }
                ].map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: size.value as any })}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      formData.size === size.value
                        ? 'border-neon-green bg-neon-green/10 text-white'
                        : 'border-dark-border text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Challenge */}
            <div>
              <label className="block text-sm font-medium mb-3">
                What's your biggest challenge?
              </label>
              <div className="space-y-2">
                {challenges.map((challenge) => {
                  const Icon = challenge.icon;
                  const isSelected = formData.primaryChallenge === challenge.value;
                  
                  return (
                    <div
                      key={challenge.value}
                      onClick={() => setFormData({ ...formData, primaryChallenge: challenge.value })}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-neon-blue bg-neon-blue/10' 
                          : 'border-dark-border hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-neon-blue' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <p className="font-medium">{challenge.label}</p>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <NeonButton
              type="submit"
              fullWidth
              loading={loading}
              disabled={!formData.primaryChallenge}
              icon={<ChevronRight />}
              iconPosition="right"
            >
              Continue to Project Setup
            </NeonButton>
          </form>
        </GlassCard>

        <p className="text-center text-sm text-gray-400 mt-4">
          Next: Set up your first project to see Worktree in action
        </p>
      </div>
    </div>
  );
}