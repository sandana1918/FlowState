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
  <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-200 bg-surface px-4 py-5">
    <div className="mb-8 px-3">
      <div className="mb-3 inline-flex rounded-2xl bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-primary">
        FLOWSTATE
      </div>
      <h1 className="text-[22px] font-semibold tracking-tight text-text">Operations</h1>
      <p className="mt-1 text-sm text-muted">Incident correlation engine</p>
    </div>
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:bg-slate-100 hover:text-text'
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);
