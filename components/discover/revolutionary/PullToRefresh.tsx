'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, refreshing, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const controls = useAnimation();
  
  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, 150));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      controls.start({ rotate: 360 });
      await onRefresh();
      controls.set({ rotate: 0 });
    }
    
    setPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ height: pullDistance }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-dark-bg/50 backdrop-blur-sm overflow-hidden"
      >
        <motion.div
          animate={controls}
          transition={{ duration: 0.5 }}
          className={`p-3 rounded-full ${
            pullDistance >= threshold ? 'bg-neon-green/20' : 'bg-dark-card'
          }`}
        >
          <RefreshCw 
            className={`h-6 w-6 ${
              pullDistance >= threshold ? 'text-neon-green' : 'text-dark-muted'
            }`}
          />
        </motion.div>
      </motion.div>

      {/* Main content */}
      <motion.div
        animate={{ y: refreshing ? 50 : pullDistance }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {children}
      </motion.div>

      {/* Refreshing indicator */}
      {refreshing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="px-4 py-2 bg-neon-green text-dark-bg rounded-full font-medium flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
            Refreshing...
          </div>
        </motion.div>
      )}
    </div>
  );
}