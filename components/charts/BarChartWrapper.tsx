import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartConfig } from './types';

interface BarChartWrapperProps {
  data: Array<{ grade: string; count: number }>;
}

export default function BarChartWrapper({ data }: BarChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="grade" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
          }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Bar dataKey="count" fill={ChartConfig.colors.blue} />
      </BarChart>
    </ResponsiveContainer>
  );
}

