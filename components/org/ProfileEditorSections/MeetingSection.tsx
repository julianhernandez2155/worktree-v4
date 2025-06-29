'use client';

import { UseFormReturn } from 'react-hook-form';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface MeetingSectionProps {
  form: UseFormReturn<any>;
  onFieldFocus?: (field: string | null) => void;
}

const DAYS = [
  { key: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { key: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { key: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { key: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { key: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { key: 'sunday', label: 'Sun', fullLabel: 'Sunday' },
];

const COMMON_TIMES = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];

export function MeetingSection({ form, onFieldFocus }: MeetingSectionProps) {
  const { register, watch, setValue } = form;
  const meetingSchedule = watch('meeting_schedule') || {};
  const _location = watch('_location');

  // Initialize meeting schedule if empty
  useEffect(() => {
    if (!meetingSchedule || Object.keys(meetingSchedule).length === 0) {
      const initialSchedule: any = {};
      DAYS.forEach(day => {
        initialSchedule[day.key] = { enabled: false, time: '' };
      });
      setValue('meeting_schedule', initialSchedule);
    }
  }, []);

  const toggleDay = (dayKey: string) => {
    const currentSchedule = watch('meeting_schedule') || {};
    setValue('meeting_schedule', {
      ...currentSchedule,
      [dayKey]: {
        ...currentSchedule[dayKey],
        enabled: !currentSchedule[dayKey]?.enabled,
        time: currentSchedule[dayKey]?.time || '7:00 PM'
      }
    });
  };

  const updateTime = (dayKey: string, time: string) => {
    const currentSchedule = watch('meeting_schedule') || {};
    setValue('meeting_schedule', {
      ...currentSchedule,
      [dayKey]: {
        ...currentSchedule[dayKey],
        time
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Meeting & Application Info</h2>
        <p className="text-gray-400 text-sm">
          Help students know when and how they can get involved.
        </p>
      </div>

      {/* Primary Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <MapPin className="inline w-4 h-4 mr-1" />
          Primary Meeting Location
        </label>
        <input
          {...register('location')}
          onFocus={() => onFieldFocus?.('location')}
          onBlur={() => onFieldFocus?.(null)}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white 
                   focus:outline-none focus:ring-2 focus:ring-neon-green transition-all"
          placeholder="e.g., Student Union Room 301"
        />
        <p className="mt-2 text-xs text-gray-500">
          Where do you typically meet?
        </p>
      </div>

      {/* Meeting Schedule */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Calendar className="inline w-4 h-4 mr-1" />
          Regular Meeting Days
        </label>
        
        {/* Day Selector */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {DAYS.map(day => {
            const isEnabled = meetingSchedule[day.key]?.enabled;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => {
                  toggleDay(day.key);
                  onFieldFocus?.('meeting_schedule');
                  setTimeout(() => onFieldFocus?.(null), 1000);
                }}
                className={cn(
                  "relative py-3 px-2 rounded-lg border-2 transition-all text-center",
                  "hover:bg-dark-surface/50",
                  isEnabled
                    ? "border-neon-green bg-neon-green/10 text-neon-green"
                    : "border-dark-border bg-dark-surface/30 text-gray-400"
                )}
              >
                <div className="text-xs font-medium">{day.label}</div>
                {isEnabled && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-neon-green rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Time Inputs for Selected Days */}
        <div className="space-y-3">
          {DAYS.map(day => {
            if (!meetingSchedule[day.key]?.enabled) return null;
            
            return (
              <div key={day.key} className="flex items-center gap-3">
                <span className="text-sm text-white font-medium w-24">
                  {day.fullLabel}s
                </span>
                <select
                  value={meetingSchedule[day.key]?.time || '7:00 PM'}
                  onChange={(e) => updateTime(day.key, e.target.value)}
                  className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg 
                           text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                >
                  <option value="">Select time...</option>
                  {COMMON_TIMES.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                  <option value="custom">Other time...</option>
                </select>
                {meetingSchedule[day.key]?.time === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter time"
                    className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg 
                             text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                    onChange={(e) => updateTime(day.key, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {!Object.values(meetingSchedule).some((day: any) => day?.enabled) && (
          <p className="text-xs text-gray-500 mt-2">
            Click on the days above to select when your organization meets
          </p>
        )}
      </div>

      {/* How to Join */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Users className="inline w-4 h-4 mr-1" />
          How to Join
        </label>
        <textarea
          {...register('join_process')}
          onFocus={() => onFieldFocus?.('join_process')}
          onBlur={() => onFieldFocus?.(null)}
          rows={4}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white 
                   focus:outline-none focus:ring-2 focus:ring-neon-green transition-all resize-none"
          placeholder="Describe your application or joining process. Are applications required? When do you accept new members? Any prerequisites?"
        />
        <p className="mt-2 text-xs text-gray-500">
          Be clear about requirements, deadlines, and the process
        </p>
      </div>

      {/* Tips Box */}
      <div className="bg-dark-surface/50 border border-dark-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-neon-green" />
          Tips for Success
        </h4>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• Select all days your organization regularly meets</li>
          <li>• Mention if meetings are mandatory or optional in the "How to Join" section</li>
          <li>• Clarify if there are different types of meetings (general, project teams, etc.)</li>
          <li>• Include application deadlines if you have recruitment cycles</li>
        </ul>
      </div>
    </div>
  );
}