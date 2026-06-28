import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Clock3, ListTodo, LoaderCircle, TrendingUp } from 'lucide-react';
import ErrorState from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';
import { normalizeApiError } from '../lib/apiErrors';
import { apiRoutes } from '../lib/apiRoutes';
import type { TaskItem } from '../lib/tasks/types';

type Summary = {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
};

type Productivity = {
  labels: string[];
  completedSeries: number[];
  pendingSeries: number[];
};

type CategoryAnalytics = {
  labels: string[];
  series: number[];
};

const pieColors = ['#f87171', '#fb7185', '#f43f5e', '#ef4444', '#fecaca', '#b91c1c'];

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => (await api.get(apiRoutes.analyticsSummary)).data.data as Summary,
  });

  const productivity = useQuery({
    queryKey: ['analytics', 'productivity', 'weekly'],
    queryFn: async () => (await api.get(apiRoutes.analyticsProductivity, { params: { range: 'weekly' } })).data.data as Productivity,
  });

  const categories = useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: async () => (await api.get(apiRoutes.analyticsCategories)).data.data as CategoryAnalytics,
  });

  const recentTasks = useQuery({
    queryKey: ['tasks', 'recent'],
    queryFn: async () => (await api.get(apiRoutes.tasks, { params: { sortBy: 'updatedAt', sortDir: 'desc', limit: 5, offset: 0 } })).data.data.items as TaskItem[],
  });

  const upcomingTasks = useQuery({
    queryKey: ['tasks', 'upcoming'],
    queryFn: async () => (await api.get(apiRoutes.tasks, { params: { sortBy: 'dueDate', sortDir: 'asc', status: 'todo', limit: 5, offset: 0 } })).data.data.items as TaskItem[],
  });

  const productivityRows = productivity.data?.labels.map((label, index) => ({
    label,
    Completed: productivity.data?.completedSeries[index] ?? 0,
    Pending: productivity.data?.pendingSeries[index] ?? 0,
  })) ?? [];

  const categoryRows = categories.data?.labels.map((label, index) => ({
    name: label,
    value: categories.data?.series[index] ?? 0,
  })).filter((item) => item.value > 0) ?? [];

  const completionPercent = summary.data?.total ? Math.round((summary.data.completed / summary.data.total) * 100) : 0;

  const cards = [
    { label: 'Total Tasks', value: summary.data?.total, icon: ListTodo, hint: 'All tracked work' },
    { label: 'Pending', value: summary.data?.pending, icon: Clock3, hint: 'Todo and blocked' },
    { label: 'In Progress', value: summary.data?.inProgress, icon: LoaderCircle, hint: 'Currently active' },
    { label: 'Completed', value: summary.data?.completed, icon: CheckCircle2, hint: `${completionPercent}% completion` },
  ];

  if (summary.isError) {
    return <ErrorState title="Dashboard failed to load" description={normalizeApiError(summary.error).message} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Live task totals, productivity, categories, and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 transition hover:border-red-400/25 hover:bg-red-500/[0.04]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-white/60">{card.label}</div>
                  <div className="mt-2 text-3xl font-semibold">{summary.isLoading ? '-' : card.value ?? 0}</div>
                  <div className="mt-2 text-xs text-white/45">{card.hint}</div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/25 bg-red-500/10 text-red-100">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Weekly Productivity</h2>
          <div className="mt-4 h-72">
            {productivity.isLoading ? (
              <Skeleton className="h-full" />
            ) : productivity.isError ? (
              <ErrorState title="Chart unavailable" description={normalizeApiError(productivity.error).message} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityRows}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
                  <Bar dataKey="Completed" fill="#f87171" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pending" fill="#475569" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Category Split</h2>
            <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs text-red-100">{completionPercent}% done</span>
          </div>
          <div className="mt-4 h-72">
            {categories.isLoading ? (
              <Skeleton className="h-full" />
            ) : categoryRows.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/60">No categorized tasks yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryRows} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={4}>
                    {categoryRows.map((_, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-red-200" />
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="mt-4 space-y-2">
            {recentTasks.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14" />)
            ) : recentTasks.data?.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">No task activity yet.</div>
            ) : (
              recentTasks.data?.map((task) => (
                <div key={task._id} className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 transition hover:border-red-400/25 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-white/50">{task.categoryId?.name ?? 'No category'} - {task.priority}</div>
                  </div>
                  <div className="w-fit rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">{String(task.status).replace('_', ' ')}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-2">
            <Clock3 size={18} className="text-red-200" />
            <h2 className="font-semibold">Upcoming Tasks</h2>
          </div>
          <div className="mt-4 space-y-2">
            {upcomingTasks.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14" />)
            ) : upcomingTasks.data?.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">No upcoming todo tasks.</div>
            ) : (
              upcomingTasks.data?.map((task) => (
                <div key={task._id} className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 transition hover:border-red-400/25 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-white/50">{task.categoryId?.name ?? 'No category'} - {task.priority}</div>
                  </div>
                  <div className="text-xs text-red-100">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
