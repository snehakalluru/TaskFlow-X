import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, ListChecks, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import Button from '../ui/Button';

export default function AppShell({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl border border-red-400/30 bg-red-500/15 shadow-lg shadow-red-950/30" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold">TaskFlow X</div>
              <div className="text-xs text-white/60">Workspace</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm border border-transparent transition ${
                  isActive ? 'bg-red-500/15 border-red-400/30 text-red-50' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm border border-transparent transition ${
                  isActive ? 'bg-red-500/15 border-red-400/30 text-red-50' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Tasks
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm border border-transparent transition ${
                  isActive ? 'bg-red-500/15 border-red-400/30 text-red-50' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm border border-transparent transition ${
                  isActive ? 'bg-red-500/15 border-red-400/30 text-red-50' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Notifications
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm border border-transparent transition ${
                  isActive ? 'bg-red-500/15 border-red-400/30 text-red-50' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Settings
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <div className="text-sm font-medium">{user?.name ?? 'User'}</div>
              <button
                className="text-xs text-white/60 hover:text-white"
                onClick={() => navigate('/settings')}
                type="button"
              >
                {user?.email ?? ''}
              </button>
            </div>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>

      <footer className="md:hidden sticky bottom-0 z-40 border-t border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="flex items-center justify-around py-2">
          <NavLink to="/dashboard" className="text-white/70 hover:text-white" aria-label="Dashboard">
            <LayoutGrid size={18} />
          </NavLink>
          <NavLink to="/tasks" className="text-white/70 hover:text-white" aria-label="Tasks">
            <ListChecks size={18} />
          </NavLink>
          <NavLink to="/notifications" className="text-white/70 hover:text-white" aria-label="Notifications">
            <Bell size={18} />
          </NavLink>
          <NavLink to="/settings" className="text-white/70 hover:text-white" aria-label="Settings">
            <Settings size={18} />
          </NavLink>
        </div>
      </footer>
    </div>
  );
}

