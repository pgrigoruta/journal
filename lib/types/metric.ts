export type MetricType = 'text' | 'number' | 'yesno' | 'grade' | 'dropdown';

export interface DropdownOption {
  key: string;
  label: string;
}

export type RecurrenceType = 
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] } // 0 = Sunday, 1 = Monday, etc.
  | { type: 'monthly'; day: number } // Day of month (1-31)
  | { type: 'yearly'; month: number; day: number } // Month (1-12), Day (1-31)
  | { type: 'specific'; dates: string[] } // ISO date strings
  | { type: 'custom'; interval: number; unit: 'days' | 'weeks' | 'months' };

export interface Metric {
  id: string;
  key: string;
  label: string;
  type: MetricType;
  options?: DropdownOption[];
  recurrence: RecurrenceType;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMetricInput {
  key: string;
  label: string;
  type: MetricType;
  options?: DropdownOption[];
  recurrence: RecurrenceType;
  active?: boolean;
}

export interface UpdateMetricInput {
  label?: string;
  type?: MetricType;
  options?: DropdownOption[];
  recurrence?: RecurrenceType;
  active?: boolean;
}

export interface ReorderMetricsInput {
  metricIds: string[]; // Ordered list of metric IDs
}

