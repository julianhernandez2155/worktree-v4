'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';


interface SkillSearchProps {
  availableSkills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillSearch({ 
  availableSkills, 
  selectedSkills, 
  onSkillsChange 
}: SkillSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available skills based on search
  const filteredSkills = availableSkills.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedSkills.includes(skill)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill: string) => {
    onSkillsChange([...selectedSkills, skill]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeSkill = (skill: string) => {
    onSkillsChange(selectedSkills.filter(s => s !== skill));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <label className="text-sm font-medium text-gray-400 block mb-2">
          Filter by skills
        </label>
        
        {/* Selected skills */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <AnimatePresence>
              {selectedSkills.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm border border-neon-green/50"
                >
                  <Check className="w-3 h-3" />
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search and add skills..."
            className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 transition-colors"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          
          {/* Dropdown */}
          <AnimatePresence>
            {showDropdown && (searchQuery || filteredSkills.length > 0) && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-2 bg-dark-card border border-dark-border rounded-lg shadow-xl overflow-hidden"
              >
                <div className="max-h-48 overflow-y-auto">
                  {filteredSkills.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No matching skills found
                    </div>
                  ) : (
                    filteredSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center justify-between group"
                      >
                        <span>{skill}</span>
                        <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Popular skills */}
      {selectedSkills.length === 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Popular skills in this organization:</p>
          <div className="flex flex-wrap gap-2">
            {availableSkills.slice(0, 8).map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="px-3 py-1 bg-dark-surface rounded-full text-xs hover:bg-dark-elevated hover:text-neon-green transition-all"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}