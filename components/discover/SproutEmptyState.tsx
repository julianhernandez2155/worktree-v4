'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { GlassCard } from '@/components/ui/GlassCard';

export function SproutEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-2xl mx-auto mt-12"
    >
      <GlassCard className="text-center p-12">
        {/* Sprout Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.5,
            type: "spring",
            stiffness: 200
          }}
          className="w-24 h-24 bg-gradient-to-br from-neon-green/20 to-green-600/20 
                     rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <Sparkles className="w-12 h-12 text-neon-green" />
        </motion.div>

        {/* Message from Sprout */}
        <h3 className="text-2xl font-semibold text-white mb-4">
          🌱 Sprout says: "I'm still learning about you!"
        </h3>
        
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          I haven't found any perfect matches for you yet, but don't worry! 
          You can explore all available projects to find opportunities that interest you. 
          As you build your profile and skills, I'll get better at recommending projects just for you.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/discover/all-projects">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-dark-bg rounded-xl font-semibold
                       flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              Explore All Projects
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
          
          <Link href="/profile/skills">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-dark-card border border-dark-border rounded-xl 
                       font-semibold text-white hover:border-neon-green/50 transition-colors"
            >
              Update My Skills
            </motion.button>
          </Link>
        </div>

        {/* Helpful tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-neon-green/5 border border-neon-green/20 rounded-lg"
        >
          <p className="text-sm text-neon-green">
            💡 Tip: The more complete your profile, the better matches I can find for you!
          </p>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}