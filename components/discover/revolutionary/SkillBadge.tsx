'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: string;
  isMatched?: boolean;
  isNew?: boolean;
  delay?: number;
}

export function SkillBadge({ skill, isMatched, isNew, delay = 0 }: SkillBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay,
        type: "spring",
        stiffness: 500,
        damping: 20
      }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative px-3 py-1.5 rounded-full text-xs font-medium",
        "border transition-all duration-200",
        isMatched 
          ? "bg-neon-green/20 text-neon-green border-neon-green/30" 
          : isNew
          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
          : "bg-dark-bg text-dark-text border-dark-border"
      )}
    >
      {/* Glow effect for matched skills */}
      {isMatched && (
        <motion.div
          className="absolute inset-0 rounded-full bg-neon-green/20 blur-md"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className="relative flex items-center gap-1">
        {isMatched && <Sparkles className="h-3 w-3" />}
        {isNew && <TrendingUp className="h-3 w-3" />}
        <span>{skill}</span>
      </div>
    </motion.div>
  );
}