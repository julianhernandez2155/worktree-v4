'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Check, Shield, Users } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role?: string;
}

interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrg: Organization | null;
  isExpanded: boolean;
  onClose: () => void;
  onOrgSwitch: (org: Organization) => void;
  onAddOrgClick: () => void;
  collapsed?: boolean;
  isMobile?: boolean;
}

export function OrgSwitcher({
  organizations,
  currentOrg,
  isExpanded,
  onClose,
  onOrgSwitch,
  onAddOrgClick,
  collapsed = false,
  isMobile = false
}: OrgSwitcherProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'president':
      case 'admin':
        return 'bg-neon-purple text-white';
      case 'vice_president':
      case 'treasurer':
      case 'secretary':
        return 'bg-neon-blue text-white';
      default:
        return 'bg-dark-elevated text-gray-300';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'president':
      case 'admin':
        return <Shield className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: "auto", 
            opacity: 1,
            transition: {
              height: { duration: 0.3, ease: "easeOut" },
              opacity: { duration: 0.2, delay: 0.05 }
            }
          }}
          exit={{ 
            height: 0, 
            opacity: 0,
            transition: {
              height: { duration: 0.3, ease: "easeIn" },
              opacity: { duration: 0.15 }
            }
          }}
          className="overflow-hidden border-b border-dark-border"
        >
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            exit={{ y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-dark-surface",
              "max-h-[50vh] overflow-y-auto custom-scrollbar"
            )}
          >
            <div className="p-2">
              {/* Organization list */}
              <div className="space-y-1 mb-2">
                {organizations.map((org) => {
                  const isActive = currentOrg?.id === org.id;
                  
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        if (!isActive) {
                          onOrgSwitch(org);
                        }
                        onClose();
                      }}
                      className={cn(
                        "w-full group relative rounded-lg transition-all duration-200",
                        "hover:bg-dark-card/50",
                        isActive && "bg-dark-card",
                        "p-3"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-green rounded-r-full" />
                        )}

                        {/* Organization avatar */}
                        <div className={cn(
                          "relative flex-shrink-0 rounded-lg overflow-hidden",
                          "bg-gradient-to-br from-gray-600 to-gray-700",
                          "flex items-center justify-center font-semibold",
                          "w-10 h-10 text-sm"
                        )}>
                          {org.logo_url ? (
                            <img 
                              src={org.logo_url} 
                              alt={org.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            getInitials(org.name)
                          )}
                        </div>

                        {/* Organization info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium text-sm",
                              isActive ? "text-white" : "text-gray-300"
                            )}>
                              {org.name}
                            </span>
                            {isActive && (
                              <Check className="w-4 h-4 text-neon-green" />
                            )}
                          </div>
                          {org.role && (
                            <div className="flex items-center gap-1 mt-1">
                              {getRoleIcon(org.role)}
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                getRoleBadgeColor(org.role)
                              )}>
                                {org.role}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-dark-border my-2" />

              {/* Add/Create Organization button */}
              <button
                onClick={() => {
                  onAddOrgClick();
                  onClose();
                }}
                className={cn(
                  "w-full group rounded-lg transition-all duration-200",
                  "hover:bg-dark-card/50",
                  "p-3"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex-shrink-0 rounded-lg bg-dark-card",
                    "group-hover:bg-neon-green/20",
                    "flex items-center justify-center transition-colors",
                    "w-10 h-10"
                  )}>
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-neon-green" />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-neon-green font-medium">
                    Add / Create Organization
                  </span>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}