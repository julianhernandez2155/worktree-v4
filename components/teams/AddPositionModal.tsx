'use client';

import { useState, useEffect } from 'react';
import { X, Plus, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';

interface AddPositionModalProps {
  organizationId: string;
  teams: any[];
  existingMembers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPositionModal({
  organizationId,
  teams,
  existingMembers,
  onClose,
  onSuccess
}: AddPositionModalProps) {
  const [formData, setFormData] = useState({
    positionTitle: '',
    userId: '',
    reportsTo: '',
    teamId: '',
    positionDescription: '',
    createVacant: false,
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  // Load available users (org members not yet assigned to positions)
  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      // Get all organization members
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
        // Filter out users who already have non-member positions in the org chart
        const assignedUserIds = existingMembers
          .filter(m => m.role !== 'member' && m.user_id) // Only consider non-member positions
          .map(m => m.user_id);
        const available = orgMembers.filter(m => !assignedUserIds.includes(m.user_id));
        setAvailableUsers(available);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.positionTitle.trim()) {
        throw new Error('Please enter a position title');
      }
      
      if (!formData.createVacant && !formData.userId) {
        throw new Error('Please select a member or create a vacant position');
      }

      // Convert position title to role format (lowercase with underscores)
      const role = formData.positionTitle.toLowerCase().replace(/\s+/g, '_');

      if (formData.createVacant) {
        // Create vacant position in separate table
        const { error } = await supabase
          .from('vacant_positions')
          .insert({
            organization_id: organizationId,
            role: role,
            display_title: formData.positionTitle,
            reports_to_role: formData.reportsTo || null,
            position_description: formData.positionDescription || null,
            position_order: existingMembers.length,
          });

        if (error) throw error;
      } else {
        // Update existing member with position info
        const { error } = await supabase
          .from('organization_members')
          .update({
            role: role,
            display_title: formData.positionTitle,
            reports_to_role: formData.reportsTo || null,
            position_description: formData.positionDescription || null,
            position_order: existingMembers.length,
          })
          .eq('organization_id', organizationId)
          .eq('user_id', formData.userId);

        if (error) throw error;

        // If team is selected, add member to team as lead
        if (formData.teamId) {
          const { error: teamError } = await supabase
            .from('team_members')
            .insert({
              team_id: formData.teamId,
              user_id: formData.userId,
              role: 'lead'
            });

          if (teamError && teamError.code !== '23505') { // Ignore duplicate key errors
            console.error('Error adding to team:', teamError);
          }
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating position:', error);
      alert(error instanceof Error ? error.message : 'Failed to create position');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-dark-surface border border-dark-border rounded-xl shadow-2xl z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Position
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Position Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Position Title
              </label>
              <input
                type="text"
                value={formData.positionTitle}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                placeholder="e.g., President, Marketing Director, Rush Chair"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter any title that fits your organization's structure
              </p>
            </div>

            {/* Vacant Position Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="createVacant"
                checked={formData.createVacant}
                onChange={(e) => setFormData({ ...formData, createVacant: e.target.checked, userId: '' })}
                className="w-4 h-4 bg-dark-card border-dark-border rounded focus:ring-neon-green focus:ring-offset-0"
              />
              <label htmlFor="createVacant" className="text-sm text-gray-400">
                Create as vacant position (no member assigned)
              </label>
            </div>

            {/* Member Selection */}
            {!formData.createVacant && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Assign Member
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                    placeholder="Search members..."
                  />
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-dark-card border border-dark-border rounded-lg max-h-48 overflow-y-auto z-10">
                      {filteredUsers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No members found</div>
                      ) : (
                        filteredUsers.map(user => (
                          <button
                            key={user.user_id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, userId: user.user_id });
                              setSearchQuery(user.user.full_name);
                            }}
                            className={cn(
                              "w-full px-4 py-2 flex items-center gap-3 hover:bg-dark-surface transition-colors",
                              formData.userId === user.user_id && "bg-dark-surface"
                            )}
                          >
                            {user.user.avatar_url ? (
                              <img
                                src={user.user.avatar_url}
                                alt={user.user.full_name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                                {user.user.full_name.charAt(0)}
                              </div>
                            )}
                            <div className="text-left">
                              <div className="text-sm font-medium">{user.user.full_name}</div>
                              <div className="text-xs text-gray-500">{user.user.email}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports To */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Reports To
              </label>
              <select
                value={formData.reportsTo}
                onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
              >
                <option value="">No one (Top level)</option>
                {existingMembers
                  .filter((member, index, self) => 
                    // Get unique positions by role
                    index === self.findIndex(m => m.role === member.role)
                  )
                  .map(member => (
                    <option key={member.role} value={member.role}>
                      {member.display_title || member.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </option>
                  ))}
              </select>
            </div>

            {/* Team Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Assign to Team (Optional)
              </label>
              <select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
              >
                <option value="">No team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Position Description (Optional)
              </label>
              <textarea
                value={formData.positionDescription}
                onChange={(e) => setFormData({ ...formData, positionDescription: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                rows={3}
                placeholder="Key responsibilities and duties..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <NeonButton
                type="submit"
                disabled={loading}
                className="flex-1"
                icon={<Plus className="w-4 h-4" />}
              >
                {loading ? 'Creating...' : 'Create Position'}
              </NeonButton>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-dark-card text-gray-400 rounded-lg hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}