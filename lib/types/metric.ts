import { Category } from './category';

export interface Metric {
  id: string;
  label: string;
  categoryId: string;
  category: Category;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMetricInput {
  label: string;
  categoryId: string;
  active?: boolean;
}

export interface UpdateMetricInput {
  label?: string;
  categoryId?: string;
  active?: boolean;
}

export interface ReorderMetricsInput {
  metricIds: string[]; // Ordered list of metric IDs
}

