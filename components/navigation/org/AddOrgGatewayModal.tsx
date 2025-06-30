'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Building } from 'lucide-react';

import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface AddOrgGatewayModalProps {
  open: boolean;
  onClose: () => void;
  onJoinExisting: () => void;
  onCreateNew: () => void;
}

export function AddOrgGatewayModal({
  open,
  onClose,
  onJoinExisting,
  onCreateNew
}: AddOrgGatewayModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-1 rounded-lg hover:bg-dark-card transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">What would you like to do?</h2>
          <p className="text-gray-400">
            Choose whether you want to join an existing organization or create a new one.
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Join Existing Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onJoinExisting}
            className={cn(
              "group relative p-6 rounded-xl",
              "bg-dark-card border border-dark-border",
              "hover:border-neon-green/50 hover:bg-dark-card/80",
              "transition-all duration-200"
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "p-4 rounded-full",
                "bg-neon-green/10 group-hover:bg-neon-green/20",
                "transition-colors"
              )}>
                <Users className="w-8 h-8 text-neon-green" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Find & Join an Existing Organization
                </h3>
                <p className="text-sm text-gray-400">
                  Browse and request to join organizations already on campus
                </p>
              </div>
            </div>
          </motion.button>

          {/* Create New Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNew}
            className={cn(
              "group relative p-6 rounded-xl",
              "bg-dark-card border border-dark-border",
              "hover:border-neon-blue/50 hover:bg-dark-card/80",
              "transition-all duration-200"
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "p-4 rounded-full",
                "bg-neon-blue/10 group-hover:bg-neon-blue/20",
                "transition-colors"
              )}>
                <Building className="w-8 h-8 text-neon-blue" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Create a New Organization
                </h3>
                <p className="text-sm text-gray-400">
                  Start your own organization and invite members
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}