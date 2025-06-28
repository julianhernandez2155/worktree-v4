'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skill } from '@/types/skills';
import { X, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
  className?: string;
  maxSkills?: number;
}

export function SkillSelector({
  selectedSkills,
  onSkillsChange,
  placeholder = "Add skills...",
  className,
  maxSkills = 10
}: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSkillObjects, setSelectedSkillObjects] = useState<Skill[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load all skills on mount
  useEffect(() => {
    loadSkills();
  }, []);

  // Filter skills based on search
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = skills.filter(skill => 
        skill.name.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skills);
    }
  }, [searchQuery, skills]);

  // Load selected skill objects
  useEffect(() => {
    if (selectedSkills.length > 0 && skills.length > 0) {
      const selected = skills.filter(skill => selectedSkills.includes(skill.id));
      setSelectedSkillObjects(selected);
    } else {
      setSelectedSkillObjects([]);
    }
  }, [selectedSkills, skills]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill: Skill) => {
    if (!selectedSkills.includes(skill.id) && selectedSkills.length < maxSkills) {
      onSkillsChange([...selectedSkills, skill.id]);
      setSearchQuery('');
      inputRef.current?.focus();
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    onSkillsChange(selectedSkills.filter(id => id !== skillId));
  };

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Technical': 'text-blue-400',
      'Creative': 'text-purple-400',
      'Business': 'text-green-400',
      'Leadership': 'text-orange-400',
      'Communication': 'text-pink-400',
      'Operations': 'text-gray-400'
    };
    return colors[category] || 'text-gray-400';
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Selected Skills */}
      {selectedSkillObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSkillObjects.map(skill => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-dark-card 
                       border border-dark-border rounded-full"
            >
              <span className={getCategoryColor(skill.category)}>●</span>
              {skill.name}
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="ml-1 hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={selectedSkills.length >= maxSkills}
          className={cn(
            "w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg",
            "text-white placeholder-dark-muted",
            "focus:border-neon-green focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
        {selectedSkills.length >= maxSkills && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-muted">
            Max {maxSkills} skills
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-dark-card 
                      border border-dark-border rounded-lg shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-neon-green" />
            </div>
          ) : Object.keys(groupedSkills).length > 0 ? (
            Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category} className="py-2">
                <div className="px-3 py-1 text-xs font-medium text-dark-muted">
                  {category}
                </div>
                {categorySkills.map(skill => {
                  const isSelected = selectedSkills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => !isSelected && handleAddSkill(skill)}
                      disabled={isSelected}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm flex items-center gap-2",
                        "hover:bg-dark-surface transition-colors",
                        isSelected && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className={getCategoryColor(category)}>●</span>
                      <span className="flex-1">{skill.name}</span>
                      {skill.description && (
                        <span className="text-xs text-dark-muted truncate max-w-[200px]">
                          {skill.description}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-3 py-4 text-sm text-dark-muted text-center">
              {searchQuery ? 'No skills found' : 'No skills available'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}