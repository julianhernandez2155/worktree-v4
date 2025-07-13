'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CelebrationAnimationProps {
  trigger: boolean;
  position?: { x: number; y: number };
  onComplete?: () => void;
  playSound?: boolean;
}

// Sprout mascot SVG component with enhanced design
const SproutMascot = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Glow effect */}
    <circle cx="60" cy="40" r="35" fill="url(#glow)" opacity="0.3" />
    
    {/* Pot with gradient */}
    <path
      d="M35 75 Q35 95 60 95 Q85 95 85 75 L80 55 L40 55 Z"
      fill="url(#potGradient)"
      stroke="#5D4037"
      strokeWidth="2"
    />
    
    {/* Pot rim */}
    <ellipse cx="60" cy="55" rx="20" ry="3" fill="#6D4C41" />
    
    {/* Main stem */}
    <path
      d="M60 35 Q60 45 58 55"
      stroke="#4CAF50"
      strokeWidth="4"
      strokeLinecap="round"
    />
    
    {/* Leaves with gradient */}
    <path
      d="M50 40 Q35 35 40 25 Q45 20 55 30"
      fill="url(#leafGradient1)"
      stroke="#388E3C"
      strokeWidth="1"
    />
    <path
      d="M70 40 Q85 35 80 25 Q75 20 65 30"
      fill="url(#leafGradient2)"
      stroke="#388E3C"
      strokeWidth="1"
    />
    
    {/* Face container */}
    <circle cx="60" cy="35" r="15" fill="#81C784" stroke="#4CAF50" strokeWidth="2" />
    
    {/* Sparkle eyes */}
    <g>
      <circle cx="54" cy="32" r="3" fill="#1976D2" />
      <circle cx="55" cy="31" r="1" fill="#FFFFFF" />
    </g>
    <g>
      <circle cx="66" cy="32" r="3" fill="#1976D2" />
      <circle cx="67" cy="31" r="1" fill="#FFFFFF" />
    </g>
    
    {/* Happy mouth */}
    <path
      d="M 52 38 Q 60 42 68 38"
      stroke="#2E7D32"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Blush cheeks */}
    <ellipse cx="46" cy="37" rx="4" ry="3" fill="#FF6B6B" opacity="0.4" />
    <ellipse cx="74" cy="37" rx="4" ry="3" fill="#FF6B6B" opacity="0.4" />
    
    {/* Celebration stars */}
    <g className="animate-pulse">
      <path d="M20 20 L22 15 L24 20 L29 20 L25 23 L27 28 L22 25 L17 28 L19 23 L15 20 Z" fill="#FFD700" opacity="0.8" />
      <path d="M90 25 L92 20 L94 25 L99 25 L95 28 L97 33 L92 30 L87 33 L89 28 L85 25 Z" fill="#FFD700" opacity="0.8" />
    </g>
    
    {/* Gradients */}
    <defs>
      <radialGradient id="glow">
        <stop offset="0%" stopColor="#00FF88" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
      </radialGradient>
      
      <linearGradient id="potGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#5D4037" />
      </linearGradient>
      
      <linearGradient id="leafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#66BB6A" />
        <stop offset="100%" stopColor="#4CAF50" />
      </linearGradient>
      
      <linearGradient id="leafGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#66BB6A" />
        <stop offset="100%" stopColor="#4CAF50" />
      </linearGradient>
    </defs>
  </svg>
);

export function CelebrationAnimation({ 
  trigger, 
  position,
  onComplete 
}: CelebrationAnimationProps) {
  const [showSprout, setShowSprout] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    // Trigger confetti with brand colors
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: [
        '#00ff88', // Neon green (primary)
        '#00cc88', // Darker green
        '#22dd88', // Medium green
        '#0099ff', // Bright blue
        '#00ccff', // Light blue
        '#ffcc00', // Gold
        '#ff6b6b'  // Soft red (for variety)
      ]
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timer = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confetti from the card position or center
      const origin = position 
        ? { x: position.x / window.innerWidth, y: position.y / window.innerHeight }
        : { x: 0.5, y: 0.5 };

      confetti({
        ...defaults,
        particleCount,
        origin,
        scalar: randomInRange(0.4, 1),
        gravity: randomInRange(0.4, 0.6),
        drift: randomInRange(-0.4, 0.4)
      });
    }, 250);

    // Show Sprout after a short delay
    const sproutTimer = setTimeout(() => {
      setShowSprout(true);
    }, 300);

    // Hide Sprout after animation
    const hideSproutTimer = setTimeout(() => {
      setShowSprout(false);
      onComplete?.();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(sproutTimer);
      clearTimeout(hideSproutTimer);
    };
  }, [trigger, position, onComplete]);

  return (
    <AnimatePresence>
      {showSprout && (
        <motion.div
          initial={{ x: -100, y: 0, rotate: -10 }}
          animate={{ 
            x: position ? position.x - 50 : window.innerWidth / 2 - 50,
            y: position ? position.y - 50 : window.innerHeight / 2 - 50,
            rotate: [0, -10, 10, -10, 0],
          }}
          exit={{ x: window.innerWidth + 100, y: 0, rotate: 10 }}
          transition={{
            x: { duration: 0.5, ease: "easeOut" },
            y: { duration: 0.5, ease: "easeOut" },
            rotate: { duration: 0.5, repeat: 2, ease: "easeInOut" },
            exit: { duration: 0.3, ease: "easeIn" }
          }}
          className="fixed z-[9999] pointer-events-none"
          style={{ width: 100, height: 100 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 0.4,
              repeat: 2,
              ease: "easeInOut"
            }}
          >
            <SproutMascot className="w-full h-full drop-shadow-lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}