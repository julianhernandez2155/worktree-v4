'use client';

import { useState, useEffect } from 'react';
import { X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Member {
  user_id: string;
  role: string;
  display_title?: string;
  position_description?: string;
  reports_to?: string;
  reports_to_role?: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface PositionEditModalProps {
  member: Member;
  allMembers: Member[];
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PositionEditModal({
  member,
  allMembers,
  organizationId,
  onClose,
  onSuccess
}: PositionEditModalProps) {
  const [reportsToRole, setReportsToRole] = useState(member.reports_to_role || '');
  const [description, setDescription] = useState(member.position_description || '');
  const [showReportsToDropdown, setShowReportsToDropdown] = useState(false);
  const [showPositionHolderDropdown, setShowPositionHolderDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(member.user_id || '');
  const [saving, setSaving] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const supabase = createClient();

  // Load available users when component mounts
  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          user:profiles!organization_members_user_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('organization_id', organizationId);

      if (orgMembers) {
        setAvailableUsers(orgMembers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Get unique positions (excluding the current member's role to prevent self-reporting)
  const availablePositions = allMembers
    .filter(m => m.role !== member.role) // Can't report to same role
    .filter((m, index, self) => 
      // Get unique positions by role
      index === self.findIndex(mem => mem.role === m.role)
    );

  const selectedPosition = availablePositions.find(m => m.role === reportsToRole);
  const selectedUser = availableUsers.find(u => u.user_id === selectedUserId);

  const handleSave = async () => {
    setSaving(true);
    try {
      // If changing the position holder, we need to handle the assignment
      if (selectedUserId !== member.user_id) {
        // Update the current member to remove their position info (make them regular member)
        const { error: currentError } = await supabase
          .from('organization_members')
          .update({
            role: 'member',
            display_title: null,
            reports_to_role: null,
            position_description: null
          })
          .eq('user_id', member.user_id)
          .eq('organization_id', organizationId);

        if (currentError) throw currentError;

        // Assign the position to the new user
        if (selectedUserId) {
          const { error: newError } = await supabase
            .from('organization_members')
            .update({
              role: member.role,
              display_title: member.display_title,
              reports_to_role: reportsToRole || null,
              position_description: description || null
            })
            .eq('user_id', selectedUserId)
            .eq('organization_id', organizationId);

          if (newError) throw newError;
        }
      } else {
        // Just update the current position details
        const { error } = await supabase
          .from('organization_members')
          .update({
            reports_to_role: reportsToRole || null,
            position_description: description || null
          })
          .eq('user_id', member.user_id)
          .eq('organization_id', organizationId);

        if (error) throw error;
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error updating position:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-card border border-dark-border rounded-xl p-6 z-50 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {member.display_title || member.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </h2>
            <p className="text-sm text-gray-400 mt-1">Edit Position</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Position Holder */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Position Holder</label>
            <div className="relative">
              <button
                onClick={() => setShowPositionHolderDropdown(!showPositionHolderDropdown)}
                className="w-full flex items-center justify-between gap-2 p-3 bg-dark-surface border border-dark-border rounded-lg hover:border-gray-600 transition-colors"
              >
                {selectedUser ? (
                  <div className="flex items-center gap-3">
                    {selectedUser.user.avatar_url ? (
                      <img
                        src={selectedUser.user.avatar_url}
                        alt={selectedUser.user.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span className="text-white">{selectedUser.user.full_name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Vacant Position</span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showPositionHolderDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedUserId('');
                      setShowPositionHolderDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-dark-surface transition-colors text-gray-500"
                  >
                    Vacant Position
                  </button>
                  
                  {availableUsers.map(user => (
                    <button
                      key={user.user_id}
                      onClick={() => {
                        setSelectedUserId(user.user_id);
                        setShowPositionHolderDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-dark-surface transition-colors flex items-center gap-3"
                    >
                      {user.user.avatar_url ? (
                        <img
                          src={user.user.avatar_url}
                          alt={user.user.full_name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span className="text-white text-sm">{user.user.full_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reports To */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Reports To</label>
            <div className="relative">
              <button
                onClick={() => setShowReportsToDropdown(!showReportsToDropdown)}
                className="w-full flex items-center justify-between gap-2 p-3 bg-dark-surface border border-dark-border rounded-lg hover:border-gray-600 transition-colors"
              >
                {selectedPosition ? (
                  <span className="text-white">
                    {selectedPosition.display_title || selectedPosition.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                ) : (
                  <span className="text-gray-500">No one (Top of hierarchy)</span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showReportsToDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setReportsToRole('');
                      setShowReportsToDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-dark-surface transition-colors text-gray-500"
                  >
                    No one (Top of hierarchy)
                  </button>
                  
                  {availablePositions.map(position => (
                    <button
                      key={position.role}
                      onClick={() => {
                        setReportsToRole(position.role);
                        setShowReportsToDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-dark-surface transition-colors"
                    >
                      <p className="text-white text-sm">
                        {position.display_title || position.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Position Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Position Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the responsibilities of this position..."
              className="w-full p-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-neon-green focus:outline-none resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
              saving
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-neon-green text-dark-bg hover:bg-neon-green/90"
            )}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-dark-surface border border-dark-border rounded-lg font-medium text-gray-400 hover:text-white hover:border-gray-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}