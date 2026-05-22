import { Activity, AlertTriangle, BarChart3, Boxes, GitBranch, Home, ScrollText, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/services', label: 'Services', icon: Boxes },
  { to: '/deployments', label: 'Deployments', icon: GitBranch },
  { to: '/logs', label: 'Logs', icon: ScrollText },
  { to: '/metrics', label: 'Metrics', icon: BarChart3 },
  { to: '/correlations', label: 'Correlations', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export const Sidebar = () => (
  <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-white/70 bg-white/42 px-5 py-6 backdrop-blur-[18px]">
    <div className="mb-10 px-3">
      <h1 className="text-[23px] font-semibold tracking-[-0.04em] text-text">FlowState</h1>
    </div>
    <nav className="space-y-1.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'border border-white/80 bg-white/72 text-text shadow-glass'
                : 'text-muted hover:bg-white/55 hover:text-text'
            }`
          }
        >
          <item.icon size={17} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);
