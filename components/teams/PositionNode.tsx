'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { UserPlus, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PositionNodeData {
  role: string;
  member?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  team?: {
    id: string;
    name: string;
    color: string;
  };
  isVacant: boolean;
  description?: string;
  isEditing?: boolean;
  onEdit?: () => void;
}

interface PositionNodeProps {
  data: PositionNodeData;
  selected: boolean;
}

export const PositionNode = memo(({ data, selected }: PositionNodeProps) => {
  const { role, member, team, isVacant, isEditing, onEdit } = data;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-dark-border"
        style={{ width: 8, height: 8 }}
      />
      
      <div
        className={cn(
          "relative min-w-[200px] max-w-[250px] bg-dark-surface rounded-lg border-2 transition-all cursor-pointer",
          isVacant 
            ? "border-dashed border-gray-600 hover:border-gray-500" 
            : "border-dark-border hover:border-gray-600",
          selected && "ring-2 ring-neon-green border-neon-green",
          isEditing && "hover:shadow-lg"
        )}
        onClick={isEditing ? onEdit : undefined}
      >
        {/* Team color accent */}
        {team && (
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
            style={{ backgroundColor: team.color }}
          />
        )}
        
        <div className="p-4 pt-3">
          {/* Role title */}
          <h3 className={cn(
            "font-semibold text-sm mb-2",
            isVacant ? "text-gray-500" : "text-white"
          )}>
            {role}
          </h3>
          
          {/* Member info or vacant state */}
          {member ? (
            <div className="flex items-center gap-2">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{member.full_name}</p>
                {team && (
                  <p className="text-xs text-gray-500 truncate">{team.name}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <p className="text-sm">Vacant Position</p>
            </div>
          )}
          
          {/* Edit mode indicator */}
          {isEditing && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-dark-border"
        style={{ width: 8, height: 8 }}
      />
    </>
  );
});

PositionNode.displayName = 'PositionNode';