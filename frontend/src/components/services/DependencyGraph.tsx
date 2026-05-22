export const DependencyGraph = ({ graph }: { graph: Record<string, string[]> }) => (
  <div className="rounded-2xl border border-sky-300/10 bg-surface/80 p-5 font-mono text-sm text-muted">
    <pre>{JSON.stringify(graph, null, 2)}</pre>
  </div>
);

