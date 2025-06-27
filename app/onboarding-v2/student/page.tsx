'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { StudentQuickStart, PrimaryRole } from '@/lib/types/onboarding';
import { 
  User,
  Users,
  Briefcase,
  ChevronRight,
  Check
} from 'lucide-react';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudentQuickStart>({
    fullName: '',
    university: '',
    primaryRole: 'org_member'
  });
  const [universities, setUniversities] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchUniversities();
    loadUserData();
  }, []);

  const fetchUniversities = async () => {
    const { data } = await supabase
      .from('universities')
      .select('id, name, domain')
      .order('name');
    
    if (data) {
      setUniversities(data);
    }
  };

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      // Auto-detect university from email domain
      const domain = user.email.split('@')[1];
      const matchedUni = universities.find(u => u.domain === domain);
      if (matchedUni) {
        setFormData(prev => ({ ...prev, university: matchedUni.id }));
      }

      // Pre-fill name if available from auth metadata
      if (user.user_metadata?.full_name) {
        setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create basic user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: formData.fullName,
          university_id: formData.university,
          primary_role: formData.primaryRole,
          user_type: ['student'],
          onboarding_completed: false // Will be true after full flow
        });

      if (profileError) throw profileError;

      // Update onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: { 
            path_selected: true,
            quick_start: true 
          },
          completion_percentage: 50
        })
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Navigate to organization selection
      router.push('/onboarding-v2/student/organizations');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'org_member' as PrimaryRole,
      icon: Users,
      title: 'Organization Member',
      description: 'I\'m part of student organizations'
    },
    {
      value: 'freelancer' as PrimaryRole,
      icon: Briefcase,
      title: 'Campus Freelancer',
      description: 'I offer services to other students'
    },
    {
      value: 'both' as PrimaryRole,
      icon: User,
      title: 'Both',
      description: 'I\'m in orgs and do freelance work'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Quick Start</h1>
          <p className="text-gray-400">Let's get you connected in 30 seconds</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-medium mb-2">
                University
              </label>
              <select
                required
                className="input-field"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              >
                <option value="">Select your university...</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Role */}
            <div>
              <label className="block text-sm font-medium mb-3">
                I am primarily a...
              </label>
              <div className="space-y-2">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.primaryRole === role.value;
                  
                  return (
                    <div
                      key={role.value}
                      onClick={() => setFormData({ ...formData, primaryRole: role.value })}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-neon-green bg-neon-green/10' 
                          : 'border-dark-border hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-neon-green' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium">{role.title}</p>
                            <p className="text-sm text-gray-400">{role.description}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-neon-green" />}
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
              icon={<ChevronRight />}
              iconPosition="right"
            >
              Continue
            </NeonButton>
          </form>
        </GlassCard>

        <p className="text-center text-sm text-gray-400 mt-4">
          Takes just 30 seconds • No skills assessment yet
        </p>
      </div>
    </div>
  );
}