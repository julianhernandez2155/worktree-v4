'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, CalendarPlus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface InlineDateEditorProps {
  projectId: string;
  currentDate?: string;
  fieldName?: string;
  onUpdate?: () => void;
  placeholder?: string;
}

export function InlineDateEditor({ 
  projectId, 
  currentDate, 
  fieldName = 'due_date',
  onUpdate,
  placeholder = 'Set date'
}: InlineDateEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentDate || '');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('internal_projects')
        .update({ [fieldName]: value || null })
        .eq('id', projectId);

      if (error) throw error;
      
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating date:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(currentDate || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysUntil = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', className: 'text-red-400' };
    if (diffDays === 0) return { text: 'Today', className: 'text-yellow-400' };
    if (diffDays === 1) return { text: 'Tomorrow', className: 'text-yellow-400' };
    if (diffDays <= 7) return { text: `${diffDays} days`, className: 'text-green-400' };
    return { text: `${diffDays} days`, className: 'text-gray-400' };
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="px-2 py-1 text-sm bg-dark-surface border border-neon-green/50 rounded focus:outline-none focus:border-neon-green"
          disabled={loading}
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="p-1 text-neon-green hover:bg-dark-surface rounded transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-white hover:bg-dark-surface rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (currentDate) {
    const daysInfo = calculateDaysUntil(currentDate);
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:bg-dark-surface transition-colors group"
      >
        <span className={cn("text-sm", daysInfo?.className || "text-gray-300")}>
          {daysInfo?.text || formatDate(currentDate)}
        </span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </button>
    );
  }

  return (
    <button 
      onClick={() => setIsEditing(true)}
      className="w-10 h-10 rounded-lg border border-dashed border-gray-600 flex items-center justify-center hover:border-neon-green hover:bg-dark-surface transition-all group/datebtn"
    >
      <CalendarPlus className="w-6 h-6 text-gray-600 group-hover/datebtn:text-neon-green" />
    </button>
  );
}