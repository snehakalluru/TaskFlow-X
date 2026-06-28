import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { apiRoutes } from '../lib/apiRoutes';

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => (await api.get(apiRoutes.analyticsSummary)).data,
  });

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Total Tasks</div>
          <div className="text-2xl font-semibold">{summary.data?.data?.total ?? '—'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Completed</div>
          <div className="text-2xl font-semibold">{summary.data?.data?.completed ?? '—'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Pending</div>
          <div className="text-2xl font-semibold">{summary.data?.data?.pending ?? '—'}</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        Charts and modules will be added next; this page already connects to backend summary.
      </div>
    </div>
  );
}

