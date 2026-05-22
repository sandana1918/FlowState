import type { TimelineEvent } from '../../types/incident.types';

export const IncidentTimelineChart = ({ timeline }: { timeline: TimelineEvent[] }) => (
  <div className="space-y-4">
    {timeline.map((item) => (
      <div key={`${item.time}-${item.event}`} className="flex gap-4">
        <div className="relative flex w-20 justify-end text-xs text-muted">
          {item.time}
          <span className="absolute right-[-14px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
        <div className="flex-1 border-l border-sky-300/10 pl-6 pb-4 text-sm text-text">{item.event}</div>
      </div>
    ))}
  </div>
);

