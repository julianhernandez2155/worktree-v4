'use client';

import { useState, useRef, useEffect } from 'react';
import { UserPlus, User, X, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface InlineLeadEditorProps {
  projectId: string;
  orgId: string;
  currentLead?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  onUpdate?: () => void;
}

interface Member {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
}

export function InlineLeadEditor({ 
  projectId, 
  orgId,
  currentLead, 
  onUpdate 
}: InlineLeadEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isEditing) {
      loadMembers();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // Get all members of the organization
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          profiles:profiles!user_id(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('organization_id', orgId);

      if (error) throw error;

      const memberList = data?.map(m => m.profiles).filter(Boolean) || [];
      setMembers(memberList);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLead = async (memberId: string | null) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('internal_projects')
        .update({ lead_id: memberId })
        .eq('id', projectId);

      if (error) throw error;
      
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isEditing) {
    return (
      <div ref={dropdownRef} className="relative">
        <div className="absolute z-50 mt-1 w-64 bg-dark-card border border-dark-border rounded-lg shadow-xl">
          <div className="p-2 border-b border-dark-border">
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-dark-surface border border-dark-border rounded focus:outline-none focus:border-neon-green"
              autoFocus
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No members found</div>
            ) : (
              <>
                {currentLead && (
                  <button
                    onClick={() => handleSelectLead(null)}
                    disabled={saving}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Remove lead</span>
                  </button>
                )}
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectLead(member.id)}
                    disabled={saving}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-dark-surface transition-colors flex items-center gap-2",
                      currentLead?.id === member.id && "bg-dark-surface"
                    )}
                  >
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.full_name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                        {member.full_name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{member.full_name}</div>
                      {member.email && (
                        <div className="text-xs text-gray-500">{member.email}</div>
                      )}
                    </div>
                    {currentLead?.id === member.id && (
                      <Check className="w-4 h-4 text-neon-green" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentLead) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-dark-surface transition-colors"
      >
        {currentLead.avatar_url ? (
          <img 
            src={currentLead.avatar_url} 
            alt={currentLead.full_name}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
            {currentLead.full_name[0]}
          </div>
        )}
        <span className="text-sm text-gray-300">{currentLead.full_name}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={() => setIsEditing(true)}
      className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group/leadbtn"
    >
      <UserPlus className="w-5 h-5 text-gray-600 group-hover/leadbtn:text-neon-green" />
    </button>
  );
}