import { useMemo, useState } from 'react';

export const ResolutionSteps = ({ incidentId, steps }: { incidentId: string; steps: string[] }) => {
  const key = useMemo(() => `flowstate-resolution-${incidentId}`, [incidentId]);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  });

  const toggle = (index: number) => {
    const next = { ...checked, [index]: !checked[index] };
    setChecked(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <label key={step} className="flex items-start gap-3 rounded-xl border border-sky-300/10 bg-bg/40 p-3">
          <input type="checkbox" checked={Boolean(checked[index])} onChange={() => toggle(index)} className="mt-1" />
          <span className="text-sm text-text">{index + 1}. {step}</span>
        </label>
      ))}
    </div>
  );
};

