'use client';

import { useState, useEffect } from 'react';
import { Metric, CreateMetricInput, UpdateMetricInput, DropdownOption, RecurrenceType } from '@/lib/types/metric';

interface MetricFormProps {
  metric?: Metric;
  onSave: (data: CreateMetricInput | UpdateMetricInput) => Promise<void>;
  onCancel: () => void;
}

export default function MetricForm({ metric, onSave, onCancel }: MetricFormProps) {
  const [formData, setFormData] = useState({
    key: metric?.key || '',
    label: metric?.label || '',
    type: (metric?.type || 'text') as Metric['type'],
    options: (metric?.options || []) as DropdownOption[],
    recurrence: (metric?.recurrence || { type: 'daily' }) as RecurrenceType,
    active: metric?.active ?? true,
  });

  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>(formData.options);
  const [newOptionKey, setNewOptionKey] = useState('');
  const [newOptionLabel, setNewOptionLabel] = useState('');

  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceType>(() => {
    if (formData.recurrence.type === 'weekly') {
      return { type: 'weekly', days: formData.recurrence.days || [] };
    } else if (formData.recurrence.type === 'monthly') {
      return { type: 'monthly', day: formData.recurrence.day || 1 };
    } else if (formData.recurrence.type === 'yearly') {
      return { type: 'yearly', month: formData.recurrence.month || 1, day: formData.recurrence.day || 1 };
    } else if (formData.recurrence.type === 'specific') {
      return { type: 'specific', dates: formData.recurrence.dates || [] };
    } else if (formData.recurrence.type === 'custom') {
      return { type: 'custom', interval: formData.recurrence.interval || 1, unit: formData.recurrence.unit || 'days' };
    }
    return { type: 'daily' };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (metric) {
      await onSave({
        label: formData.label,
        type: formData.type,
        options: formData.type === 'dropdown' ? dropdownOptions : undefined,
        recurrence: recurrenceConfig,
        active: formData.active,
      });
    } else {
      await onSave({
        key: formData.key,
        label: formData.label,
        type: formData.type,
        options: formData.type === 'dropdown' ? dropdownOptions : undefined,
        recurrence: recurrenceConfig,
        active: formData.active,
      });
    }
  };

  const addDropdownOption = () => {
    if (newOptionKey && newOptionLabel) {
      setDropdownOptions([...dropdownOptions, { key: newOptionKey, label: newOptionLabel }]);
      setNewOptionKey('');
      setNewOptionLabel('');
    }
  };

  const removeDropdownOption = (index: number) => {
    setDropdownOptions(dropdownOptions.filter((_, i) => i !== index));
  };

  const toggleWeeklyDay = (day: number) => {
    if (recurrenceConfig.type === 'weekly') {
      const days = recurrenceConfig.days || [];
      if (days.includes(day)) {
        setRecurrenceConfig({ ...recurrenceConfig, days: days.filter((d: number) => d !== day) });
      } else {
        setRecurrenceConfig({ ...recurrenceConfig, days: [...days, day] });
      }
    }
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!metric && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Key <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
            pattern="[a-z0-9_]+"
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., daily_mood"
          />
          <p className="mt-1 text-xs text-gray-400">Lowercase letters, numbers, and underscores only</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Label <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Type <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Metric['type'] })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="yesno">Yes/No</option>
          <option value="grade">Grade (1-5)</option>
          <option value="dropdown">Dropdown</option>
        </select>
      </div>

      {formData.type === 'dropdown' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dropdown Options
          </label>
          <div className="space-y-2 mb-3">
            {dropdownOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                <span className="text-sm text-gray-300 flex-1">
                  <strong>{option.key}:</strong> {option.label}
                </span>
                <button
                  type="button"
                  onClick={() => removeDropdownOption(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newOptionKey}
              onChange={(e) => setNewOptionKey(e.target.value)}
              placeholder="Option key"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              placeholder="Option label"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addDropdownOption}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Recurrence <span className="text-red-400">*</span>
        </label>
        <select
          value={recurrenceConfig.type}
          onChange={(e) => {
            const type = e.target.value;
            if (type === 'daily') {
              setRecurrenceConfig({ type: 'daily' });
            } else if (type === 'weekly') {
              setRecurrenceConfig({ type: 'weekly', days: [] });
            } else if (type === 'monthly') {
              setRecurrenceConfig({ type: 'monthly', day: 1 });
            } else if (type === 'yearly') {
              setRecurrenceConfig({ type: 'yearly', month: 1, day: 1 });
            } else if (type === 'specific') {
              setRecurrenceConfig({ type: 'specific', dates: [] });
            } else if (type === 'custom') {
              setRecurrenceConfig({ type: 'custom', interval: 1, unit: 'days' });
            }
          }}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly (specific days)</option>
          <option value="monthly">Monthly (specific day)</option>
          <option value="yearly">Yearly (specific date)</option>
          <option value="specific">Specific dates</option>
          <option value="custom">Custom interval</option>
        </select>

        {recurrenceConfig.type === 'weekly' && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-400">Select days:</p>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleWeeklyDay(index)}
                  className={`px-3 py-1 rounded text-sm ${
                    recurrenceConfig.days?.includes(index)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {recurrenceConfig.type === 'monthly' && (
          <div className="mt-3">
            <label className="block text-sm text-gray-400 mb-1">Day of month (1-31)</label>
            <input
              type="number"
              min="1"
              max="31"
              value={recurrenceConfig.day || 1}
              onChange={(e) => setRecurrenceConfig({ type: 'monthly', day: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {recurrenceConfig.type === 'yearly' && (
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Month (1-12)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={recurrenceConfig.month || 1}
                onChange={(e) => setRecurrenceConfig({ type: 'yearly', month: parseInt(e.target.value), day: recurrenceConfig.day || 1 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Day (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={recurrenceConfig.day || 1}
                onChange={(e) => setRecurrenceConfig({ type: 'yearly', month: recurrenceConfig.month || 1, day: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {recurrenceConfig.type === 'custom' && (
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Interval</label>
              <input
                type="number"
                min="1"
                value={recurrenceConfig.interval || 1}
                onChange={(e) => setRecurrenceConfig({ type: 'custom', interval: parseInt(e.target.value), unit: recurrenceConfig.unit || 'days' })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Unit</label>
              <select
                value={recurrenceConfig.unit || 'days'}
                onChange={(e) => setRecurrenceConfig({ type: 'custom', interval: recurrenceConfig.interval || 1, unit: e.target.value as 'days' | 'weeks' | 'months' })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-300">
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
        >
          {metric ? 'Update' : 'Create'} Metric
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

