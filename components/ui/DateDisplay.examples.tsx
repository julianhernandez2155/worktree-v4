/**
 * DateDisplay Component Migration Guide
 * 
 * This file demonstrates how to migrate existing date formatting patterns
 * to use the new standardized DateDisplay component.
 */

// ============================================
// MIGRATION EXAMPLES
// ============================================

// Example 1: Basic date formatting
// OLD:
// {new Date(activity.completed_at).toLocaleDateString()}
// NEW:
// <DateDisplay date={activity.completed_at} format="short" />

// Example 2: Relative time (from OrganizationProfile)
// OLD:
// {new Date(activity.completed_at).toLocaleDateString()}
// NEW (for recent activity):
// <DateDisplay date={activity.completed_at} format="relative" />

// Example 3: Deadline formatting (from ProjectCard)
// OLD:
// const formatDeadline = () => {
//   if (!project.application_deadline) return 'Rolling basis';
//   const deadline = new Date(project.application_deadline);
//   const formatted = deadline.toLocaleDateString('en-US', { 
//     month: 'short', 
//     day: 'numeric' 
//   });
//   if (daysLeft === 0) return `Due today`;
//   if (daysLeft === 1) return `Due tomorrow`;
//   if (daysLeft && daysLeft < 0) return `Closed`;
//   if (daysLeft && daysLeft <= 7) return `${formatted} (${daysLeft} days)`;
//   return formatted;
// };
// NEW:
// <DateDisplay 
//   date={project.application_deadline}
//   format="deadline"
//   showIcon
//   fallback="Rolling basis"
// />

// Example 4: Year only (from ExperienceTimeline)
// OLD:
// {new Date(project.completed_at).getFullYear()}
// NEW:
// <DateDisplay date={project.completed_at} format="year-only" />

// Example 5: With custom styling for completed tasks
// OLD:
// <span className="text-xs text-gray-500 mt-1">
//   {new Date(task.completed_at).toLocaleDateString()}
// </span>
// NEW:
// <DateDisplay 
//   date={task.completed_at}
//   format="short"
//   style="muted"
//   className="text-xs mt-1"
// />

// Example 6: Due dates with prefix/suffix
// OLD:
// {isCompleted 
//   ? `Completed ${new Date(item.completed_at).toLocaleDateString()}`
//   : contribution.due_date 
//     ? `Due ${new Date(contribution.due_date).toLocaleDateString()}`
//     : 'In progress'
// }
// NEW:
// {isCompleted ? (
//   <DateDisplay 
//     date={item.completed_at}
//     format="short"
//     prefix="Completed "
//     style="success"
//   />
// ) : (
//   <DateDisplay 
//     date={contribution.due_date}
//     format="deadline"
//     prefix="Due "
//     fallback="In progress"
//   />
// )}

// Example 7: Full datetime for logs/history
// OLD:
// {new Date(log.created_at).toLocaleString()}
// NEW:
// <DateDisplay date={log.created_at} format="full" />

// Example 8: Custom date ranges
// OLD:
// const formatDateRange = (start: string, end: string) => {
//   const startDate = new Date(start).toLocaleDateString();
//   const endDate = new Date(end).toLocaleDateString();
//   return `${startDate} - ${endDate}`;
// };
// NEW: Use two DateDisplay components
// <span className="flex items-center gap-2">
//   <DateDisplay date={start} format="short" />
//   <span>-</span>
//   <DateDisplay date={end} format="short" />
// </span>

// ============================================
// PERFORMANCE NOTES
// ============================================

// The DateDisplay component is memoized for performance.
// When using in lists, ensure proper key props:
// 
// {items.map(item => (
//   <div key={item.id}>
//     <DateDisplay date={item.created_at} format="relative" />
//   </div>
// ))}

// For frequently updating relative times (like "2 minutes ago"),
// consider using a parent component that controls refresh intervals
// to prevent unnecessary re-renders across the entire list.

// ============================================
// TYPESCRIPT USAGE
// ============================================

// The component exports types for format and style:
// import { DateDisplay, DateFormat, DateStyle } from '@/components/ui/DateDisplay';
// 
// function MyComponent({ format }: { format: DateFormat }) {
//   return <DateDisplay date={new Date()} format={format} />;
// }

// ============================================
// DIRECT UTILITY USAGE
// ============================================

// For non-component use cases, use the exported utilities:
// import { formatRelativeTime, formatDeadline } from '@/components/ui/DateDisplay';
// 
// const relativeTime = formatRelativeTime(date);
// const deadline = formatDeadline(date);