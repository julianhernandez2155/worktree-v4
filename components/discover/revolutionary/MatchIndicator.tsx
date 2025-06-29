'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MatchIndicatorProps {
  score: number;
}

export function MatchIndicator({ score }: MatchIndicatorProps) {
  const segments = 5;
  const filledSegments = Math.round((score / 100) * segments);
  
  const getColor = () => {
    if (score >= 80) return 'bg-neon-green';
    if (score >= 60) return 'bg-yellow-400';
    if (score >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs text-dark-muted">Match</span>
      
      <div className="flex gap-1 flex-1">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < filledSegments ? getColor() : "bg-dark-bg"
            )}
          />
        ))}
      </div>
      
      <motion.span 
        className={cn("text-xs font-bold", getColor().replace('bg-', 'text-'))}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {score}%
      </motion.span>
    </div>
  );
}