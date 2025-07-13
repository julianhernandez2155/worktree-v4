'use client';

import { useState } from 'react';
import { 
  UserPlus,
  TrendingUp,
  Calendar,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  Archive,
  Trash2,
  Edit2,
  Users,
  Flag
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface QuickActionButtonsProps {
  project: any;
  onUpdate: () => void;
  className?: string;
}

export function QuickActionButtons({ project, onUpdate, className }: QuickActionButtonsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const handleQuickAction = async (action: string, value?: any) => {
    setIsUpdating(true);
    try {
      switch (action) {
        case 'status':
          await supabase
            .from('internal_projects')
            .update({ status: value })
            .eq('id', project.id);
          break;
        
        case 'priority':
          await supabase
            .from('internal_projects')
            .update({ priority: value })
            .eq('id', project.id);
          break;
        
        case 'archive':
          await supabase
            .from('internal_projects')
            .update({ status: 'archived' })
            .eq('id', project.id);
          break;
        
        case 'delete':
          if (confirm('Are you sure you want to delete this project?')) {
            await supabase
              .from('internal_projects')
              .delete()
              .eq('id', project.id);
          }
          break;
      }
      
      onUpdate();
    } catch (error) {
      console.error('Quick action failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusActions = [
    { icon: Play, label: 'Start', status: 'active', color: 'text-green-400' },
    { icon: Pause, label: 'Pause', status: 'on_hold', color: 'text-yellow-400' },
    { icon: CheckCircle, label: 'Complete', status: 'completed', color: 'text-gray-400' },
  ];

  const priorityColors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-gray-400'
  };

  return (
    <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", className)}>
      {/* Quick Status Actions */}
      {project.status !== 'completed' && project.status !== 'archived' && (
        <>
          {statusActions.map((action) => (
            <button
              key={action.status}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction('status', action.status);
              }}
              disabled={isUpdating || project.status === action.status}
              className={cn(
                "p-1.5 rounded-md transition-all",
                "hover:bg-dark-surface",
                project.status === action.status && "opacity-50 cursor-not-allowed"
              )}
              title={action.label}
            >
              <action.icon className={cn("w-3.5 h-3.5", action.color)} />
            </button>
          ))}
        </>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "p-1.5 rounded-md transition-all",
              "hover:bg-dark-surface"
            )}
          >
            <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={5}
            className={cn(
              "w-48 rounded-lg p-1.5",
              "bg-dark-card border border-dark-border",
              "shadow-xl shadow-black/20",
              "animate-in fade-in-0 zoom-in-95"
            )}
          >
            <DropdownMenu.Label className="px-2 py-1.5 text-xs font-medium text-gray-400">
              Quick Actions
            </DropdownMenu.Label>
            
            <DropdownMenu.Separator className="my-1 h-px bg-dark-border" />
            
            {/* Priority Submenu */}
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 rounded-md hover:bg-dark-surface outline-none cursor-pointer">
                <Flag className="w-4 h-4" />
                Set Priority
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  sideOffset={2}
                  alignOffset={-5}
                  className={cn(
                    "w-40 rounded-lg p-1.5",
                    "bg-dark-card border border-dark-border",
                    "shadow-xl shadow-black/20"
                  )}
                >
                  {Object.entries(priorityColors).map(([priority, color]) => (
                    <DropdownMenu.Item
                      key={priority}
                      onClick={() => handleQuickAction('priority', priority)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-dark-surface outline-none cursor-pointer"
                    >
                      <Flag className={cn("w-4 h-4", color)} />
                      <span className="capitalize text-gray-300">{priority}</span>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 rounded-md hover:bg-dark-surface outline-none cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 rounded-md hover:bg-dark-surface outline-none cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Set Due Date
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 rounded-md hover:bg-dark-surface outline-none cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              Quick Edit
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-dark-border" />

            <DropdownMenu.Item
              onClick={() => handleQuickAction('archive')}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 rounded-md hover:bg-dark-surface outline-none cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              Archive Project
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={() => handleQuickAction('delete')}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 rounded-md hover:bg-red-500/10 outline-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}