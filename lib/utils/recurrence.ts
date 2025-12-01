import { RecurrenceType } from '@/lib/types/metric';

/**
 * Check if a given date matches the recurrence pattern
 */
export function matchesRecurrence(date: Date, recurrence: RecurrenceType): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  switch (recurrence.type) {
    case 'daily':
      return true;

    case 'weekly': {
      const days = recurrence.days || [];
      return days.includes(dayOfWeek);
    }

    case 'monthly': {
      return dayOfMonth === recurrence.day;
    }

    case 'yearly': {
      return month === recurrence.month && dayOfMonth === recurrence.day;
    }

    case 'specific': {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      return recurrence.dates.includes(dateStr);
    }

    case 'custom': {
      // For custom intervals, we need a reference point
      // For simplicity, we'll check if the date is a multiple of the interval from a base date
      // This is a simplified implementation - you might want to enhance this
      const baseDate = new Date('2024-01-01'); // Use a fixed base date
      const diffTime = date.getTime() - baseDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let intervalDays = recurrence.interval;
      if (recurrence.unit === 'weeks') {
        intervalDays = recurrence.interval * 7;
      } else if (recurrence.unit === 'months') {
        intervalDays = recurrence.interval * 30; // Approximate
      }
      
      return diffDays % intervalDays === 0;
    }

    default:
      return false;
  }
}

