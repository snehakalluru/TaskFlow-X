import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, RefreshCcw, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { normalizeApiError } from '../../lib/apiErrors';
import { apiRoutes } from '../../lib/apiRoutes';
import { useToast } from '../../providers/ToastProvider';

type NotificationItem = {
  _id: string;
  type: 'new_task' | 'due_today' | 'overdue' | 'task_completed' | 'reminder';
  message: string;
  readAt: string | null;
  scheduledAt?: string;
  createdAt?: string;
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get(apiRoutes.notifications)).data.data as NotificationItem[],
  });

  const generateMutation = useMutation({
    mutationFn: async () => (await api.post(`${apiRoutes.notifications}/generate`)).data as { createdCount: number },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.push({ title: data.createdCount ? 'Notifications generated' : 'No new notifications', variant: 'success' });
    },
    onError: (err) => toast.push({ title: 'Generate failed', description: normalizeApiError(err).message, variant: 'error' }),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => (await api.patch(apiRoutes.markNotificationRead(id))).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (err) => toast.push({ title: 'Update failed', description: normalizeApiError(err).message, variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(apiRoutes.notificationById(id))).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.push({ title: 'Notification deleted', variant: 'success' });
    },
    onError: (err) => toast.push({ title: 'Delete failed', description: normalizeApiError(err).message, variant: 'error' }),
  });

  const unreadCount = notifications.data?.filter((item) => !item.readAt).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-white/60">Automatic alerts for new, completed, due today, and overdue tasks.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-sm text-red-100">
            {unreadCount} unread
          </span>
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} leftIcon={<RefreshCcw size={16} />}>
            {generateMutation.isPending ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {notifications.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-20" />)}
        </div>
      ) : notifications.isError ? (
        <ErrorState title="Failed to load notifications" description={normalizeApiError(notifications.error).message} />
      ) : notifications.data?.length === 0 ? (
        <EmptyState title="No notifications" description="Due date and completion updates will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.data?.map((notification) => {
            const isUnread = !notification.readAt;
            return (
              <div key={notification._id} className={`rounded-2xl border p-4 transition hover:border-red-400/25 ${isUnread ? 'border-red-400/20 bg-red-500/[0.06]' : 'border-white/10 bg-white/[0.04]'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${isUnread ? 'border-red-400/40 bg-red-500/15 text-red-100' : 'border-white/10 bg-white/5'}`}>
                      <Bell size={16} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium">{notification.message}</h2>
                        {isUnread && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-100">Unread</span>}
                      </div>
                      <p className="mt-1 text-xs text-white/50">
                        {notification.scheduledAt || notification.createdAt
                          ? new Date(notification.scheduledAt ?? notification.createdAt ?? '').toLocaleString()
                          : notification.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:justify-end">
                    {isUnread && (
                      <Button variant="secondary" onClick={() => markReadMutation.mutate(notification._id)} disabled={markReadMutation.isPending} leftIcon={<Check size={16} />}>
                        Mark as Read
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => deleteMutation.mutate(notification._id)} disabled={deleteMutation.isPending} aria-label="Delete notification">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
