'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface NavItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
  collapsed?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

export function NavItem({
  name,
  href,
  icon: Icon,
  isActive = false,
  collapsed = false,
  isMobile = false,
  onClick
}: NavItemProps) {
  const content = (
    <>
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-neon-green rounded-r-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Icon container */}
      <div className={cn(
        "flex items-center justify-center transition-colors duration-200",
        isActive ? "text-neon-green" : "text-gray-400 group-hover:text-white",
        collapsed && !isMobile ? "w-10 h-10" : "w-10 h-10"
      )}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Text label */}
      {(!collapsed || isMobile) && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isActive ? "text-white" : "text-gray-300 group-hover:text-white"
          )}
        >
          {name}
        </motion.span>
      )}
    </>
  );

  const baseClasses = cn(
    "group relative flex items-center gap-3 rounded-lg transition-all duration-200",
    "hover:bg-dark-card/50",
    isActive && "bg-dark-card",
    collapsed && !isMobile ? "px-0 py-2 justify-center" : "px-3 py-2",
    isMobile && "min-h-[48px]" // Ensure touch-friendly size on mobile
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(baseClasses, "w-full text-left")}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      {content}
    </Link>
  );
}