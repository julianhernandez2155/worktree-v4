'use client';

import { Calendar, AlertCircle, Users } from 'lucide-react';
import { useMemo } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface Role {
  id: string;
  title: string;
  current_holder?: {
    full_name: string;
  };
  term_end_date?: string;
}

interface SuccessionTimelineProps {
  roles: Role[];
}

export function SuccessionTimeline({ roles }: SuccessionTimelineProps) {
  // Group roles by semester
  const timelineData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Define semesters
    const semesters = [
      { 
        label: 'Current Semester', 
        start: now,
        end: currentMonth < 5 ? new Date(currentYear, 4, 31) : new Date(currentYear, 11, 31),
        key: 'current'
      },
      { 
        label: 'Spring 2025', 
        start: new Date(2025, 0, 1),
        end: new Date(2025, 4, 31),
        key: 'spring2025'
      },
      { 
        label: 'Fall 2025', 
        start: new Date(2025, 8, 1),
        end: new Date(2025, 11, 31),
        key: 'fall2025'
      },
      { 
        label: 'Spring 2026', 
        start: new Date(2026, 0, 1),
        end: new Date(2026, 4, 31),
        key: 'spring2026'
      }
    ];

    // Group roles by semester
    return semesters.map(semester => {
      const semesterRoles = roles.filter(role => {
        if (!role.term_end_date) {return false;}
        const endDate = new Date(role.term_end_date);
        return endDate >= semester.start && endDate <= semester.end;
      });

      const vacantRoles = roles.filter(role => !role.current_holder && semester.key === 'current');

      return {
        ...semester,
        transitions: semesterRoles,
        vacant: vacantRoles
      };
    });
  }, [roles]);

  return (
    <GlassCard>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-neon-purple" />
          <h2 className="text-xl font-semibold">Succession Timeline</h2>
        </div>

        <div className="space-y-6">
          {timelineData.map((semester, index) => {
            const hasIssues = semester.transitions.length > 0 || semester.vacant.length > 0;
            
            return (
              <div key={semester.key} className="relative">
                {/* Timeline connector */}
                {index < timelineData.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-dark-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                    hasIssues 
                      ? "bg-neon-coral/20 border-2 border-neon-coral" 
                      : "bg-dark-surface border-2 border-dark-border"
                  )}>
                    {hasIssues ? (
                      <AlertCircle className="w-5 h-5 text-neon-coral" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <h3 className="font-semibold mb-1">{semester.label}</h3>
                    
                    {semester.transitions.length === 0 && semester.vacant.length === 0 ? (
                      <p className="text-sm text-gray-400">No transitions needed</p>
                    ) : (
                      <div className="space-y-3 mt-3">
                        {/* Vacant roles */}
                        {semester.vacant.map(role => (
                          <div 
                            key={role.id}
                            className="p-3 bg-neon-coral/10 border border-neon-coral/30 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neon-coral">{role.title}</p>
                                <p className="text-sm text-gray-400">Currently vacant</p>
                              </div>
                              <span className="text-xs bg-neon-coral/20 text-neon-coral px-2 py-1 rounded">
                                Urgent
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Transitioning roles */}
                        {semester.transitions.map(role => (
                          <div 
                            key={role.id}
                            className="p-3 bg-dark-surface rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{role.title}</p>
                                <p className="text-sm text-gray-400">
                                  {role.current_holder?.full_name} graduates
                                </p>
                              </div>
                              <span className="text-xs text-yellow-500">
                                {new Date(role.term_end_date!).toLocaleDateString('en-US', { 
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-dark-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>
                {roles.filter(r => r.term_end_date || !r.current_holder).length} roles need attention
              </span>
            </div>
            <button className="text-neon-green hover:text-neon-green/80 transition-colors">
              Start succession planning →
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}