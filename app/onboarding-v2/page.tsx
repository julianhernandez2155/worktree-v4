'use client';

import { 
  Users, 
  Building, 
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';
import { UserType } from '@/lib/types/onboarding';


export default function OnboardingV2Page() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user already has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile?.onboarding_completed) {
      router.push('/dashboard');
    }
  };

  const handlePathSelection = async (path: UserType) => {
    setSelectedPath(path);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('No user found');}

      // Create or update onboarding progress
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          user_type: path,
          steps_completed: { path_selected: true },
          completion_percentage: 20
        });

      if (error) {throw error;}

      // Navigate to appropriate onboarding flow
      switch (path) {
        case 'student':
          router.push('/onboarding-v2/student');
          break;
        case 'org_leader':
          router.push('/onboarding-v2/org-leader');
          break;
        case 'admin':
          router.push('/onboarding-v2/admin');
          break;
      }
    } catch (error) {
      console.error('Error selecting path:', error);
      setLoading(false);
    }
  };

  const paths = [
    {
      type: 'student' as UserType,
      icon: Users,
      title: 'I\'m a Student',
      description: 'Find projects, join organizations, and build your skills',
      benefits: [
        'Join your organizations',
        'Discover campus opportunities',
        'Build a verified portfolio',
        'Connect with peers'
      ],
      color: 'neon-green'
    },
    {
      type: 'org_leader' as UserType,
      icon: Building,
      title: 'I Lead an Organization',
      description: 'Manage projects, find talent, and grow your organization',
      benefits: [
        'Set up your workspace',
        'Manage internal projects',
        'Find skilled members',
        'Track organization health'
      ],
      color: 'neon-blue'
    },
    {
      type: 'admin' as UserType,
      icon: BarChart3,
      title: 'I\'m a University Admin',
      description: 'Monitor campus engagement and track student success',
      benefits: [
        'Real-time analytics',
        'Skill gap insights',
        'Engagement metrics',
        'Custom reports'
      ],
      color: 'neon-purple'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Welcome to Worktree
          </h1>
          <p className="text-xl text-gray-400">
            The campus operating system for student organizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paths.map((path) => {
            const Icon = path.icon;
            const isSelected = selectedPath === path.type;
            
            return (
              <GlassCard
                key={path.type}
                className={`cursor-pointer transition-all transform hover:scale-105 ${
                  isSelected ? `ring-2 ring-${path.color}` : ''
                }`}
                onClick={() => !loading && handlePathSelection(path.type)}
              >
                <div className="p-6">
                  <div className={`w-16 h-16 bg-${path.color}/20 rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className={`w-8 h-8 text-${path.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-center">
                    {path.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 text-center">
                    {path.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {path.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className={`text-${path.color} mt-0.5`}>✓</span>
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <NeonButton
                    fullWidth
                    variant={isSelected ? 'primary' : 'secondary'}
                    loading={loading && isSelected}
                    icon={<ArrowRight />}
                    iconPosition="right"
                  >
                    Get Started
                  </NeonButton>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Not sure which to choose?{' '}
            <button
              onClick={() => handlePathSelection('student')}
              className="text-neon-green hover:text-neon-green/80 font-medium"
            >
              Start as a student
            </button>
            {' '}— you can always add organization features later.
          </p>
        </div>
      </div>
    </div>
  );
}