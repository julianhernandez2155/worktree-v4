'use client';

import { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
}

export function RealtimeIndicator({ isConnected, lastUpdate }: RealtimeIndicatorProps) {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (lastUpdate) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-gray-500'}`} />
          
          <AnimatePresence>
            {showPulse && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 rounded-full bg-green-400"
              />
            )}
          </AnimatePresence>
        </div>
        
        <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
    </div>
  );
}