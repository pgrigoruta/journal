'use client';

import { useState, useEffect } from 'react';
import { Metric } from '@/lib/types/metric';
import { toDateOnlyString, normalizeToDateOnly } from '@/lib/utils/date';
import { getDateRangeFromPreset, groupByGranularity, formatPeriodLabel, type DateRangePreset, type Granularity } from '@/lib/utils/stats';
import Card from './ui/Card';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import LineChartWrapper from './charts/LineChartWrapper';
import PieChartWrapper from './charts/PieChartWrapper';
import BarChartWrapper from './charts/BarChartWrapper';

const DATE_RANGE_PRESETS: DateRangePreset[] = ['lastWeek', 'lastMonth', 'last3Months', 'last6Months', 'lastYear', 'allTime'];

const formatPresetLabel = (preset: DateRangePreset): string => {
  return preset.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

interface ChartData {
  number: Array<{ period: string; date: Date; value: number }>;
  pie: Array<{ name: string; value: number }>;
  bar: Array<{ grade: string; count: number }>;
}

export default function StatsTab() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(() => getDateRangeFromPreset('lastMonth'));
  const [granularity, setGranularity] = useState<Granularity>('day');

  useEffect(() => {
    loadMetrics();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [dateRange]);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error('Failed to load metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const startDateStr = toDateOnlyString(dateRange.startDate);
      const endDateStr = toDateOnlyString(dateRange.endDate);
      const response = await fetch(`/api/journal/entries/range?startDate=${startDateStr}&endDate=${endDateStr}`);
      if (!response.ok) throw new Error('Failed to load entries');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRange(getDateRangeFromPreset(preset));
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    const date = normalizeToDateOnly(new Date(value));
    if (type === 'start') {
      setDateRange({ ...dateRange, startDate: date });
    } else {
      setDateRange({ ...dateRange, endDate: date });
    }
  };

  // Filter active metrics and sort by sortOrder
  const activeMetrics = metrics
    .filter((m) => m.active && m.type !== 'text')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Parse entry dates and group by granularity
  const parsedEntries = entries.map((entry) => {
    const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
    return {
      date: entryDate,
      values: entry.values,
    };
  });
  const groupedData = groupByGranularity(parsedEntries, granularity);

  // Prepare chart data for each metric
  const getChartData = (metric: Metric): ChartData['number'] | ChartData['pie'] | ChartData['bar'] | [] => {
    if (metric.type === 'number') {
      return groupedData
        .map((group) => {
          const valueArrays = group.values[metric.id] || [];
          if (valueArrays.length === 0) return null;

          const allValues = valueArrays.flat().map((v: any) => {
            const val = v?.value ?? v;
            return Number(val) || 0;
          });

          const avgValue =
            allValues.length > 0
              ? allValues.reduce((sum: number, val: number) => sum + val, 0) / allValues.length
              : null;

          return avgValue !== null
            ? {
                period: formatPeriodLabel(group.period, granularity),
                date: group.date,
                value: Math.round(avgValue * 100) / 100,
              }
            : null;
        })
        .filter((d): d is ChartData['number'][0] => d !== null);
    } else if (metric.type === 'yesno' || metric.type === 'dropdown') {
      const counts: Record<string, number> = {};
      parsedEntries.forEach((entry) => {
        const value = entry.values[metric.id]?.value;
        if (value !== undefined && value !== null && value !== '') {
          const key = String(value);
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      if (metric.type === 'yesno') {
        return [
          { name: 'Yes', value: counts['true'] || counts['yes'] || 0 },
          { name: 'No', value: counts['false'] || counts['no'] || 0 },
        ].filter((item) => item.value > 0);
      } else {
        return (
          metric.options?.map((option) => ({
            name: option.label,
            value: counts[option.key] || 0,
          })) || []
        ).filter((item) => item.value > 0);
      }
    } else if (metric.type === 'grade') {
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      parsedEntries.forEach((entry) => {
        const value = entry.values[metric.id]?.value;
        if (value !== undefined && value !== null) {
          const grade = Number(value);
          if (grade >= 1 && grade <= 5) {
            counts[grade] = (counts[grade] || 0) + 1;
          }
        }
      });
      return [1, 2, 3, 4, 5].map((grade) => ({
        grade: `Grade ${grade}`,
        count: counts[grade] || 0,
      }));
    }
    return [];
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const isPresetActive = (preset: DateRangePreset): boolean => {
    const presetRange = getDateRangeFromPreset(preset);
    return (
      dateRange.startDate.getTime() === presetRange.startDate.getTime() &&
      dateRange.endDate.getTime() === presetRange.endDate.getTime()
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Stats</h2>

        {/* Controls */}
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-secondary">Period:</label>
              <div className="flex gap-2 flex-wrap">
                {DATE_RANGE_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={isPresetActive(preset) ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePresetChange(preset)}
                  >
                    {formatPresetLabel(preset)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-text-secondary">Custom Range:</label>
              <input
                type="date"
                value={toDateOnlyString(dateRange.startDate)}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="px-2 py-1 bg-surface-light border border-surface-border rounded text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-text-tertiary">to</span>
              <input
                type="date"
                value={toDateOnlyString(dateRange.endDate)}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="px-2 py-1 bg-surface-light border border-surface-border rounded text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-text-secondary">Granularity:</label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as Granularity)}
                className="px-3 py-1 bg-surface-light border border-surface-border rounded text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="space-y-6">
          {activeMetrics.map((metric) => {
            const chartData = getChartData(metric);

            if (chartData.length === 0) {
              return (
                <Card key={metric.id} title={metric.label}>
                  <p className="text-sm text-text-tertiary">No data available for this period</p>
                </Card>
              );
            }

            return (
              <Card key={metric.id} title={metric.label}>
                {metric.type === 'number' && (
                  <LineChartWrapper data={chartData as ChartData['number']} metricLabel={metric.label} />
                )}

                {(metric.type === 'yesno' || metric.type === 'dropdown') && (
                  <PieChartWrapper data={chartData as ChartData['pie']} />
                )}

                {metric.type === 'grade' && <BarChartWrapper data={chartData as ChartData['bar']} />}
              </Card>
            );
          })}

          {activeMetrics.length === 0 && (
            <Card>
              <p className="text-text-tertiary">No active metrics available for stats.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
