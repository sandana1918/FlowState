import { useEffect, useState } from 'react';
import { GlassCard } from '../components/cards/GlassCard';
import { deploymentsApi } from '../services/deployments.api';
import { DependencyGraph } from '../components/services/DependencyGraph';

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
      <GlassCard>
        <h2 className="mb-4 text-2xl font-semibold">Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-bg/40 p-4">
            <p className="text-muted">Docker Engine</p>
            <p className="text-text">{status?.dockerConnected ? 'Connected' : 'Disconnected'}</p>
            <p className="mt-1 text-xs text-muted">
              {status?.dockerVersion ? `${status.dockerVersion.version} • API ${status.dockerVersion.apiVersion}` : 'Version unavailable'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-bg/40 p-4">
            <p className="text-muted">PostgreSQL</p>
            <p className="text-text">{status?.dbConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-bg/40 p-4">
            <p className="text-muted">Redis</p>
            <p className="text-text">{status?.redisConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-bg/40 p-4">
            <p className="text-muted">Webhook</p>
            <p className="text-text">{status?.githubWebhookConfigured ? 'Configured' : 'Not configured'}</p>
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Runtime Configuration</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Z-Score Threshold</p>
            <p className="mt-2 font-mono text-xl text-text">{status?.config.anomalyZScoreThreshold ?? '--'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Window Size</p>
            <p className="mt-2 font-mono text-xl text-text">{status?.config.anomalyWindowSize ?? '--'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Correlation Window</p>
            <p className="mt-2 font-mono text-xl text-text">{status?.config.correlationWindowMinutes ?? '--'} min</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Collection Interval</p>
            <p className="mt-2 font-mono text-xl text-text">{status?.config.metricCollectionInterval ?? '--'} s</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-elevated p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Webhook URL</p>
          <p className="mt-2 font-mono text-sm text-primary">{status?.webhookUrl ?? 'https://your-domain.com/api/webhooks/github'}</p>
        </div>
      </GlassCard>
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold">Service Dependency Graph</h3>
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
          className="h-80 w-full rounded-2xl border border-slate-200 bg-bg/50 p-4 font-mono text-sm text-text outline-none"
        />
        <div className="flex items-center gap-4">
          <button onClick={save} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
            Save Graph
          </button>
          <span className="text-sm text-muted">
            {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved.' : 'Changes not saved yet.'}
          </span>
        </div>
        <DependencyGraph graph={graph} />
      </GlassCard>
    </div>
  );
};
