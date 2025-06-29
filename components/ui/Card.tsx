'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GlassCard, StaticGlassCard } from './GlassCard';

// Card variants using class-variance-authority for better composition
const cardVariants = cva(
  'transition-all duration-200',
  {
    variants: {
      variant: {
        default: '',
        clickable: 'cursor-pointer hover:shadow-dark-lg',
        selected: 'border-2 border-neon-green/50 shadow-lg shadow-neon-green/10',
        warning: 'border-2 border-yellow-500/50 bg-yellow-500/5',
        error: 'border-2 border-neon-coral/50 bg-neon-coral/5',
        success: 'border-2 border-neon-green/50 bg-neon-green/5',
      },
      size: {
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Base Card Props
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'>, VariantProps<typeof cardVariants> {
  children: ReactNode;
  className?: string | undefined;
  animated?: boolean | undefined;
  hover?: boolean | undefined;
  glow?: 'green' | 'blue' | 'purple' | 'none' | undefined;
  glassVariant?: 'default' | 'surface' | 'elevated' | undefined;
}

// Main Card component
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className, 
    variant, 
    size,
    animated = true,
    hover = true,
    glow = 'none',
    glassVariant = 'default',
    onClick,
    onMouseEnter,
    onMouseLeave,
    style,
    id,
    role,
    tabIndex,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy 
  }, ref) => {
    const Component = animated ? GlassCard : StaticGlassCard;
    
    // Build props object with only defined values
    const componentProps: any = {
      ref,
      className: cn(cardVariants({ variant, size }), className),
      hover,
      glow: glow || 'none',
      variant: glassVariant,
      children,
    };
    
    // Only add these props if they're defined
    if (onClick !== undefined) componentProps.onClick = onClick;
    if (onMouseEnter !== undefined) componentProps.onMouseEnter = onMouseEnter;
    if (onMouseLeave !== undefined) componentProps.onMouseLeave = onMouseLeave;
    if (style !== undefined) componentProps.style = style;
    if (id !== undefined) componentProps.id = id;
    if (role !== undefined) componentProps.role = role;
    if (tabIndex !== undefined) componentProps.tabIndex = tabIndex;
    if (ariaLabel !== undefined) componentProps['aria-label'] = ariaLabel;
    if (ariaLabelledBy !== undefined) componentProps['aria-labelledby'] = ariaLabelledBy;
    if (ariaDescribedBy !== undefined) componentProps['aria-describedby'] = ariaDescribedBy;
    
    return <Component {...componentProps} />;
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  avatar?: ReactNode | undefined;
  icon?: LucideIcon | undefined;
  iconClassName?: string | undefined;
  action?: ReactNode | undefined;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, avatar, icon: Icon, iconClassName, action, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-start gap-3', className)} {...props}>
        {/* Avatar or Icon */}
        {(avatar || Icon) && (
          <div className="flex-shrink-0">
            {avatar}
            {!avatar && Icon && (
              <div className="w-10 h-10 bg-dark-surface rounded-lg flex items-center justify-center">
                <Icon className={cn('h-5 w-5 text-dark-muted', iconClassName)} />
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        
        {/* Action */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };
    
    return (
      <h3 
        ref={ref} 
        className={cn('font-semibold text-white', sizeClasses[size], className)} 
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Subtitle Component
export interface CardSubtitleProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const CardSubtitle = forwardRef<HTMLParagraphElement, CardSubtitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn('text-sm text-dark-muted', className)} {...props}>
        {children}
      </p>
    );
  }
);

CardSubtitle.displayName = 'CardSubtitle';

// Card Body Component
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer Component
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('pt-4 border-t border-dark-border', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Metadata Component for icon+text pairs
export interface MetadataProps extends HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  children: ReactNode;
  iconClassName?: string | undefined;
}

export const Metadata = forwardRef<HTMLDivElement, MetadataProps>(
  ({ icon: Icon, children, iconClassName, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-2 text-sm text-dark-muted', className)} {...props}>
        <Icon className={cn('h-4 w-4', iconClassName)} />
        <span>{children}</span>
      </div>
    );
  }
);

Metadata.displayName = 'Metadata';

// Metadata Group Component
export interface MetadataGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 1 | 2 | undefined;
}

export const MetadataGroup = forwardRef<HTMLDivElement, MetadataGroupProps>(
  ({ children, columns = 2, className, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          columns === 2 ? 'grid grid-cols-2 gap-3' : 'space-y-2',
          className
        )} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

MetadataGroup.displayName = 'MetadataGroup';

// Skills/Tags Component
export interface SkillTagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'matched' | 'required' | 'growth' | undefined;
  size?: 'xs' | 'sm' | 'md' | undefined;
}

export const SkillTag = forwardRef<HTMLSpanElement, SkillTagProps>(
  ({ children, variant = 'default', size = 'sm', className, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-dark-surface text-dark-text border border-dark-border',
      matched: 'bg-neon-green/10 text-neon-green border border-neon-green/20',
      required: 'bg-dark-bg text-dark-text border border-dark-border',
      growth: 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20',
    };
    
    const sizeClasses = {
      xs: 'px-2 py-0.5 text-xs',
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'rounded-md font-medium',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

SkillTag.displayName = 'SkillTag';

// Skills Group Component
export interface SkillsGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  label?: string | undefined;
  showCount?: boolean | undefined;
  maxVisible?: number | undefined;
  totalCount?: number | undefined;
}

export const SkillsGroup = forwardRef<HTMLDivElement, SkillsGroupProps>(
  ({ children, label, showCount = true, maxVisible, totalCount, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <p className="text-xs text-dark-muted">{label}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {children}
          {showCount && maxVisible && totalCount && totalCount > maxVisible && (
            <span className="px-2.5 py-1 text-xs text-dark-muted">
              +{totalCount - maxVisible} more
            </span>
          )}
        </div>
      </div>
    );
  }
);

SkillsGroup.displayName = 'SkillsGroup';

// Badge Component for status indicators
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | undefined;
  size?: 'xs' | 'sm' | 'md' | undefined;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'sm', className, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-dark-elevated text-gray-300 border-dark-border',
      success: 'bg-neon-green/20 text-neon-green border-neon-green/50',
      warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      error: 'bg-neon-coral/20 text-neon-coral border-neon-coral/50',
      info: 'bg-neon-blue/20 text-neon-blue border-neon-blue/50',
    };
    
    const sizeClasses = {
      xs: 'px-2 py-0.5 text-xs',
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-1.5 text-base',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'rounded-full border font-medium',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Avatar Component
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | undefined;
  alt?: string | undefined;
  fallback: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
  status?: 'online' | 'offline' | 'away' | undefined;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', status, className, ...props }, ref) => {
    const sizeClasses = {
      xs: 'w-8 h-8 text-xs',
      sm: 'w-10 h-10 text-sm',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-lg',
      xl: 'w-20 h-20 text-xl',
    };
    
    const statusSizeClasses = {
      xs: 'w-2 h-2',
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5',
      xl: 'w-4 h-4',
    };
    
    const statusColors = {
      online: 'bg-neon-green',
      offline: 'bg-gray-500',
      away: 'bg-yellow-500',
    };
    
    return (
      <div ref={ref} className={cn('relative flex-shrink-0', className)} {...props}>
        <div className={cn(
          'rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center font-semibold',
          sizeClasses[size]
        )}>
          {src ? (
            <img 
              src={src} 
              alt={alt || fallback}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            fallback
          )}
        </div>
        {status && (
          <div className={cn(
            'absolute -bottom-1 -right-1 rounded-full border-2 border-dark-bg',
            statusSizeClasses[size],
            statusColors[status]
          )} />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Export a compound component for easy imports
export const CardComponents = {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  CardFooter,
  Metadata,
  MetadataGroup,
  SkillTag,
  SkillsGroup,
  Badge,
  Avatar,
};