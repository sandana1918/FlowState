import { severityTone } from '../../utils/severity';

export const SeverityBadge = ({
  severity
}: {
  severity: 'critical' | 'high' | 'medium' | 'low';
}) => (
  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${severityTone[severity]}`}>
    {severity}
  </span>
);

