'use client';

import { Award, Plus, X, Search } from 'lucide-react';
import { useState } from 'react';

interface ExperienceSectionProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  onFieldFocus: (field: string) => void;
  memberSkills: any[];
}

const ALL_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  
  // Web Technologies
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Rails',
  
  // Mobile Development
  'React Native', 'Flutter', 'iOS Development', 'Android Development',
  
  // Data & AI
  'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'SQL', 'MongoDB', 'PostgreSQL',
  
  // Design & Creative
  'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Sketch', 'Video Editing', 'Photography',
  
  // Business & Soft Skills
  'Project Management', 'Leadership', 'Public Speaking', 'Writing', 'Marketing', 'Sales',
  'Team Collaboration', 'Problem Solving', 'Critical Thinking', 'Communication'
];

export function ExperienceSection({ 
  register, 
  errors, 
  watch, 
  setValue, 
  onFieldFocus,
  memberSkills 
}: ExperienceSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const skills = watch('skills') || [];

  // Get existing verified skills
  const verifiedSkills = memberSkills
    ?.filter(ms => ms.verified)
    .map(ms => ms.skills.name) || [];

  // Filter available skills
  const filteredSkills = ALL_SKILLS.filter(skill => 
    !skills.includes(skill) && 
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setValue('skills', [...skills, skill]);
      setSearchTerm('');
    }
  };

  const removeSkill = (index: number) => {
    setValue('skills', skills.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">Skills & Experience</h2>
      
      {/* Info about verified skills */}
      {verifiedSkills.length > 0 && (
        <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
          <h3 className="text-sm font-medium text-neon-green mb-2">
            Verified Skills ({verifiedSkills.length})
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            These skills have been verified through your project contributions:
          </p>
          <div className="flex flex-wrap gap-2">
            {verifiedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Award className="inline w-4 h-4 mr-1" />
          Skills
        </label>
        
        {/* Current skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill: string, index: number) => {
              const isVerified = verifiedSkills.includes(skill);
              return (
                <span
                  key={index}
                  className={`
                    px-3 py-1 rounded-full text-sm flex items-center gap-1
                    ${isVerified 
                      ? 'bg-neon-green/20 text-neon-green' 
                      : 'bg-dark-surface text-gray-300'
                    }
                  `}
                >
                  {isVerified && <Award className="w-3 h-3" />}
                  {skill}
                  {!isVerified && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Search and add skills */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => onFieldFocus('skills')}
            placeholder="Search and add skills..."
            className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
          />
        </div>

        {/* Skill suggestions */}
        {searchTerm && filteredSkills.length > 0 && (
          <div className="mt-2 p-2 bg-dark-surface border border-dark-border rounded-lg max-h-48 overflow-y-auto">
            {filteredSkills.slice(0, 10).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full text-left px-3 py-2 hover:bg-dark-card rounded text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Plus className="inline w-3 h-3 mr-2" />
                {skill}
              </button>
            ))}
          </div>
        )}

        <p className="mt-2 text-sm text-gray-400">
          Add skills you're proficient in. Complete projects to get them verified!
        </p>
      </div>

      {/* Tips */}
      <div className="p-4 bg-dark-surface rounded-lg">
        <h3 className="text-sm font-medium text-white mb-2">Pro Tips</h3>
        <ul className="space-y-1 text-sm text-gray-400">
          <li>• Add 5-10 relevant skills to improve your visibility</li>
          <li>• Complete projects to automatically verify your skills</li>
          <li>• Verified skills appear with a green badge and rank higher in searches</li>
          <li>• Be honest about your skill level - you'll be asked to demonstrate them in projects</li>
        </ul>
      </div>
    </div>
  );
}