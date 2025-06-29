import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconTextProps {
  icon: LucideIcon;
  text: React.ReactNode;
  iconClassName?: string | undefined;
  textClassName?: string | undefined;
  className?: string | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  variant?: 'default' | 'muted' | 'success' | 'warning' | 'error' | undefined;
  onClick?: (() => void) | undefined;
}

const sizeStyles = {
  xs: {
    container: 'gap-1',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  sm: {
    container: 'gap-1.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  md: {
    container: 'gap-2',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
  lg: {
    container: 'gap-2.5',
    icon: 'w-6 h-6',
    text: 'text-lg',
  },
};

const variantStyles = {
  default: {
    icon: 'text-gray-400',
    text: 'text-gray-300',
  },
  muted: {
    icon: 'text-gray-500',
    text: 'text-gray-500',
  },
  success: {
    icon: 'text-green-400',
    text: 'text-green-400',
  },
  warning: {
    icon: 'text-yellow-400',
    text: 'text-yellow-400',
  },
  error: {
    icon: 'text-red-400',
    text: 'text-red-400',
  },
};

/**
 * Reusable Icon + Text Component
 * Displays an icon with text in a consistent layout
 */
export const IconText = memo<IconTextProps>(({
  icon: Icon,
  text,
  iconClassName,
  textClassName,
  className,
  size = 'sm',
  variant = 'default',
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';
  const styles = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center',
        styles.container,
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
    >
      <Icon className={cn(
        styles.icon,
        variantStyle.icon,
        iconClassName
      )} />
      <span className={cn(
        styles.text,
        variantStyle.text,
        textClassName
      )}>
        {text}
      </span>
    </Component>
  );
});

IconText.displayName = 'IconText';

// Icon Text List Component for displaying multiple items
interface IconTextListProps {
  items: Array<{
    icon: LucideIcon;
    text: React.ReactNode;
    key?: string | undefined;
    onClick?: (() => void) | undefined;
  }>;
  size?: IconTextProps['size'] | undefined;
  variant?: IconTextProps['variant'] | undefined;
  separator?: React.ReactNode | undefined;
  className?: string | undefined;
  itemClassName?: string | undefined;
}

export function IconTextList({
  items,
  size = 'sm',
  variant = 'default',
  separator = '•',
  className,
  itemClassName,
}: IconTextListProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.map((item, index) => (
        <React.Fragment key={item.key || index}>
          <IconText
            icon={item.icon}
            text={item.text}
            size={size}
            variant={variant}
            onClick={item.onClick}
            className={itemClassName}
          />
          {index < items.length - 1 && separator && (
            <span className={cn(
              'text-gray-600',
              size === 'xs' && 'text-xs',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg'
            )}>
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Metadata Display Component for common patterns
interface MetadataItem {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}

interface MetadataDisplayProps {
  items: MetadataItem[];
  layout?: 'horizontal' | 'vertical' | undefined;
  size?: IconTextProps['size'] | undefined;
  className?: string | undefined;
}

export function MetadataDisplay({
  items,
  layout = 'horizontal',
  size = 'sm',
  className,
}: MetadataDisplayProps) {
  if (layout === 'vertical') {
    return (
      <div className={cn('space-y-2', className)}>
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <IconText
              icon={item.icon}
              text={item.label}
              size={size}
              variant="muted"
            />
            <span className={cn(
              'text-gray-300',
              size === 'xs' && 'text-xs',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg'
            )}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <IconTextList
      items={items.map(item => ({
        icon: item.icon,
        text: item.value,
        key: item.label,
      }))}
      size={size}
      className={className}
    />
  );
}