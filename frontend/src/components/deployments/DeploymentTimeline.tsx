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
          <CartesianGrid stroke="rgba(148,163,184,.08)" vertical={false} />
          <XAxis dataKey="hour" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip />
          <Bar dataKey="count" fill="#818CF8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

