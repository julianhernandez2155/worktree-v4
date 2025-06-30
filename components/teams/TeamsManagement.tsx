'use client';

import { useState, useEffect } from 'react';
import { 
  Plus,
  Edit2,
  Trash2,
  Users,
  Hash,
  Palette,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
  member_count?: number;
}

interface TeamsManagementProps {
  orgSlug: string;
}

const TEAM_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
];

export function TeamsManagement({ orgSlug }: TeamsManagementProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const supabase = createClient();

  // Load teams with member count
  const loadTeams = async () => {
    try {
      setLoading(true);
      
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();
        
      if (!org) return;
      
      const { data: teamsData, error } = await supabase
        .from('organization_teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('organization_id', org.id)
        .order('name');
        
      if (error) throw error;
      
      setTeams(teamsData?.map(team => ({
        ...team,
        member_count: team.team_members?.[0]?.count || 0
      })) || []);
      
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [orgSlug]);

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const { error } = await supabase
        .from('organization_teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      
      loadTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teams & Cabinets</h1>
          <p className="text-gray-400 mt-1">
            Organize your members into focused teams
          </p>
        </div>
        
        <NeonButton
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Team
        </NeonButton>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: team.color }}
              >
                {team.name.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingTeam(team)}
                  className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-1">{team.name}</h3>
            <p className="text-sm text-gray-400 mb-1">@{team.slug}</p>
            {team.description && (
              <p className="text-sm text-gray-500 mb-4">{team.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{team.member_count} members</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingTeam) && (
          <TeamModal
            team={editingTeam}
            orgSlug={orgSlug}
            onClose={() => {
              setShowCreateModal(false);
              setEditingTeam(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingTeam(null);
              loadTeams();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Team Create/Edit Modal
function TeamModal({ 
  team, 
  orgSlug, 
  onClose, 
  onSuccess 
}: { 
  team?: Team | null; 
  orgSlug: string;
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    slug: team?.slug || '',
    description: team?.description || '',
    color: team?.color || TEAM_COLORS[0]
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Auto-generate slug from name
  useEffect(() => {
    if (!team && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();
        
      if (!org) throw new Error('Organization not found');

      if (team) {
        // Update existing team
        const { error } = await supabase
          .from('organization_teams')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            color: formData.color
          })
          .eq('id', team.id);

        if (error) throw error;
      } else {
        // Create new team
        const { error } = await supabase
          .from('organization_teams')
          .insert({
            organization_id: org.id,
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            color: formData.color
          });

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving team:', error);
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
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-dark-surface border border-dark-border rounded-xl shadow-2xl z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {team ? 'Edit Team' : 'Create Team'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                placeholder="Engineering"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Slug
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">@</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                  placeholder="engineering"
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-neon-green focus:outline-none"
                rows={3}
                placeholder="Building the future of our platform..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Team Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {TEAM_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all",
                      formData.color === color && "ring-2 ring-white ring-offset-2 ring-offset-dark-surface"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <NeonButton
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : (team ? 'Update Team' : 'Create Team')}
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
    </>
  );
}