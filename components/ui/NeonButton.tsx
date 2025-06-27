'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary: 'bg-neon-green text-dark-bg hover:shadow-glow hover:shadow-glow-lg font-semibold',
  secondary: 'glass border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue',
  ghost: 'text-gray-400 hover:text-white hover:bg-dark-card',
  danger: 'bg-neon-coral/20 text-neon-coral hover:bg-neon-coral/30 border border-neon-coral/50',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false,
    fullWidth = false,
    glow = true,
    icon,
    iconPosition = 'left',
    ...props 
  }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      glow && variant === 'primary' && 'glow-green',
      glow && variant === 'secondary' && 'glow-blue',
      variant === 'primary' && 'focus:ring-neon-green',
      variant === 'secondary' && 'focus:ring-neon-blue',
      variant === 'danger' && 'focus:ring-neon-coral',
      className
    );

    const buttonContent = (
      <>
        {loading && <Loader2 className="animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </>
    );

    return (
      <motion.button
        ref={ref}
        className={baseStyles}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

NeonButton.displayName = 'NeonButton';

// Static version without animations
export const StaticNeonButton = forwardRef<HTMLButtonElement, Omit<NeonButtonProps, keyof HTMLMotionProps<"button">> & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false,
    fullWidth = false,
    glow = true,
    icon,
    iconPosition = 'left',
    ...props 
  }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      glow && variant === 'primary' && 'glow-green',
      glow && variant === 'secondary' && 'glow-blue',
      variant === 'primary' && 'focus:ring-neon-green',
      variant === 'secondary' && 'focus:ring-neon-blue',
      variant === 'danger' && 'focus:ring-neon-coral',
      className
    );

    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

StaticNeonButton.displayName = 'StaticNeonButton';