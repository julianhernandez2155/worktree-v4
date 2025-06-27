'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'green' | 'blue' | 'purple' | 'none';
  variant?: 'default' | 'surface' | 'elevated';
}

const glowStyles = {
  green: 'hover:shadow-glow',
  blue: 'hover:shadow-glow-blue',
  purple: 'hover:shadow-glow-purple',
  none: '',
};

const variantStyles = {
  default: 'glass',
  surface: 'glass-surface',
  elevated: 'glass-elevated',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = true, glow = 'none', variant = 'default', ...props }, ref) => {
    const baseStyles = cn(
      variantStyles[variant],
      'rounded-xl p-6 transition-all duration-200',
      hover && 'card-hover',
      glow !== 'none' && glowStyles[glow],
      className
    );

    return (
      <motion.div
        ref={ref}
        className={baseStyles}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Static version without animations
export const StaticGlassCard = forwardRef<HTMLDivElement, Omit<GlassCardProps, keyof HTMLMotionProps<"div">> & HTMLAttributes<HTMLDivElement>>(
  ({ children, className, hover = true, glow = 'none', variant = 'default', ...props }, ref) => {
    const baseStyles = cn(
      variantStyles[variant],
      'rounded-xl p-6 transition-all duration-200',
      hover && 'card-hover',
      glow !== 'none' && glowStyles[glow],
      className
    );

    return (
      <div ref={ref} className={baseStyles} {...props}>
        {children}
      </div>
    );
  }
);

StaticGlassCard.displayName = 'StaticGlassCard';