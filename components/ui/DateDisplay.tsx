'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export type DateFormat = 
  | 'relative' 
  | 'absolute' 
  | 'deadline' 
  | 'short' 
  | 'long' 
  | 'year-only'
  | 'month-day'
  | 'full';

export type DateStyle = 'default' | 'muted' | 'success' | 'warning' | 'danger';

interface DateDisplayProps {
  date: string | Date | null | undefined;
  format?: DateFormat;
  style?: DateStyle;
  showIcon?: boolean;
  fallback?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Formats a date into a relative time string (e.g., "2 days ago", "in 3 hours")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMs < 0) {
    // Future dates
    const futureDiffMs = Math.abs(diffMs);
    const futureDiffSecs = Math.floor(futureDiffMs / 1000);
    const futureDiffMins = Math.floor(futureDiffSecs / 60);
    const futureDiffHours = Math.floor(futureDiffMins / 60);
    const futureDiffDays = Math.floor(futureDiffHours / 24);

    if (futureDiffDays === 0) return 'Today';
    if (futureDiffDays === 1) return 'Tomorrow';
    if (futureDiffDays < 7) return `In ${futureDiffDays} days`;
    if (futureDiffDays < 30) return `In ${Math.floor(futureDiffDays / 7)} weeks`;
    return `In ${Math.floor(futureDiffDays / 30)} months`;
  }

  // Past dates
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
}

/**
 * Formats a deadline with appropriate styling and messaging
 */
function formatDeadline(date: Date): { text: string; urgency: 'low' | 'medium' | 'high' | 'expired' } {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { text: 'Closed', urgency: 'expired' };
  }

  if (diffDays === 0) {
    return { text: 'Due today', urgency: 'high' };
  }

  if (diffDays === 1) {
    return { text: 'Due tomorrow', urgency: 'high' };
  }

  if (diffDays <= 3) {
    return { text: `${diffDays} days left`, urgency: 'high' };
  }

  if (diffDays <= 7) {
    return { text: `${diffDays} days left`, urgency: 'medium' };
  }

  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diffDays <= 30) {
    return { text: `${formatted} (${diffDays} days)`, urgency: 'low' };
  }

  return { text: formatted, urgency: 'low' };
}

/**
 * Gets the appropriate color classes based on style and urgency
 */
function getColorClasses(style: DateStyle, urgency?: 'low' | 'medium' | 'high' | 'expired'): string {
  if (urgency) {
    switch (urgency) {
      case 'expired':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-gray-400';
    }
  }

  switch (style) {
    case 'success':
      return 'text-neon-green';
    case 'warning':
      return 'text-yellow-400';
    case 'danger':
      return 'text-red-400';
    case 'muted':
      return 'text-gray-400';
    default:
      return 'text-gray-300';
  }
}

/**
 * Gets the appropriate icon based on format and urgency
 */
function getIcon(format: DateFormat, urgency?: 'low' | 'medium' | 'high' | 'expired') {
  if (format === 'deadline' && (urgency === 'high' || urgency === 'expired')) {
    return AlertCircle;
  }
  if (format === 'relative') {
    return Clock;
  }
  return Calendar;
}

/**
 * A reusable component for displaying dates in various formats with consistent styling
 * 
 * @example
 * ```tsx
 * // Relative time
 * <DateDisplay date={task.created_at} format="relative" />
 * 
 * // Deadline with urgency colors
 * <DateDisplay date={project.deadline} format="deadline" showIcon />
 * 
 * // Absolute date with custom prefix
 * <DateDisplay date={event.date} format="long" prefix="Event date: " />
 * ```
 */
export const DateDisplay = memo(function DateDisplay({
  date,
  format = 'absolute',
  style = 'default',
  showIcon = false,
  fallback = 'No date',
  prefix,
  suffix,
  className
}: DateDisplayProps) {
  const { formattedDate, urgency, IconComponent } = useMemo(() => {
    if (!date) {
      return { formattedDate: fallback, urgency: undefined, IconComponent: null };
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check for invalid date
    if (isNaN(dateObj.getTime())) {
      return { formattedDate: fallback, urgency: undefined, IconComponent: null };
    }

    let formatted: string;
    let urgencyLevel: 'low' | 'medium' | 'high' | 'expired' | undefined;

    switch (format) {
      case 'relative':
        formatted = formatRelativeTime(dateObj);
        break;

      case 'deadline':
        const deadline = formatDeadline(dateObj);
        formatted = deadline.text;
        urgencyLevel = deadline.urgency;
        break;

      case 'short':
        formatted = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        break;

      case 'long':
        formatted = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        break;

      case 'year-only':
        formatted = dateObj.getFullYear().toString();
        break;

      case 'month-day':
        formatted = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        break;

      case 'full':
        formatted = dateObj.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        break;

      case 'absolute':
      default:
        formatted = dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
    }

    const icon = showIcon ? getIcon(format, urgencyLevel) : null;

    return { 
      formattedDate: formatted, 
      urgency: urgencyLevel,
      IconComponent: icon
    };
  }, [date, format, fallback, showIcon]);

  const colorClasses = getColorClasses(style, urgency);

  return (
    <span className={cn('inline-flex items-center gap-1', colorClasses, className)}>
      {showIcon && IconComponent && (
        <IconComponent className="h-4 w-4" />
      )}
      {prefix && <span>{prefix}</span>}
      <span>{formattedDate}</span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
});

// Export utility functions for direct use if needed
export { formatRelativeTime, formatDeadline };