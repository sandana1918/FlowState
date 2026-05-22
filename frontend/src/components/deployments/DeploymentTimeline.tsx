import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Deployment } from '../../types/deployment.types';

export const DeploymentTimeline = ({ deployments }: { deployments: Deployment[] }) => {
  const byHour = Object.entries(
    deployments.reduce<Record<string, number>>((acc, deployment) => {
      const hour = new Date(deployment.receivedAt ?? deployment.pushedAt).getHours().toString().padStart(2, '0');
      acc[hour] = (acc[hour] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([hour, count]) => ({ hour, count }));

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={byHour}>
          <CartesianGrid stroke="rgba(148,163,184,.14)" vertical={false} />
          <XAxis dataKey="hour" stroke="#80868b" tickLine={false} axisLine={false} />
          <YAxis stroke="#80868b" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 18,
              border: '1px solid rgba(226,232,240,.9)',
              boxShadow: '0 18px 48px rgba(15,23,42,.08)'
            }}
          />
          <Bar dataKey="count" fill="#1a73e8" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
