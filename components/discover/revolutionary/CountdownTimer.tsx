'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  deadline: string;
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isUrgent: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isUrgent: days <= 3
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.days > 7) {
    return (
      <span className="text-sm text-dark-muted">
        {timeLeft.days} days left
      </span>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-mono",
      timeLeft.isUrgent ? "text-orange-400" : "text-yellow-400"
    )}>
      {timeLeft.isUrgent && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Clock className="h-3 w-3" />
        </motion.div>
      )}
      
      <div className="flex items-center gap-0.5">
        <AnimatePresence mode="popLayout">
          {timeLeft.days > 0 && (
            <motion.span
              key={`days-${timeLeft.days}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="inline-block"
            >
              {timeLeft.days}d
            </motion.span>
          )}
          
          <motion.span
            key={`hours-${timeLeft.hours}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="inline-block"
          >
            {String(timeLeft.hours).padStart(2, '0')}
          </motion.span>
          
          <span>:</span>
          
          <motion.span
            key={`minutes-${timeLeft.minutes}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="inline-block"
          >
            {String(timeLeft.minutes).padStart(2, '0')}
          </motion.span>
          
          {timeLeft.days === 0 && (
            <>
              <span>:</span>
              <motion.span
                key={`seconds-${timeLeft.seconds}`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="inline-block"
              >
                {String(timeLeft.seconds).padStart(2, '0')}
              </motion.span>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}