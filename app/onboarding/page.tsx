'use client';

import { 
  School, 
  User, 
  Briefcase, 
  Target, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';


const ONBOARDING_STEPS = [
  { id: 'university', title: 'University', icon: School },
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'experience', title: 'Experience', icon: Briefcase },
  { id: 'skills', title: 'Skills', icon: Target },
  { id: 'goals', title: 'Goals', icon: Target },
  { id: 'preferences', title: 'Preferences', icon: Settings },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Form data
  const [formData, setFormData] = useState({
    university_id: '',
    first_name: '',
    last_name: '',
    graduation_year: new Date().getFullYear() + 4,
    major: '',
    bio: '',
    experience_level: 'beginner',
    skills: [] as string[],
    career_goals: '',
    notification_preferences: {
      email_opportunities: true,
      email_updates: true,
      email_reminders: true,
    }
  });

  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    fetchUniversities();
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

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Create user profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          ...formData,
          settings: {
            notifications: formData.notification_preferences
          }
        });

      if (error) {throw error;}

      // Add initial skills
      if (formData.skills.length > 0) {
        // First, get or create skills
        const skillPromises = formData.skills.map(async (skillName) => {
          const { data: skill } = await supabase
            .from('skills')
            .select('id')
            .eq('name', skillName)
            .single();

          if (skill) {return skill.id;}

          // Create skill if it doesn't exist
          const { data: newSkill } = await supabase
            .from('skills')
            .insert({ name: skillName, category: 'general' })
            .select('id')
            .single();

          return newSkill ? newSkill.id : null;
        });

        const skillIds = await Promise.all(skillPromises);

        // Add user skills
        await supabase
          .from('user_skills')
          .insert(
            skillIds.filter(Boolean).map(skill_id => ({
              user_id: user.id,
              skill_id,
              level: formData.experience_level
            }))
          );
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const currentStepData = ONBOARDING_STEPS[currentStep];
    if (!currentStepData) {return null;}
    
    switch (currentStepData.id) {
      case 'university':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Select Your University</h2>
            <p className="text-gray-400 mb-6">Choose your university to connect with fellow students</p>
            
            <div>
              <label className="block text-sm font-medium mb-2">University</label>
              <select
                className="input-field"
                value={formData.university_id}
                onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                required
              >
                <option value="">Select a university...</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-gray-400 mb-6">Tell us about yourself</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Major</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Computer Science"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Graduation Year</label>
              <select
                className="input-field"
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
              >
                {[...Array(6)].map((_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Tell us about your interests and goals..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Your Experience Level</h2>
            <p className="text-gray-400 mb-6">This helps us recommend opportunities that match your skills</p>
            
            <div className="space-y-3">
              {[
                { value: 'beginner', label: 'Beginner', description: 'Just starting out, eager to learn' },
                { value: 'intermediate', label: 'Intermediate', description: 'Some experience, looking to grow' },
                { value: 'advanced', label: 'Advanced', description: 'Solid experience, seeking challenges' },
                { value: 'expert', label: 'Expert', description: 'Deep expertise, ready to lead' },
              ].map((level) => (
                <GlassCard
                  key={level.value}
                  className={`cursor-pointer transition-all ${
                    formData.experience_level === level.value ? 'ring-2 ring-neon-green' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, experience_level: level.value })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-gray-400">{level.description}</p>
                    </div>
                    {formData.experience_level === level.value && (
                      <Check className="w-5 h-5 text-neon-green" />
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Your Skills</h2>
            <p className="text-gray-400 mb-6">Add skills you have or want to develop</p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Add Skills</label>
              <input
                type="text"
                className="input-field mb-2"
                placeholder="Type a skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const skill = input.value.trim();
                    if (skill && !formData.skills.includes(skill)) {
                      setFormData({
                        ...formData,
                        skills: [...formData.skills, skill]
                      });
                      input.value = '';
                    }
                  }
                }}
              />
              
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-dark-surface rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        skills: formData.skills.filter(s => s !== skill)
                      })}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Career Goals</h2>
            <p className="text-gray-400 mb-6">What do you want to achieve?</p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Career Aspirations</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="e.g., I want to become a software engineer at a leading tech company..."
                value={formData.career_goals}
                onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
              />
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Preferences</h2>
            <p className="text-gray-400 mb-6">Customize your experience</p>
            
            <div className="space-y-4">
              <h3 className="font-medium">Email Notifications</h3>
              {Object.entries(formData.notification_preferences).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      notification_preferences: {
                        ...formData.notification_preferences,
                        [key]: e.target.checked
                      }
                    })}
                    className="w-4 h-4 text-neon-green bg-dark-surface border-dark-border rounded"
                  />
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {ONBOARDING_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < ONBOARDING_STEPS.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      index <= currentStep
                        ? 'bg-neon-green text-black'
                        : 'bg-dark-surface text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        index < currentStep
                          ? 'bg-neon-green'
                          : 'bg-dark-surface'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-gray-400">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </p>
        </div>

        {/* Content */}
        <GlassCard className="p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <NeonButton
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              icon={<ChevronLeft />}
            >
              Back
            </NeonButton>

            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <NeonButton
                onClick={handleSubmit}
                loading={loading}
                icon={<Check />}
              >
                Complete Setup
              </NeonButton>
            ) : (
              <NeonButton
                onClick={handleNext}
                icon={<ChevronRight />}
                iconPosition="right"
              >
                Next
              </NeonButton>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}