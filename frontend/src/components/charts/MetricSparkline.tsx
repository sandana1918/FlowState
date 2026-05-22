import { Line, LineChart, ResponsiveContainer } from 'recharts';

export const MetricSparkline = ({ values, color = '#1f5f8b' }: { values: number[]; color?: string }) => (
  <div className="h-14 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={values.map((value, index) => ({ index, value }))}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.8} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
