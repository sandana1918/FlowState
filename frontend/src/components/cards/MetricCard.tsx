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
  <GlassCard className={critical ? 'border-critical/20' : ''}>
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">{title}</p>
        <h3 className="mt-3 font-mono text-[31px] font-semibold tracking-[-0.05em] text-text">{value}</h3>
      </div>
      <div
        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
          delta >= 0 ? 'border-primary/12 bg-white/60 text-primary' : 'border-critical/12 bg-white/60 text-critical'
        }`}
      >
        {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(delta).toFixed(1)}%
      </div>
    </div>
    <MetricSparkline values={sparkline} color={critical ? '#a5584a' : '#1f5f8b'} />
  </GlassCard>
);
