'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ActivityHeatmapProps {
  activity: Array<{ completed_at: string }>;
  compact?: boolean;
}

export function ActivityHeatmap({ activity, compact = false }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Create a map of date strings to contribution counts
    const activityMap = new Map<string, number>();
    
    activity.forEach(item => {
      const date = new Date(item.completed_at).toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });

    // Generate last 12 weeks of data
    const weeks: Array<Array<{ date: string; count: number; dayOfWeek: number }>> = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 84); // 12 weeks ago
    
    let currentWeek: Array<{ date: string; count: number; dayOfWeek: number }> = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      currentWeek.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
        dayOfWeek
      });
      
      if (dayOfWeek === 6 || currentDate.getTime() === today.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weeks;
  }, [activity]);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-dark-surface';
    if (count === 1) return 'bg-neon-green/30';
    if (count === 2) return 'bg-neon-green/50';
    if (count === 3) return 'bg-neon-green/70';
    return 'bg-neon-green';
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <h3 className={cn("font-medium text-gray-400", compact ? "text-xs mb-1" : "text-sm mb-2")}>Activity</h3>
      
      {/* Day labels */}
      <div className={cn("flex text-gray-500", compact ? "gap-[2px] text-[10px]" : "gap-1 text-xs mb-1")}>
        <div className={compact ? "w-2" : "w-3"} /> {/* Spacer for alignment */}
        {days.map((day, i) => (
          <div key={i} className={cn("text-center", compact ? "w-2" : "w-3")}>
            {i % 2 === 1 ? day : ''}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className={cn("flex", compact ? "gap-[2px]" : "gap-1")}>
        {heatmapData.map((week, weekIndex) => (
          <div key={weekIndex} className={cn("flex flex-col", compact ? "gap-[2px]" : "gap-1")}>
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const day = week.find(d => d.dayOfWeek === dayIndex);
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "rounded-sm transition-all",
                    compact ? "w-2 h-2" : "w-3 h-3",
                    day ? getIntensity(day.count) : 'bg-transparent'
                  )}
                  title={day ? `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}` : ''}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={cn("flex items-center gap-2 text-gray-400", compact ? "text-[10px] mt-1" : "text-xs mt-2")}>
        <span>Less</span>
        <div className={cn("flex", compact ? "gap-[2px]" : "gap-1")}>
          <div className={cn("bg-dark-surface rounded-sm", compact ? "w-2 h-2" : "w-3 h-3")} />
          <div className={cn("bg-neon-green/30 rounded-sm", compact ? "w-2 h-2" : "w-3 h-3")} />
          <div className={cn("bg-neon-green/50 rounded-sm", compact ? "w-2 h-2" : "w-3 h-3")} />
          <div className={cn("bg-neon-green/70 rounded-sm", compact ? "w-2 h-2" : "w-3 h-3")} />
          <div className={cn("bg-neon-green rounded-sm", compact ? "w-2 h-2" : "w-3 h-3")} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}