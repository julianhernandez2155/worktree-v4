'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  fps: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  enabled?: boolean;
}

/**
 * Performance Monitor Component
 * Tracks and displays component render performance in development
 */
export function PerformanceMonitor({
  componentName,
  className,
  position = 'bottom-right',
  enabled = process.env.NODE_ENV === 'development',
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    fps: 60,
  });
  
  const renderTimes = useRef<number[]>([]);
  const lastFrameTime = useRef(performance.now());
  const frameCount = useRef(0);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    
    // Track render time
    return () => {
      const renderTime = performance.now() - startTime;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
      
      // Calculate average
      const avgTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime: avgTime,
        fps: prev.fps,
      }));
    };
  });

  // FPS counter
  useEffect(() => {
    if (!enabled) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTime.current;
      
      frameCount.current++;
      
      if (delta >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount.current * 1000) / delta),
        }));
        
        frameCount.current = 0;
        lastFrameTime.current = now;
      }
      
      animationFrameId.current = requestAnimationFrame(measureFPS);
    };
    
    animationFrameId.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRenderTimeColor = (time: number) => {
    if (time < 16) return 'text-green-400';
    if (time < 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={cn(
        'fixed z-50 bg-black/90 backdrop-blur-sm rounded-lg p-3',
        'border border-gray-700 font-mono text-xs',
        'pointer-events-none select-none',
        positionClasses[position],
        className
      )}
    >
      <div className="text-white font-semibold mb-1">{componentName}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Renders:</span>
          <span className="text-white">{metrics.renderCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Last:</span>
          <span className={getRenderTimeColor(metrics.lastRenderTime)}>
            {metrics.lastRenderTime.toFixed(2)}ms
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Avg:</span>
          <span className={getRenderTimeColor(metrics.averageRenderTime)}>
            {metrics.averageRenderTime.toFixed(2)}ms
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">FPS:</span>
          <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
        </div>
      </div>
    </div>
  );
}

// HOC to wrap components with performance monitoring
export function withPerformanceMonitor<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const MonitoredComponent = (props: P) => {
    return (
      <>
        <Component {...props} />
        <PerformanceMonitor componentName={componentName} />
      </>
    );
  };
  
  MonitoredComponent.displayName = `withPerformanceMonitor(${componentName})`;
  
  return MonitoredComponent;
}