import { useEffect, useState } from 'react';
import { GlassCard } from '../components/cards/GlassCard';
import { deploymentsApi } from '../services/deployments.api';
import { DependencyGraph } from '../components/services/DependencyGraph';

export const Settings = () => {
  const [status, setStatus] = useState<any>();
  const [graph, setGraph] = useState<Record<string, string[]>>({});

  useEffect(() => {
    void deploymentsApi.settings().then((result) => setStatus(result.data));
    void deploymentsApi.serviceGraph().then((result) => setGraph(result.data));
  }, []);

  const save = async () => {
    await deploymentsApi.saveServiceGraph(graph);
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="mb-4 text-2xl font-semibold">Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-sky-300/10 bg-bg/40 p-4">
            <p className="text-muted">Docker Engine</p>
            <p className="text-text">{status?.dockerConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          <div className="rounded-2xl border border-sky-300/10 bg-bg/40 p-4">
            <p className="text-muted">PostgreSQL</p>
            <p className="text-text">{status?.dbConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          <div className="rounded-2xl border border-sky-300/10 bg-bg/40 p-4">
            <p className="text-muted">Redis</p>
            <p className="text-text">{status?.redisConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          <div className="rounded-2xl border border-sky-300/10 bg-bg/40 p-4">
            <p className="text-muted">Webhook</p>
            <p className="text-text">{status?.githubWebhookConfigured ? 'Configured' : 'Not configured'}</p>
          </div>
        </div>
      </GlassCard>
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold">Service Dependency Graph</h3>
        <textarea
          value={JSON.stringify(graph, null, 2)}
          onChange={(event) => {
            try {
              setGraph(JSON.parse(event.target.value) as Record<string, string[]>);
            } catch {
              return;
            }
          }}
          className="h-80 w-full rounded-2xl border border-sky-300/10 bg-bg/50 p-4 font-mono text-sm text-text outline-none"
        />
        <button onClick={save} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-bg">
          Save Graph
        </button>
        <DependencyGraph graph={graph} />
      </GlassCard>
    </div>
  );
};

