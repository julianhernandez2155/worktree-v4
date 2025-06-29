'use client';

import { 
  Search,
  Users,
  Plus,
  Check,
  ChevronRight,
  SkipForward
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';


interface Organization {
  id: string;
  name: string;
  category: string;
  member_count: number;
  description?: string;
  is_selected?: boolean;
}

export default function StudentOrganizationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    fetchOrganizations();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('primary_role, university_id')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.primary_role || '');
        // Fetch organizations for user's university
        fetchOrganizations(profile.university_id);
      }
    }
  };

  const fetchOrganizations = async (universityId?: string) => {
    let query = supabase
      .from('organizations')
      .select('id, name, category, member_count, description')
      .eq('is_active', true)
      .order('member_count', { ascending: false });

    if (universityId) {
      query = query.eq('university_id', universityId);
    }

    const { data, error } = await query;
    
    if (data && !error) {
      setOrganizations(data);
    }
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOrgSelection = (orgId: string) => {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    );
  };

  const handleContinue = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('No user found');}

      // Add user to selected organizations
      if (selectedOrgs.length > 0) {
        const membershipData = selectedOrgs.map(orgId => ({
          organization_id: orgId,
          user_id: user.id,
          role: 'member'
        }));

        const { error: memberError } = await supabase
          .from('organization_members')
          .insert(membershipData);

        if (memberError) {throw memberError;}
      }

      // Update onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: { 
            path_selected: true,
            quick_start: true,
            organizations: true
          },
          completion_percentage: 75
        })
        .eq('user_id', user.id);

      if (progressError) {throw progressError;}

      // Mark onboarding as complete for now (skills will be contextual)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) {throw profileError;}

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {userRole === 'freelancer' ? 'Find Organizations to Help' : 'Your Organizations'}
          </h1>
          <p className="text-gray-400">
            {userRole === 'freelancer' 
              ? 'Select organizations you\'d like to work with'
              : 'Select the organizations you\'re a member of'
            }
          </p>
        </div>

        <GlassCard className="p-6 mb-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredOrgs.map((org) => {
              const isSelected = selectedOrgs.includes(org.id);
              
              return (
                <div
                  key={org.id}
                  onClick={() => toggleOrgSelection(org.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-neon-green bg-neon-green/10' 
                      : 'border-dark-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{org.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="capitalize">{org.category || 'General'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {org.member_count || 0} members
                        </span>
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="w-5 h-5 text-neon-green flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOrgs.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No organizations found. Try a different search.
            </p>
          )}
        </GlassCard>

        {/* Selected count */}
        {selectedOrgs.length > 0 && (
          <p className="text-center text-sm text-gray-400 mb-4">
            {selectedOrgs.length} organization{selectedOrgs.length !== 1 ? 's' : ''} selected
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <NeonButton
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
            icon={<SkipForward />}
          >
            Skip for now
          </NeonButton>
          
          <NeonButton
            fullWidth
            onClick={handleContinue}
            loading={loading}
            disabled={selectedOrgs.length === 0 && userRole === 'org_member'}
            icon={<ChevronRight />}
            iconPosition="right"
          >
            {selectedOrgs.length === 0 ? 'Continue without organizations' : 'Complete setup'}
          </NeonButton>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Don't worry — you can join more organizations anytime
        </p>
      </div>
    </div>
  );
}