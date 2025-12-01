'use client';

import { useState, useEffect } from 'react';
import { Metric } from '@/lib/types/metric';
import { matchesRecurrence } from '@/lib/utils/recurrence';
import Toggle from './Toggle';

interface JournalFormProps {
  selectedDate: Date;
}

interface FormData {
  [metricId: string]: string | number | boolean;
}

export default function JournalForm({ selectedDate }: JournalFormProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    loadMetrics();
  }, []);

  useEffect(() => {
    // Reset form data when date changes
    setFormData({});
  }, [selectedDate]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
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

  const handleChange = (metricId: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [metricId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save journal entries
    console.log('Form data:', formData);
    console.log('Date:', selectedDate);
  };

  // Filter and sort metrics
  const visibleMetrics = metrics
    .filter((metric) => {
      // Only show active metrics
      if (!metric.active) return false;
      // Check if date matches recurrence
      return matchesRecurrence(selectedDate, metric.recurrence as any);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400">Loading metrics...</p>
      </div>
    );
  }

  if (visibleMetrics.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400">No metrics scheduled for this date.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Journal Entry</h3>
      
      <div className="space-y-4">
        {visibleMetrics.map((metric) => (
          <div key={metric.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {metric.label}
            </label>
            
            {metric.type === 'text' && (
              <textarea
                value={formData[metric.id] as string || ''}
                onChange={(e) => handleChange(metric.id, e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Enter text..."
              />
            )}

            {metric.type === 'number' && (
              <input
                type="number"
                value={formData[metric.id] as number || ''}
                onChange={(e) => handleChange(metric.id, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number..."
              />
            )}

            {metric.type === 'yesno' && (
              <Toggle
                checked={formData[metric.id] === true || formData[metric.id] === 'yes'}
                onChange={(checked) => handleChange(metric.id, checked)}
              />
            )}

            {metric.type === 'grade' && (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleChange(metric.id, grade)}
                    className={`w-10 h-10 rounded-md font-semibold transition-colors ${
                      formData[metric.id] === grade
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}

            {metric.type === 'dropdown' && metric.options && (
              <select
                value={formData[metric.id] as string || ''}
                onChange={(e) => handleChange(metric.id, e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an option...</option>
                {metric.options.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
        >
          Save Entry
        </button>
      </div>
    </form>
  );
}

