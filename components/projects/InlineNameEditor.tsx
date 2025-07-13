'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface InlineNameEditorProps {
  projectId: string;
  currentName: string;
  currentDescription?: string;
  onUpdate: () => void;
}

export function InlineNameEditor({ 
  projectId, 
  currentName, 
  currentDescription,
  onUpdate 
}: InlineNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!name.trim() || (name === currentName && description === currentDescription)) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('internal_projects')
        .update({ 
          name: name.trim(),
          description: description.trim() || null
        })
        .eq('id', projectId);

      if (error) throw error;

      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project name:', error);
      // Reset on error
      setName(currentName);
      setDescription(currentDescription || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setDescription(currentDescription || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="min-w-0 text-left space-y-1">
        <div className="flex items-center gap-2">
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUpdating}
            className={cn(
              "flex-1 px-2 py-1 text-white font-medium",
              "bg-dark-surface border border-dark-border rounded",
              "focus:border-neon-green focus:outline-none",
              "disabled:opacity-50"
            )}
          />
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          ref={descInputRef}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isUpdating}
          placeholder="Add description..."
          className={cn(
            "w-full px-2 py-1 text-sm text-gray-400",
            "bg-dark-surface border border-dark-border rounded",
            "focus:border-neon-green focus:outline-none",
            "placeholder:text-gray-600",
            "disabled:opacity-50"
          )}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-w-0 text-left group/name cursor-text"
      onDoubleClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-white truncate">{currentName}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="opacity-0 group-hover/name:opacity-100 p-0.5 hover:text-neon-green transition-all"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
      <p className="text-sm text-gray-500 truncate">
        {currentDescription || <span className="italic">No description</span>}
      </p>
    </div>
  );
}