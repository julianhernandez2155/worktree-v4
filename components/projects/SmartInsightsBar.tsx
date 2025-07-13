'use client';

import { useState, useEffect } from 'react';
import { 
  Flame,
  Target,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InsightItem {
  id: string;
  icon: React.ElementType;
  text: string;
  color: string;
  value?: number;
  urgent?: boolean;
}

interface SmartInsightsBarProps {
  projects: any[];
  className?: string;
}

export function SmartInsightsBar({ projects, className }: SmartInsightsBarProps) {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [activeInsight, setActiveInsight] = useState(0);

  useEffect(() => {
    // Calculate insights from projects data
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const projectsNeedingAttention = projects.filter(p => {
      const isOverdue = p.due_date && new Date(p.due_date) < now;
      const hasSkillGaps = p.task_stats?.skill_gaps > 0;
      const isStalled = p.status === 'on_hold';
      return isOverdue || hasSkillGaps || isStalled;
    });

    const upcomingDeadlines = projects.filter(p => {
      if (!p.due_date) return false;
      const dueDate = new Date(p.due_date);
      return dueDate >= now && dueDate <= oneWeekFromNow;
    });

    const activeProjects = projects.filter(p => p.status === 'active');
    
    const totalSkillGaps = projects.reduce((sum, p) => 
      sum + (p.task_stats?.skill_gaps || 0), 0
    );

    const completionRate = projects.length > 0 
      ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
      : 0;

    const newInsights: InsightItem[] = [];

    // Add insights based on data
    if (projectsNeedingAttention.length > 0) {
      newInsights.push({
        id: 'attention',
        icon: Flame,
        text: `${projectsNeedingAttention.length} project${projectsNeedingAttention.length > 1 ? 's' : ''} need attention`,
        color: 'text-orange-400',
        value: projectsNeedingAttention.length,
        urgent: true
      });
    }

    if (upcomingDeadlines.length > 0) {
      newInsights.push({
        id: 'deadlines',
        icon: Target,
        text: `${upcomingDeadlines.length} deadline${upcomingDeadlines.length > 1 ? 's' : ''} this week`,
        color: 'text-yellow-400',
        value: upcomingDeadlines.length,
        urgent: upcomingDeadlines.length > 2
      });
    }

    if (completionRate > 0) {
      newInsights.push({
        id: 'velocity',
        icon: TrendingUp,
        text: `Team velocity ${completionRate}% completion rate`,
        color: 'text-green-400',
        value: completionRate
      });
    }

    if (totalSkillGaps > 0) {
      newInsights.push({
        id: 'skills',
        icon: Sparkles,
        text: `${totalSkillGaps} skill gap${totalSkillGaps > 1 ? 's' : ''} to fill`,
        color: 'text-purple-400',
        value: totalSkillGaps
      });
    }

    if (activeProjects.length > 0) {
      newInsights.push({
        id: 'active',
        icon: Zap,
        text: `${activeProjects.length} active project${activeProjects.length > 1 ? 's' : ''}`,
        color: 'text-blue-400',
        value: activeProjects.length
      });
    }

    // If no insights, show a motivational message
    if (newInsights.length === 0) {
      newInsights.push({
        id: 'ready',
        icon: Sparkles,
        text: 'All systems go! Ready to create something amazing?',
        color: 'text-neon-green'
      });
    }

    setInsights(newInsights);
  }, [projects]);

  // Rotate through insights every 5 seconds if there are multiple
  useEffect(() => {
    if (insights.length <= 3) return; // Don't rotate if we can show all insights

    const interval = setInterval(() => {
      setActiveInsight((prev) => (prev + 1) % Math.max(1, insights.length - 2));
    }, 5000);

    return () => clearInterval(interval);
  }, [insights.length]);

  const visibleInsights = insights.length <= 3 
    ? insights 
    : insights.slice(activeInsight, activeInsight + 3);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg",
      "bg-gradient-to-r from-dark-card via-dark-card/80 to-dark-card",
      "border border-dark-border",
      "px-6 py-3",
      className
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-transparent to-purple-500/5 animate-pulse" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div 
            key={visibleInsights.map(i => i.id).join('-')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-6"
          >
            {visibleInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    insight.urgent && "animate-pulse"
                  )}>
                    <Icon className={cn("w-4 h-4", insight.color)} />
                    <span className={cn(
                      "text-sm font-medium",
                      insight.urgent ? insight.color : "text-gray-300"
                    )}>
                      {insight.text}
                    </span>
                  </div>
                  {index < visibleInsights.length - 1 && (
                    <div className="h-4 w-px bg-dark-border ml-2" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator if there are more insights */}
        {insights.length > 3 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(insights.length / 3) }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === Math.floor(activeInsight / 3)
                    ? "bg-neon-green w-3"
                    : "bg-gray-600"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}