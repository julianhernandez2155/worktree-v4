'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CardLightTraceProps {
  isActive: boolean;
  duration?: number;
  variant?: 'single' | 'double' | 'pulse';
}

export function CardLightTrace({ 
  isActive, 
  duration = 2, 
  variant = 'double' 
}: CardLightTraceProps) {
  const [showTrace, setShowTrace] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowTrace(true);
      const timer = setTimeout(() => {
        setShowTrace(false);
      }, duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  if (variant === 'pulse') {
    return (
      <AnimatePresence>
        {showTrace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(0, 255, 136, 0)',
                  '0 0 0 4px rgba(0, 255, 136, 0.4)',
                  '0 0 0 8px rgba(0, 255, 136, 0.2)',
                  '0 0 0 12px rgba(0, 255, 136, 0.1)',
                  '0 0 0 16px rgba(0, 255, 136, 0)',
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: 1,
                ease: "easeOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {showTrace && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
        >
          {/* First light trace */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeDasharray="100% 0"
              rx="6"
            >
              <animate
                attributeName="stroke-dasharray"
                from="0 100%"
                to="100% 0"
                dur={`${duration * 0.5}s`}
                fill="freeze"
              />
            </rect>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0" />
                <stop offset="50%" stopColor="#00ff88" stopOpacity="1" />
                <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Second light trace (if double variant) */}
          {variant === 'double' && (
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                fill="none"
                stroke="url(#gradient2)"
                strokeWidth="2"
                strokeDasharray="100% 0"
                rx="6"
                transform="rotate(180, 50%, 50%)"
              >
                <animate
                  attributeName="stroke-dasharray"
                  from="0 100%"
                  to="100% 0"
                  dur={`${duration * 0.5}s`}
                  begin="0.2s"
                  fill="freeze"
                />
              </rect>
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#00ffff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}