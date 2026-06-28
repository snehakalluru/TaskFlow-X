import { Link } from 'react-router-dom';
import { ArrowRight, Bell, CheckCircle2, LayoutDashboard, ListChecks, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  { title: 'Unified task control', description: 'Filter, prioritize, sort, and move work across a live Kanban workspace.', icon: ListChecks },
  { title: 'Smart notifications', description: 'Stay ahead of new, due, overdue, and completed task activity.', icon: Bell },
  { title: 'Live insight', description: 'Track completion, upcoming work, categories, and recent movement in one dashboard.', icon: LayoutDashboard },
];

const primaryLinkClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/35';
const secondaryLinkClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-400/35';
const ghostLinkClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/90 transition hover:-translate-y-0.5 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-400/35';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl border border-red-400/30 bg-red-500/15 shadow-lg shadow-red-950/40" />
            <div>
              <div className="text-sm font-semibold">TaskFlow X</div>
              <div className="text-xs text-white/55">Dark productivity suite</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-white/65 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#preview" className="hover:text-white">Preview</a>
            <a href="#why" className="hover:text-white">Why TaskFlow X</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className={ghostLinkClass}>
              Login
            </Link>
            <Link to="/register" className={primaryLinkClass}>
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-100">
              <Sparkles size={14} />
              Premium dark task operations
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              TaskFlow X
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              A focused SaaS workspace for planning, categorizing, tracking, and finishing tasks with live dashboards and actionable notifications.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className={primaryLinkClass}>
                Get Started
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className={secondaryLinkClass}>
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/40">
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-sm font-semibold">Workspace health</div>
                  <div className="text-xs text-white/45">Live operational snapshot</div>
                </div>
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-100">82% complete</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['Total Tasks', 'Completed', 'Due Today', 'Overdue'].map((label, index) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-white/50">{label}</div>
                    <div className="mt-2 text-2xl font-semibold">{[48, 39, 6, 2][index]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {['Design review', 'API cleanup', 'Client handoff'].map((task, index) => (
                  <div key={task} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
                    <div>
                      <div className="text-sm font-medium">{task}</div>
                      <div className="text-xs text-white/45">{['High priority', 'In progress', 'Due today'][index]}</div>
                    </div>
                    <div className="h-2 w-16 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-red-400" style={{ width: `${[72, 48, 90][index]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold">Built for fast-moving teams and solo operators</h2>
              <p className="mt-3 text-white/60">TaskFlow X keeps daily execution visible without turning task management into a second job.</p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-red-400/30 hover:bg-red-500/[0.06]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 text-red-100">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="preview" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold">A workspace that looks like your work matters</h2>
              <p className="mt-3 text-white/60">Dark mode, red signals, dense task surfaces, and live charts make important work easy to scan.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium"><CheckCircle2 size={16} className="text-red-300" /> Completion</div>
                <div className="h-32 rounded-xl bg-[linear-gradient(180deg,rgba(248,113,113,0.32),rgba(255,255,255,0.04))]" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium"><ShieldCheck size={16} className="text-red-300" /> Priority lanes</div>
                <div className="space-y-2">
                  {[80, 58, 36, 68].map((width) => <div key={width} className="h-6 rounded-full bg-white/10"><div className="h-6 rounded-full bg-red-400/70" style={{ width: `${width}%` }} /></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="border-t border-white/10 bg-white/[0.025]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 md:px-6 lg:grid-cols-3">
            {['Instant filtering', 'Category intelligence', 'Actionable reminders'].map((item) => (
              <div key={item}>
                <h3 className="font-semibold">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Organize work, expose risk, and move tasks forward without refreshes or fragmented workflows.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between md:px-6">
          <div>TaskFlow X</div>
          <div>Plan clearly. Execute faster. Stay accountable.</div>
        </div>
      </footer>
    </div>
  );
}
