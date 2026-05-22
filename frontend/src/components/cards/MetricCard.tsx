import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MetricSparkline } from '../charts/MetricSparkline';

export const MetricCard = ({
  title,
  value,
  delta,
  sparkline,
  critical
}: {
  title: string;
  value: string;
  delta: number;
  sparkline: number[];
  critical?: boolean;
}) => (
  <GlassCard className={critical ? 'border-critical/20 shadow-critical' : ''}>
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted">{title}</p>
        <h3 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-text">{value}</h3>
      </div>
      <div
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${delta >= 0 ? 'bg-primary/10 text-primary' : 'bg-critical/10 text-critical'}`}
      >
        {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(delta).toFixed(1)}%
      </div>
    </div>
    <MetricSparkline values={sparkline} color={critical ? '#F87171' : '#22D3EE'} />
  </GlassCard>
);
