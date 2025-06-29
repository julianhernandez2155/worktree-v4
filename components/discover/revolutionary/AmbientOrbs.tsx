'use client';

import { motion } from 'framer-motion';

export function AmbientOrbs() {
  // Define orb configurations with colors and positions
  const orbs = [
    {
      id: 1,
      color: 'rgba(0, 255, 136, 0.15)', // Neon green
      size: 400,
      initialX: '10%',
      initialY: '20%',
      duration: 25,
    },
    {
      id: 2,
      color: 'rgba(155, 89, 255, 0.15)', // Purple
      size: 300,
      initialX: '70%',
      initialY: '60%',
      duration: 30,
    },
    {
      id: 3,
      color: 'rgba(0, 217, 255, 0.15)', // Blue
      size: 350,
      initialX: '85%',
      initialY: '15%',
      duration: 35,
    },
    {
      id: 4,
      color: 'rgba(255, 107, 107, 0.1)', // Soft red
      size: 250,
      initialX: '25%',
      initialY: '75%',
      duration: 28,
    },
    {
      id: 5,
      color: 'rgba(0, 255, 136, 0.1)', // Another green
      size: 280,
      initialX: '50%',
      initialY: '40%',
      duration: 32,
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle at center, ${orb.color}, transparent 70%)`,
            left: orb.initialX,
            top: orb.initialY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            x: [0, 100, -50, 80, 0],
            y: [0, -80, 60, -40, 0],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Subtle gradient overlay to blend with background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-bg/30 to-dark-bg/60" />
    </div>
  );
}