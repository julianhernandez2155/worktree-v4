'use client';

import { 
  FolderOpen,
  Plus,
  Lightbulb,
  Rocket,
  Users,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

import { NeonButton } from '@/components/ui/NeonButton';

interface EmptyProjectsStateProps {
  onCreateProject: () => void;
  isAdmin: boolean;
}

export function EmptyProjectsState({ onCreateProject, isAdmin }: EmptyProjectsStateProps) {
  const tips = [
    {
      icon: Lightbulb,
      title: "Start with a small project",
      description: "Break down big ideas into manageable tasks"
    },
    {
      icon: Users,
      title: "Assign team members",
      description: "Collaborate and distribute work effectively"
    },
    {
      icon: Target,
      title: "Set clear goals",
      description: "Define success metrics and deadlines"
    }
  ];

  return (
    <div className="h-full flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Main Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-dark-card rounded-full flex items-center justify-center relative">
            <FolderOpen className="w-16 h-16 text-gray-600" />
            
            {/* Floating elements */}
            <motion.div
              animate={{ 
                y: [-5, 5, -5],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center"
            >
              <Rocket className="w-6 h-6 text-neon-green" />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [5, -5, 5],
                rotate: [5, -5, 5]
              }}
              transition={{ 
                duration: 4,
                delay: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center"
            >
              <Plus className="w-5 h-5 text-blue-400" />
            </motion.div>
          </div>
        </div>

        {/* Main Message */}
        <h2 className="text-2xl font-bold text-white mb-3">
          No projects yet
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          {isAdmin 
            ? "Create your first project to get your team started on something amazing"
            : "No projects have been created yet. Check back soon or ask your organization admin to create one."
          }
        </p>

        {/* CTA Button */}
        {isAdmin && (
          <NeonButton
            onClick={onCreateProject}
            icon={<Plus className="w-4 h-4" />}
            className="mx-auto mb-12"
          >
            Create Your First Project
          </NeonButton>
        )}

        {/* Tips Section */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-dark-card rounded-lg p-4 border border-dark-border"
                >
                  <div className="w-10 h-10 bg-dark-surface rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {tip.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Non-admin message */}
        {!isAdmin && (
          <div className="mt-12 p-6 bg-dark-card rounded-lg border border-dark-border max-w-md mx-auto">
            <p className="text-sm text-gray-400">
              💡 <span className="text-gray-300">Pro tip:</span> You can browse public projects from other organizations in the Discover section while you wait.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}