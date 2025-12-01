import { Metric } from '@/lib/types/metric';
import { toDateOnlyString } from './date';

export type Granularity = 'day' | 'week' | 'month';
export type DateRangePreset = 'lastWeek' | 'lastMonth' | 'last3Months' | 'last6Months' | 'lastYear' | 'allTime';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Get date range based on preset
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);

  let startDate = new Date(today);

  switch (preset) {
    case 'lastWeek':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'lastMonth':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'last3Months':
      startDate.setMonth(today.getMonth() - 3);
      break;
    case 'last6Months':
      startDate.setMonth(today.getMonth() - 6);
      break;
    case 'lastYear':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case 'allTime':
      startDate = new Date(2020, 0, 1); // Arbitrary early date
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
}

/**
 * Group data by granularity
 */
export function groupByGranularity(
  data: Array<{ date: Date | string; values: Record<string, any> }>,
  granularity: Granularity
): Array<{ period: string; date: Date; values: Record<string, any> }> {
  const grouped = new Map<string, { date: Date; values: Record<string, any> }>();

  data.forEach((entry) => {
    // Ensure date is a Date object
    const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
    
    let periodKey: string;
    let periodDate: Date;

    switch (granularity) {
      case 'day':
        periodKey = toDateOnlyString(entryDate);
        periodDate = new Date(entryDate);
        periodDate.setHours(0, 0, 0, 0);
        break;
      case 'week': {
        const weekStart = new Date(entryDate);
        const dayOfWeek = weekStart.getDay();
        weekStart.setDate(weekStart.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        periodKey = `week-${toDateOnlyString(weekStart)}`;
        periodDate = weekStart;
        break;
      }
      case 'month': {
        const monthStart = new Date(entryDate.getFullYear(), entryDate.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        periodKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
        periodDate = monthStart;
        break;
      }
    }

    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, { date: periodDate, values: {} });
    }

    // Merge values - store arrays for aggregation
    const existing = grouped.get(periodKey)!;
    Object.entries(entry.values).forEach(([metricId, valueData]) => {
      if (!existing.values[metricId]) {
        existing.values[metricId] = [];
      }
      // valueData might be an object with {value, metric} or just the value
      existing.values[metricId].push(valueData);
    });
  });

  return Array.from(grouped.entries())
    .map(([period, data]) => ({
      period,
      date: data.date,
      values: data.values,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Format period label for display
 */
export function formatPeriodLabel(period: string, granularity: Granularity): string {
  switch (granularity) {
    case 'day':
      return period;
    case 'week': {
      const dateStr = period.replace('week-', '');
      const date = new Date(dateStr + 'T00:00:00');
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    case 'month': {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }
}

