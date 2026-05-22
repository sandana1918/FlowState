import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ContainerMetric } from '../../types/metric.types';

export const AnomalyChart = ({ data, keyName }: { data: ContainerMetric[]; keyName: 'cpuPercent' | 'memoryPercent' }) => (
  <div className="h-72 w-full">
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`${keyName}-gradient`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={keyName === 'cpuPercent' ? '#22D3EE' : '#818CF8'} stopOpacity={0.5} />
            <stop offset="100%" stopColor={keyName === 'cpuPercent' ? '#22D3EE' : '#818CF8'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148,163,184,.08)" vertical={false} />
        <XAxis dataKey="collectedAt" hide />
        <YAxis stroke="#94A3B8" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={keyName}
          stroke={keyName === 'cpuPercent' ? '#22D3EE' : '#818CF8'}
          fill={`url(#${keyName}-gradient)`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

