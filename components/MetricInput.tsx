import { Metric } from '@/lib/types/metric';
import Toggle from './Toggle';

interface MetricInputProps {
  metric: Metric;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}

export default function MetricInput({ metric, value, onChange }: MetricInputProps) {
  switch (metric.type) {
    case 'text':
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          placeholder="Enter text..."
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={(value as number) || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter number..."
        />
      );

    case 'yesno':
      return (
        <Toggle
          checked={value === true || value === 'yes'}
          onChange={(checked) => onChange(checked)}
        />
      );

    case 'grade':
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => onChange(grade)}
              className={`w-10 h-10 rounded-md font-semibold transition-colors ${
                value === grade
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-light text-text-secondary hover:bg-gray-600'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
      );

    case 'dropdown':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select an option...</option>
          {metric.options?.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      );

    default:
      return null;
  }
}

