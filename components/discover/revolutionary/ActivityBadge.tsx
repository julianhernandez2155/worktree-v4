'use client';

import { motion } from 'framer-motion';
import { Users, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityBadgeProps {
  activity: {
    type: 'new_members' | 'milestone' | 'deadline_soon';
    message: string;
  };
}

export function ActivityBadge({ activity }: ActivityBadgeProps) {
  const config = {
    new_members: {
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    milestone: {
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20'
    },
    deadline_soon: {
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/20'
    }
  };

  const { icon: Icon, color, bgColor, borderColor } = config[activity.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
        bgColor, color, borderColor, "border mb-3"
      )}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: activity.type === 'milestone' ? [0, 10, -10, 0] : 0
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon className="h-3.5 w-3.5" />
      </motion.div>
      <span className="font-medium">{activity.message}</span>
    </motion.div>
  );
}