import { Metric } from '@/lib/types/metric';
import Toggle from './Toggle';

interface MetricInputProps {
  metric: Metric;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}

export default function MetricInput({ metric, value, onChange }: MetricInputProps) {
      return (
        <Toggle
          checked={value === true || value === 'yes'}
          onChange={(checked) => onChange(checked)}
        />
      );
}

