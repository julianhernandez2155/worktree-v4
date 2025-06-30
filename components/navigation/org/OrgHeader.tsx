'use client';

import { motion } from 'framer-motion';
import { Building2, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

interface OrgHeaderProps {
  organization: Organization | null;
  collapsed?: boolean;
  isMobile?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

export function OrgHeader({ 
  organization, 
  collapsed = false, 
  isMobile = false,
  isExpanded = false,
  onClick
}: OrgHeaderProps) {
  const isClickable = !!onClick;

  if (!organization) {
    return (
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-dark-card animate-pulse" />
          {(!collapsed || isMobile) && (
            <div className="flex-1">
              <div className="h-4 w-32 bg-dark-card rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const content = (
    <>
      {/* Organization Logo/Avatar */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative flex-shrink-0 rounded-lg overflow-hidden",
          "bg-gradient-to-br from-dark-elevated to-dark-card",
          "flex items-center justify-center",
          collapsed && !isMobile ? "w-10 h-10" : "w-12 h-12"
        )}
      >
        {organization.logo_url ? (
          <img 
            src={organization.logo_url} 
            alt={organization.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {organization.name.toLowerCase().includes('org') ? (
              <Building2 className={cn(
                "text-gray-400",
                collapsed && !isMobile ? "w-5 h-5" : "w-6 h-6"
              )} />
            ) : (
              <span className={cn(
                "font-semibold text-gray-300",
                collapsed && !isMobile ? "text-sm" : "text-base"
              )}>
                {getInitials(organization.name)}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Organization Name and Context */}
      {(!collapsed || isMobile) && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          <h2 className="font-semibold text-white text-sm truncate">
            {organization.name}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Organization Workspace
          </p>
        </motion.div>
      )}

      {/* Chevron indicator if clickable */}
      {isClickable && (!collapsed || isMobile) && (
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full border-b border-dark-border transition-colors",
          "hover:bg-dark-card/30 cursor-pointer",
          collapsed && !isMobile ? "p-3" : "p-4"
        )}
      >
        <div className="flex items-center gap-3">
          {content}
        </div>
      </button>
    );
  }

  return (
    <div className={cn(
      "border-b border-dark-border",
      collapsed && !isMobile ? "p-3" : "p-4"
    )}>
      <div className="flex items-center gap-3">
        {content}
      </div>
    </div>
  );
}