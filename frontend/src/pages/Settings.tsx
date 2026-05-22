import { useEffect, useState } from 'react';
import { GlassCard } from '../components/cards/GlassCard';
import { deploymentsApi } from '../services/deployments.api';
import { DependencyGraph } from '../components/services/DependencyGraph';
import { PageHeader } from '../components/common/PageHeader';
import { OverviewStat } from '../components/common/OverviewStat';

interface SettingsStatus {
  dockerConnected: boolean;
  dbConnected: boolean;
  redisConnected: boolean;
  githubWebhookConfigured: boolean;
  webhookUrl: string;
  dockerVersion?: {
    version: string;
    apiVersion: string;
    os: string;
    arch: string;
  } | null;
  config: {
    anomalyZScoreThreshold: number;
    anomalyWindowSize: number;
    correlationWindowMinutes: number;
    metricCollectionInterval: number;
  };
}

const statusTone = (connected: boolean) => (connected ? 'text-success' : 'text-critical');

export const Settings = () => {
  const [status, setStatus] = useState<SettingsStatus>();
  const [graph, setGraph] = useState<Record<string, string[]>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    void deploymentsApi.settings().then((result) => setStatus(result.data));
    void deploymentsApi.serviceGraph().then((result) => setGraph(result.data));
  }, []);

  const save = async () => {
    setSaveState('saving');
    await deploymentsApi.saveServiceGraph(graph);
    setSaveState('saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Connections, runtime config, and dependency graph."
      >
        <OverviewStat label="Docker" value={status?.dockerConnected ? 'Connected' : 'Offline'} hint={status?.dockerVersion ? `${status.dockerVersion.version} | API ${status.dockerVersion.apiVersion}` : 'Version unavailable'} tone={status?.dockerConnected ? 'success' : 'critical'} />
        <OverviewStat label="PostgreSQL" value={status?.dbConnected ? 'Connected' : 'Offline'} hint="Primary store." tone={status?.dbConnected ? 'success' : 'critical'} />
        <OverviewStat label="Redis" value={status?.redisConnected ? 'Connected' : 'Offline'} hint="Cache." tone={status?.redisConnected ? 'success' : 'critical'} />
        <OverviewStat label="Webhook" value={status?.githubWebhookConfigured ? 'Ready' : 'Missing'} hint="Push delivery." tone={status?.githubWebhookConfigured ? 'primary' : 'warning'} />
      </PageHeader>

      <GlassCard>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Docker Engine</p>
            <p className={`mt-3 text-base font-medium ${statusTone(Boolean(status?.dockerConnected))}`}>{status?.dockerConnected ? 'Connected' : 'Disconnected'}</p>
            <p className="mt-1 text-sm text-muted">{status?.dockerVersion ? `${status.dockerVersion.os}/${status.dockerVersion.arch}` : 'No details'}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">PostgreSQL</p>
            <p className={`mt-3 text-base font-medium ${statusTone(Boolean(status?.dbConnected))}`}>{status?.dbConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Redis</p>
            <p className={`mt-3 text-base font-medium ${statusTone(Boolean(status?.redisConnected))}`}>{status?.redisConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Webhook</p>
            <p className={`mt-3 text-base font-medium ${statusTone(Boolean(status?.githubWebhookConfigured))}`}>{status?.githubWebhookConfigured ? 'Configured' : 'Missing'}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Runtime</p>
          <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-text">Runtime configuration</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-slate-200/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Z-Score Threshold</p>
            <p className="mt-3 font-mono text-[24px] tracking-[-0.04em] text-text">{status?.config.anomalyZScoreThreshold ?? '--'}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Window Size</p>
            <p className="mt-3 font-mono text-[24px] tracking-[-0.04em] text-text">{status?.config.anomalyWindowSize ?? '--'}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Correlation Window</p>
            <p className="mt-3 font-mono text-[24px] tracking-[-0.04em] text-text">{status?.config.correlationWindowMinutes ?? '--'} min</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Collection Interval</p>
            <p className="mt-3 font-mono text-[24px] tracking-[-0.04em] text-text">{status?.config.metricCollectionInterval ?? '--'} s</p>
          </div>
        </div>
        <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Webhook URL</p>
          <p className="mt-3 font-mono text-sm text-primary">{status?.webhookUrl ?? 'https://your-domain.com/api/webhooks/github'}</p>
        </div>
      </GlassCard>

      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Topology</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-text">Service dependency graph</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved.' : 'Unsaved changes'}
            </span>
            <button onClick={save} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm">
              Save Graph
            </button>
          </div>
        </div>
        <textarea
          value={JSON.stringify(graph, null, 2)}
          onChange={(event) => {
            try {
              setGraph(JSON.parse(event.target.value) as Record<string, string[]>);
              setSaveState('idle');
            } catch {
              return;
            }
          }}
          className="h-80 w-full rounded-[24px] border border-slate-200 bg-white p-4 font-mono text-sm text-text outline-none"
        />
        <DependencyGraph graph={graph} />
      </GlassCard>
    </div>
  );
};
