'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  onClose?: () => void;
  minDate?: string;
  maxDate?: string;
  position?: 'bottom' | 'top-left';
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({ value, onChange, onClose, minDate, maxDate, position = 'bottom' }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().split('T')[0];
    onChange(dateString);
    onClose?.();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (date: Date) => {
    if (!date) return false;
    const dateString = date.toISOString().split('T')[0];
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div 
      ref={calendarRef}
      className={cn(
        "absolute z-[100] bg-dark-card border border-dark-border rounded-lg shadow-xl p-4 w-80",
        position === 'bottom' ? "mt-1 left-0" : "bottom-full mb-2 right-0"
      )}
      style={{ minWidth: '320px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-dark-surface rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        
        <div className="text-sm font-medium text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-dark-surface rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-xs text-gray-500 text-center py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-8" />;
          }

          const disabled = isDateDisabled(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && handleDateClick(date)}
              disabled={disabled}
              className={cn(
                "h-8 w-8 rounded text-sm transition-colors flex items-center justify-center",
                disabled && "text-gray-600 cursor-not-allowed",
                !disabled && !selected && "text-gray-300 hover:bg-dark-surface",
                today && !selected && "text-neon-green font-medium",
                selected && "bg-neon-green text-black font-medium"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-4 pt-4 border-t border-dark-border flex gap-2">
        <button
          onClick={() => {
            const today = new Date();
            handleDateClick(today);
          }}
          className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-dark-surface rounded transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            handleDateClick(tomorrow);
          }}
          className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-dark-surface rounded transition-colors"
        >
          Tomorrow
        </button>
        <button
          onClick={() => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            handleDateClick(nextWeek);
          }}
          className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-dark-surface rounded transition-colors"
        >
          Next week
        </button>
      </div>
    </div>
  );
}