import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Service } from '../../types/service.types';

export const ServiceHealthChart = ({ services }: { services: Service[] }) => (
  <div className="h-72">
    <ResponsiveContainer>
      <BarChart data={services.map((service) => ({ name: service.name, cpu: service.latestMetric?.cpuPercent ?? 0, memory: service.latestMetric?.memoryPercent ?? 0 }))}>
        <XAxis dataKey="name" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip />
        <Bar dataKey="cpu" fill="#22D3EE" radius={[8, 8, 0, 0]} />
        <Bar dataKey="memory" fill="#818CF8" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

