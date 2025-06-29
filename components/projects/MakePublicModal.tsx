'use client';

import { 
  X, 
  Globe, 
  Lock,
  AlertCircle,
  Users,
  Clock,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

interface MakePublicModalProps {
  project: {
    id: string;
    name: string;
    description: string;
    is_public: boolean;
  };
  isPublic: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export function MakePublicModal({ 
  project, 
  isPublic, 
  onClose, 
  onConfirm 
}: MakePublicModalProps) {
  const [formData, setFormData] = useState({
    publicDescription: project.description || '',
    commitmentHours: 5,
    maxApplicants: 5,
    applicationDeadline: '',
    applicationRequirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up data before sending
    const cleanedData = {
      ...formData,
      applicationDeadline: formData.applicationDeadline || null
    };
    onConfirm(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isPublic ? 'Make Project Private' : 'Share with Campus Community'}
              </h2>
              <p className="text-dark-muted">
                {isPublic 
                  ? 'Remove this project from the discover feed'
                  : 'Let other students discover and apply to your project'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-dark-muted" />
            </button>
          </div>
        </div>

        {isPublic ? (
          // Make Private Confirmation
          <div className="p-6">
            <div className="mb-6 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-medium mb-1">
                    This will remove your project from the discover feed
                  </p>
                  <p className="text-sm text-dark-muted">
                    • Current applications will remain active<br />
                    • No new students will be able to apply<br />
                    • Project will only be visible to organization members
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <NeonButton variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </NeonButton>
              <NeonButton 
                variant="secondary"
                onClick={() => onConfirm({})}
                className="flex-1 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                Make Private
              </NeonButton>
            </div>
          </div>
        ) : (
          // Make Public Form
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="mb-6 p-4 bg-neon-green/10 rounded-lg border border-neon-green/20">
              <div className="flex gap-3">
                <Globe className="h-5 w-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-neon-green font-medium mb-1">
                    Share your project with the campus
                  </p>
                  <p className="text-sm text-dark-muted">
                    Students with matching skills will discover your project and can apply to help
                  </p>
                </div>
              </div>
            </div>

            {/* Public Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                What will students work on? *
              </label>
              <p className="text-sm text-dark-muted mb-3">
                Help students understand the exciting work they'll do
              </p>
              <textarea
                value={formData.publicDescription}
                onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
                rows={4}
                required
                placeholder="Describe what your project does, the impact it will have, and what students will learn..."
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors resize-none"
              />
            </div>

            {/* Commitment and Timeline */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hours per Week Required *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
                  <input
                    type="number"
                    value={formData.commitmentHours}
                    onChange={(e) => setFormData({ ...formData, commitmentHours: parseInt(e.target.value) })}
                    min={1}
                    max={40}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Application Deadline
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Max Applicants */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Maximum Number of Students *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
                <input
                  type="number"
                  value={formData.maxApplicants}
                  onChange={(e) => setFormData({ ...formData, maxApplicants: parseInt(e.target.value) })}
                  min={1}
                  max={50}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors"
                />
              </div>
            </div>

            {/* Application Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Application Requirements
              </label>
              <p className="text-sm text-dark-muted mb-3">
                What should students include in their application?
              </p>
              <textarea
                value={formData.applicationRequirements}
                onChange={(e) => setFormData({ ...formData, applicationRequirements: e.target.value })}
                rows={3}
                placeholder="Portfolio links, specific experience, availability requirements..."
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 transition-colors resize-none"
              />
            </div>

            {/* What Happens Next */}
            <div className="mb-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-neon-green" />
                What happens when you make this public:
              </h4>
              <ul className="space-y-2 text-sm text-dark-muted">
                <li>• Project appears in the discover feed immediately</li>
                <li>• Students with matching skills will be notified</li>
                <li>• You'll receive applications to review</li>
                <li>• You can make it private again at any time</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <NeonButton variant="secondary" type="button" onClick={onClose} className="flex-1">
                Cancel
              </NeonButton>
              <NeonButton type="submit" className="flex-1">
                Share Project
              </NeonButton>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}