import { Metric } from '@/lib/types/metric';

interface CategoryScore {
  categoryId: string;
  categoryName: string;
  categoryPercent: number;
  score: number; // 0-100
}

interface ScoreCalculation {
  categoryScores: CategoryScore[];
  totalScore: number; // 0-100
}

/**
 * Calculate scores for categories and total score
 * @param metrics - Array of metrics with their categories
 * @param values - Record of metricId -> value (boolean for yes/no)
 * @returns Score calculation with category scores and total score
 */
export function calculateScores(
  metrics: Metric[],
  values: Record<string, string | number | boolean>
): ScoreCalculation {
  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, metric) => {
    const categoryId = metric.category.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: metric.category,
        metrics: [],
      };
    }
    acc[categoryId].metrics.push(metric);
    return acc;
  }, {} as Record<string, { category: { id: string; name: string; percent: number }; metrics: Metric[] }>);

  // Calculate score for each category
  const categoryScores: CategoryScore[] = Object.values(metricsByCategory).map((group) => {
    const categoryMetrics = group.metrics;
    let yesCount = 0;
    let totalCount = categoryMetrics.length; // Count all metrics in the category

    categoryMetrics.forEach((metric) => {
      const value = values[metric.id];
      // Check if value is true or 'yes' (undefined/null/empty counts as false/no)
      if (value === true || value === 'yes') {
        yesCount++;
      }
      // If value is explicitly false or 'no', it's already counted in totalCount but not in yesCount
    });

    // Calculate category score (0-100)
    const score = totalCount > 0 ? (yesCount / totalCount) * 100 : 0;

    return {
      categoryId: group.category.id,
      categoryName: group.category.name,
      categoryPercent: group.category.percent,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
    };
  });

  // Calculate total score as weighted average
  let weightedSum = 0;
  let totalPercent = 0;

  categoryScores.forEach((catScore) => {
    weightedSum += catScore.score * catScore.categoryPercent;
    totalPercent += catScore.categoryPercent;
  });

  const totalScore = totalPercent > 0 ? weightedSum / totalPercent : 0;

  return {
    categoryScores,
    totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
  };
}

