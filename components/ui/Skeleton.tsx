import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-dark-surface',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
}

// Composite skeleton components for common patterns
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 bg-dark-card border border-dark-border rounded-lg', className)}>
      <div className="space-y-4">
        <Skeleton height={24} width="60%" />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
        <div className="flex gap-2 mt-4">
          <Skeleton height={32} width={100} />
          <Skeleton height={32} width={100} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-dark-card rounded-lg">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton width="30%" height={20} />
            <Skeleton width="50%" height={16} />
          </div>
        </div>
      ))}
    </div>
  );
}