import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig } from './types';

interface LineChartWrapperProps {
  data: Array<{ period: string; date: Date; value: number }>;
  metricLabel: string;
}

export default function LineChartWrapper({ data, metricLabel }: LineChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="period" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
          }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke={ChartConfig.colors.blue}
          strokeWidth={2}
          dot={{ fill: ChartConfig.colors.blue }}
          name={metricLabel}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

