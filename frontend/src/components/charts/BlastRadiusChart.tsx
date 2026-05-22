import type { BlastRadius } from '../../types/incident.types';

export const BlastRadiusChart = ({ blastRadius }: { blastRadius: BlastRadius }) => {
  const nodes = [
    { name: blastRadius.affectedService, x: 180, y: 40, active: true },
    ...blastRadius.directDependents.map((name, index) => ({
      name,
      x: 70 + index * 120,
      y: 150,
      active: true
    })),
    ...blastRadius.indirectDependents.map((name, index) => ({
      name,
      x: 70 + index * 120,
      y: 260,
      active: false
    }))
  ];

  return (
    <svg viewBox="0 0 420 320" className="h-[320px] w-full rounded-2xl bg-bg/60">
      {nodes.slice(1).map((node) => (
        <line
          key={`line-${node.name}`}
          x1="210"
          y1={node.y < 200 ? '70' : '170'}
          x2={node.x + 40}
          y2={node.y}
          stroke={node.active ? '#F87171' : '#818CF8'}
          strokeOpacity="0.5"
        />
      ))}
      {nodes.map((node) => (
        <g key={node.name}>
          <circle
            cx={node.x + 40}
            cy={node.y}
            r="28"
            fill={node.active ? 'rgba(248,113,113,.18)' : 'rgba(129,140,248,.18)'}
            stroke={node.active ? '#F87171' : '#818CF8'}
          />
          <text x={node.x + 40} y={node.y + 4} textAnchor="middle" fill="#F1F5F9" fontSize="12">
            {node.name}
          </text>
        </g>
      ))}
    </svg>
  );
};

