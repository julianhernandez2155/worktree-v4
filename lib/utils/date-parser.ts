import { format, addDays, addWeeks, addMonths, endOfWeek, endOfMonth, nextMonday, nextFriday, parse, isValid } from 'date-fns';

interface ParsedDate {
  date: Date;
  confidence: 'high' | 'medium' | 'low';
  originalInput: string;
}

// Common date patterns and their handlers
const relativePatterns: Array<{
  pattern: RegExp;
  handler: (match: RegExpMatchArray) => Date;
  confidence: ParsedDate['confidence'];
}> = [
  // Today/Tomorrow
  {
    pattern: /^today$/i,
    handler: () => new Date(),
    confidence: 'high',
  },
  {
    pattern: /^tomorrow$/i,
    handler: () => addDays(new Date(), 1),
    confidence: 'high',
  },
  
  // Days of week (with or without "next")
  {
    pattern: /^(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
    handler: (match) => {
      const hasNext = !!match[1];
      const day = match[2].toLowerCase();
      const today = new Date();
      const currentDay = today.getDay();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(day);
      
      console.log('Day parsing debug:', {
        input: match[0],
        today: today.toDateString(),
        currentDay,
        currentDayName: days[currentDay],
        targetDay,
        targetDayName: day,
      });
      
      // Calculate days to add
      let daysToAdd = targetDay - currentDay;
      
      // If target day is today or in the past this week, go to next week
      // For plain day names (without "next"), assume this week if it hasn't passed
      if (daysToAdd < 0 || (daysToAdd === 0 && hasNext)) {
        daysToAdd += 7;
      }
      
      const result = addDays(today, daysToAdd);
      console.log('Day parsing result:', {
        daysToAdd,
        result: result.toDateString()
      });
      
      return result;
    },
    confidence: 'high',
  },
  
  // In X days/weeks/months
  {
    pattern: /^in\s+(\d+)\s+(day|days|week|weeks|month|months)$/i,
    handler: (match) => {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      const today = new Date();
      
      if (unit.startsWith('day')) return addDays(today, amount);
      if (unit.startsWith('week')) return addWeeks(today, amount);
      if (unit.startsWith('month')) return addMonths(today, amount);
      
      return today;
    },
    confidence: 'high',
  },
  
  // Next week/month
  {
    pattern: /^next\s+(week|month)$/i,
    handler: (match) => {
      const unit = match[1].toLowerCase();
      const today = new Date();
      
      if (unit === 'week') return addWeeks(today, 1);
      if (unit === 'month') return addMonths(today, 1);
      
      return today;
    },
    confidence: 'high',
  },
  
  // End of week/month
  {
    pattern: /^end\s+of\s+(the\s+)?(week|month)$/i,
    handler: (match) => {
      const unit = match[2].toLowerCase();
      const today = new Date();
      
      if (unit === 'week') return endOfWeek(today, { weekStartsOn: 1 }); // Monday start
      if (unit === 'month') return endOfMonth(today);
      
      return today;
    },
    confidence: 'high',
  },
  
  // This Friday, This Monday, etc.
  {
    pattern: /^this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
    handler: (match) => {
      const day = match[1].toLowerCase();
      const today = new Date();
      const currentDay = today.getDay();
      const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
      
      // If target day hasn't happened this week yet, use it
      // Otherwise, use next week's occurrence
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      
      return addDays(today, daysToAdd);
    },
    confidence: 'high',
  },
];

// Common date formats to try parsing
const dateFormats = [
  'MM/dd/yyyy',
  'MM-dd-yyyy',
  'yyyy-MM-dd',
  'MMM dd',
  'MMM dd, yyyy',
  'MMMM dd',
  'MMMM dd, yyyy',
  'dd MMM',
  'dd MMM yyyy',
];

/**
 * Parse natural language date strings into Date objects
 */
export function parseNaturalDate(input: string): ParsedDate | null {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmedInput = input.trim();
  
  // Try relative patterns first
  for (const { pattern, handler, confidence } of relativePatterns) {
    const match = trimmedInput.match(pattern);
    if (match) {
      const date = handler(match);
      return {
        date: setToEndOfDay(date),
        confidence,
        originalInput: trimmedInput,
      };
    }
  }
  
  // Try parsing with common formats
  for (const formatString of dateFormats) {
    try {
      const parsed = parse(trimmedInput, formatString, new Date());
      if (isValid(parsed)) {
        // If no year was specified and the date is in the past, assume next year
        const hasYear = /\d{4}/.test(trimmedInput);
        if (!hasYear && parsed < new Date()) {
          parsed.setFullYear(parsed.getFullYear() + 1);
        }
        
        return {
          date: setToEndOfDay(parsed),
          confidence: hasYear ? 'high' : 'medium',
          originalInput: trimmedInput,
        };
      }
    } catch {
      // Continue to next format
    }
  }
  
  // Special cases
  if (/asap|urgent|immediately|midnight|eod|end of day/i.test(trimmedInput)) {
    return {
      date: setToEndOfDay(new Date()),
      confidence: 'medium',
      originalInput: trimmedInput,
    };
  }
  
  // Handle "by [time]" patterns
  if (/^by\s+(midnight|noon|eod|end of day)$/i.test(trimmedInput)) {
    return {
      date: setToEndOfDay(new Date()),
      confidence: 'high',
      originalInput: trimmedInput,
    };
  }
  
  return null;
}

/**
 * Set time to end of day (5 PM) for better deadline defaults
 */
function setToEndOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(17, 0, 0, 0); // 5 PM
  return newDate;
}

/**
 * Format date for display
 */
export function formatDueDate(date: Date): string {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // Check if it's within the next week
  const nextWeek = addWeeks(today, 1);
  if (date < nextWeek) {
    return format(date, 'EEEE'); // Day name
  }
  
  // Otherwise show month and day
  return format(date, 'MMM d');
}

/**
 * Convert Date to ISO string for database storage
 */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string (yyyy-MM-dd) as local date
 * Avoids timezone issues when parsing date-only strings
 */
export function parseLocalISODate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}