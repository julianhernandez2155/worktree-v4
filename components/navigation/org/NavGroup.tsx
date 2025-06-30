'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface NavGroupProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  collapsed?: boolean;
  isMobile?: boolean;
  hasActiveChild?: boolean;
  children: ReactNode;
}

export function NavGroup({
  title,
  isExpanded,
  onToggle,
  collapsed = false,
  isMobile = false,
  hasActiveChild = false,
  children
}: NavGroupProps) {
  return (
    <div className="space-y-1">
      {/* Group Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
          "hover:bg-dark-card/30",
          hasActiveChild && "text-white",
          !hasActiveChild && "text-gray-500 hover:text-gray-300",
          collapsed && !isMobile && "justify-center"
        )}
      >
        {/* Chevron icon with rotation */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        {/* Group title */}
        {(!collapsed || isMobile) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-semibold uppercase tracking-wider"
          >
            {title}
          </motion.span>
        )}
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.2, ease: "easeOut" },
                opacity: { duration: 0.15, delay: 0.05 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: "easeIn" },
                opacity: { duration: 0.1 }
              }
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "space-y-1",
                !collapsed && !isMobile && "pl-6" // Indent child items on desktop
              )}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}