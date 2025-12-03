'use client';

import { useState, useEffect, useMemo } from 'react';
import { Category } from '@/lib/types/category';
import { toDateOnlyString, normalizeToDateOnly } from '@/lib/utils/date';
import { getDateRangeFromPreset, formatPeriodLabel, type DateRangePreset, type Granularity } from '@/lib/utils/stats';
import Card from './ui/Card';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import LineChartWrapper from './charts/LineChartWrapper';

const DATE_RANGE_PRESETS: DateRangePreset[] = ['lastWeek', 'lastMonth', 'last3Months', 'last6Months', 'lastYear', 'allTime'];

const formatPresetLabel = (preset: DateRangePreset): string => {
  return preset.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

interface Entry {
  date: Date | string;
  score: number | null;
  categoryScores: Record<string, number> | null;
}

interface ScoreDataPoint {
  period: string;
  date: Date;
  value: number;
}

export default function StatsTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(() => getDateRangeFromPreset('lastMonth'));
  const [granularity, setGranularity] = useState<Granularity>('day');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [dateRange]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
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

  // Parse entry dates
  const parsedEntries = useMemo(() => {
    return entries.map((entry) => {
      const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
      return {
        date: entryDate,
        score: entry.score,
        categoryScores: entry.categoryScores || {},
      };
    });
  }, [entries]);

  // Group entries by granularity and calculate average scores
  const groupScoresByGranularity = (entries: Array<{ date: Date; score: number | null; categoryScores: Record<string, number> }>): Map<string, { date: Date; totalScore: number | null; categoryScores: Record<string, number | null> }> => {
    const grouped = new Map<string, { date: Date; scores: number[]; categoryScores: Record<string, number[]> }>();

    entries.forEach((entry) => {
      const entryDate = entry.date;
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
        grouped.set(periodKey, { date: periodDate, scores: [], categoryScores: {} });
      }

      const group = grouped.get(periodKey)!;
      if (entry.score !== null && entry.score !== undefined) {
        group.scores.push(entry.score);
      }

      Object.entries(entry.categoryScores).forEach(([categoryId, score]) => {
        if (!group.categoryScores[categoryId]) {
          group.categoryScores[categoryId] = [];
        }
        if (score !== null && score !== undefined) {
          group.categoryScores[categoryId].push(score);
        }
      });
    });

    // Calculate averages
    const result = new Map<string, { date: Date; totalScore: number | null; categoryScores: Record<string, number | null> }>();
    grouped.forEach((group, periodKey) => {
      const avgTotalScore = group.scores.length > 0
        ? group.scores.reduce((sum, s) => sum + s, 0) / group.scores.length
        : null;

      const avgCategoryScores: Record<string, number | null> = {};
      Object.entries(group.categoryScores).forEach(([categoryId, scores]) => {
        avgCategoryScores[categoryId] = scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : null;
      });

      result.set(periodKey, {
        date: group.date,
        totalScore: avgTotalScore,
        categoryScores: avgCategoryScores,
      });
    });

    return result;
  };

  const groupedScores = useMemo(() => {
    return groupScoresByGranularity(parsedEntries);
  }, [parsedEntries, granularity]);

  // Prepare chart data for total score
  const totalScoreData: ScoreDataPoint[] = useMemo(() => {
    return Array.from(groupedScores.entries())
      .filter(([_, data]) => data.totalScore !== null)
      .map(([period, data]) => ({
        period: formatPeriodLabel(period, granularity),
        date: data.date,
        value: Math.round((data.totalScore as number) * 10) / 10,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [groupedScores, granularity]);

  // Prepare chart data for each category
  const getCategoryChartData = (categoryId: string): ScoreDataPoint[] => {
    return Array.from(groupedScores.entries())
      .filter(([_, data]) => data.categoryScores[categoryId] !== null && data.categoryScores[categoryId] !== undefined)
      .map(([period, data]) => ({
        period: formatPeriodLabel(period, granularity),
        date: data.date,
        value: Math.round((data.categoryScores[categoryId] as number) * 10) / 10,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
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
          {/* Total Score Chart - Large */}
          {totalScoreData.length > 0 ? (
            <Card title="Total Score">
              <LineChartWrapper data={totalScoreData} label="Total Score" height={400} />
            </Card>
          ) : (
            <Card title="Total Score">
              <p className="text-sm text-text-tertiary">No data available for this period</p>
            </Card>
          )}

          {/* Category Score Charts - Smaller, 2 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const categoryData = getCategoryChartData(category.id);
              return (
                <Card key={category.id} title={`${category.name} (${category.percent}%)`}>
                  {categoryData.length > 0 ? (
                    <LineChartWrapper data={categoryData} label={category.name} height={250} />
                  ) : (
                    <p className="text-sm text-text-tertiary">No data available for this period</p>
                  )}
                </Card>
              );
            })}
          </div>

          {categories.length === 0 && (
            <Card>
              <p className="text-text-tertiary">No categories available for stats.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
