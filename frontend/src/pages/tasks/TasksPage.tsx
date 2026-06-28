import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import KanbanBoard from './components/KanbanBoard';
import TaskForm from './components/TaskForm';
import type { TaskItem, TaskMember, CategoryLite } from '../../lib/tasks/types';
import { STATUSES } from '../../lib/tasks/utils';
import {
  fetchCategories,
  fetchMembers,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  patchTaskStatus,
  patchTaskComplete,
} from '../../lib/tasks/api';
import { normalizeApiError } from '../../lib/apiErrors';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];


export default function TasksPage() {
  const queryClient = useQueryClient();
  const toastApi = useToast();

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const [formInitial, setFormInitial] = useState<any>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    danger?: boolean;
    onConfirm?: () => void;
  }>({ open: false, title: '' });

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // pagination derived
  const selectedCount = useMemo(() => Object.values(selectedIds).filter(Boolean).length, [selectedIds]);

  const listQuery = useMemo(
    () => ({ q: q || undefined, status: status || undefined, priority: priority || undefined, categoryId: categoryId || undefined, sortBy, sortDir }),
    [q, status, priority, categoryId, sortBy, sortDir]
  );

  const tasksQueryKey = ['tasks', { ...listQuery, limit, offset }];

  const tasks = useQuery({
    queryKey: tasksQueryKey,

    queryFn: async () => {
      const res = await fetchTasks({ ...listQuery, limit, offset });
      return res;
    },
  });

  const tasksData = tasks.data as any;
  const items: TaskItem[] = tasksData?.items ?? [];
  const total = tasksData?.total ?? 0;

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const membersQuery = useQuery({
    queryKey: ['task-members'],
    queryFn: fetchMembers,
  });

  const categories = categoriesQuery.data ?? [];
  const members = membersQuery.data ?? [];

  const createMut = useMutation({
    mutationFn: (payload: any) => createTask(payload),
    onSuccess: async () => {
      // Invalidate parametrized queries too (listQuery + pagination)
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
      toastApi.push({ title: 'Task created successfully.', variant: 'success' });
      setFormOpen(false);
      setDrawerOpen(false);
      setSelectedTaskId(null);
    },
    onError: (e) => {
      const ne = normalizeApiError(e);
      toastApi.push({ title: 'Task creation failed', description: ne.message, variant: 'error' });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateTask(id, payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
      toastApi.push({ title: 'Task updated', variant: 'success' });
      setFormOpen(false);
      setDrawerOpen(false);
      setSelectedTaskId(null);
    },
    onError: (e) => {
      const ne = normalizeApiError(e);
      toastApi.push({ title: 'Update failed', description: ne.message, variant: 'error' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
      toastApi.push({ title: 'Task deleted', variant: 'success' });
    },
    onError: (e) => {
      const ne = normalizeApiError(e);
      toastApi.push({ title: 'Delete failed', description: ne.message, variant: 'error' });
    },
  });

  const persistStatusMut = useMutation({
    mutationFn: async ({ id, nextStatus, nextOrder }: { id: string; nextStatus: string; nextOrder: number }) => {
      await patchTaskStatus(id, { status: nextStatus, kanbanOrder: nextOrder });
    },
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => patchTaskComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
      toastApi.push({ title: 'Task completed', variant: 'success' });
    },
    onError: (e) => {
      const ne = normalizeApiError(e);
      toastApi.push({ title: 'Complete failed', description: ne.message, variant: 'error' });
    },
  });

  const openCreate = () => {
    setFormMode('create');
    setFormInitial(null);
    setFormOpen(true);
  };

  const openEdit = (task: TaskItem) => {
    setFormMode('edit');
    setSelectedTaskId(task._id);
    setFormInitial(task);
    setFormOpen(true);
  };

  const allSelected = selectedCount > 0 && items.length > 0 && items.every((t) => selectedIds[t._id]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (allSelected) {
        for (const t of items) delete next[t._id];
      } else {
        for (const t of items) next[t._id] = true;
      }
      return next;
    });
  };

  const submitForm = async (values: any) => {
    if (formMode === 'create') {
      await createMut.mutateAsync({
        ...values,
        status: values.status ?? 'todo',
      });
    } else {
      if (!selectedTaskId) return;
      await updateMut.mutateAsync({ id: selectedTaskId, payload: values });
    }
  };

  const handleBulkDelete = () => {
    const ids = Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) return;

    setConfirmState({
      open: true,
      title: `Delete ${ids.length} task(s)?`,
      danger: true,
      description: 'This action cannot be undone.',
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, open: false }));
        await Promise.all(ids.map((id) => deleteMut.mutateAsync(id)));
        setSelectedIds({});
      },
    });
  };

  const handleBulkStatus = (nextStatus: string) => {
    const ids = Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) return;

    setConfirmState({
      open: true,
      title: `Move ${ids.length} task(s) to ${nextStatus}?`,
      description: 'Tasks will be updated individually.',
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, open: false }));
        await Promise.all(ids.map((id) => patchTaskStatus(id, { status: nextStatus })));
        queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
        setSelectedIds({});
        toastApi.push({ title: 'Bulk update complete', variant: 'success' });
      },
    });
  };

  const optimisticMove = (next: TaskItem[]) => {
    queryClient.setQueryData(tasksQueryKey, (old: any) => {
      if (!old) return old;
      return { ...old, items: next };
    });
  };

  const persistMove = async ({ taskId, nextStatus, nextOrder }: { taskId: string; nextStatus: string; nextOrder: number }) => {
    try {
      await patchTaskStatus(taskId, { status: nextStatus, kanbanOrder: nextOrder });
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
    } catch (e) {
      // rollback by invalidating
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      const ne = normalizeApiError(e);
      toastApi.push({ title: 'Move failed', description: ne.message, variant: 'error' });
      throw e;
    }
  };

  const kanbanTasks = items;
  const hasActiveFilters = Boolean(q || status || priority || categoryId || sortBy !== 'dueDate' || sortDir !== 'asc');

  const resetFilters = () => {
    setQ('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setSortBy('dueDate');
    setSortDir('asc');
    setOffset(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <div className="text-sm text-white/60 mt-1">Create, manage, and track tasks with a synchronized Kanban board.</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={openCreate} leftIcon={<span aria-hidden>＋</span>}>
            New task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="sm:col-span-2">
            <Input label="Search" value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} placeholder="title or description" />
          </div>

          <Select label="Status" value={status} onValueChange={(v) => { setStatus(v); setOffset(0); }} options={[{ value: '', label: 'All' }, ...STATUSES.map((s) => ({ value: String(s), label: s.replace('_', ' ') }))]} />

          <Select label="Priority" value={priority} onValueChange={(v) => { setPriority(v); setOffset(0); }} options={[{ value: '', label: 'All' }, ...priorityOptions]} />

          <Select label="Category" value={categoryId} disabled={categoriesQuery.isLoading} onValueChange={(v) => { setCategoryId(v); setOffset(0); }} options={[{ value: '', label: categoriesQuery.isLoading ? 'Loading...' : 'All' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]} />

          <Select label="Sort" value={sortBy} onValueChange={(v) => setSortBy(v)} options={[
            { value: 'dueDate', label: 'Due date' },
            { value: 'createdAt', label: 'Created at' },
            { value: 'priority', label: 'Priority' },
            { value: 'kanbanOrder', label: 'Kanban order' },
          ]} />

          <Select label="Direction" value={sortDir} onValueChange={(v) => setSortDir(v as any)} options={[{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-white/55">
            {tasks.isFetching && !tasks.isLoading ? 'Updating results...' : `${total} matching task${total === 1 ? '' : 's'}`}
          </div>
          <Button variant="secondary" onClick={resetFilters} disabled={!hasActiveFilters}>
            Reset filters
          </Button>
        </div>

        {/* Bulk actions */}
        {selectedCount > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-white/70">{selectedCount} selected</div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => handleBulkStatus('todo')}>Todo</Button>
              <Button variant="secondary" onClick={() => handleBulkStatus('in_progress')}>In progress</Button>
              <Button variant="secondary" onClick={() => handleBulkStatus('blocked')}>Blocked</Button>
              <Button variant="secondary" onClick={() => handleBulkStatus('completed')}>Completed</Button>
              <Button variant="danger" onClick={handleBulkDelete}>Delete</Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Kanban */}
      <div>
        {tasks.isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {STATUSES.map((s) => (
              <div key={s} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="font-semibold text-sm">{s}</div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.isError ? (
          <ErrorState title="Failed to load tasks" description={String(tasks.error?.message ?? 'Unknown error')} />
        ) : items.length === 0 ? (
          <EmptyState title="No tasks found" description="Try adjusting filters or create a new task." action={<Button onClick={openCreate}>Create task</Button>} />
        ) : (
          <KanbanBoard
            tasks={kanbanTasks}
            onOptimisticMove={(next) => optimisticMove(next)}
            onPersistMove={persistMove}
          />
        )}
      </div>

      {/* List view for CRUD/bulk selection */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Task list</div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label="Select all tasks on this page"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
            <div className="text-xs text-white/60">Page selection</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {tasks.isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)
          ) : items.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No results" description="No tasks match your current filters." />
            </div>
          ) : (
            items.map((t) => (
              <div key={t._id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <label className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select task ${t.title}`}
                    checked={!!selectedIds[t._id]}
                    onChange={() => toggleSelect(t._id)}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{t.title}</div>
                    <div className="text-xs text-white/60">
                      {t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString()}` : 'No due date'} - {String(t.priority)} - {t.categoryId?.name ?? 'No category'}
                    </div>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  {t.status !== 'completed' ? (
                    <Button variant="secondary" onClick={() => void completeMut.mutateAsync(t._id)}>Complete</Button>
                  ) : null}
                  <Button variant="ghost" onClick={() => openEdit(t)}>Edit</Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setConfirmState({
                        open: true,
                        title: 'Delete task?',
                        description: 'This cannot be undone.',
                        danger: true,
                        onConfirm: async () => {
                          setConfirmState((s) => ({ ...s, open: false }));
                          await deleteMut.mutateAsync(t._id);
                          setSelectedIds((prev) => {
                            const next = { ...prev };
                            delete next[t._id];
                            return next;
                          });
                        },
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-white/60">{total ? `Showing ${offset + 1}-${Math.min(offset + limit, total)} of ${total}` : '-'}</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={offset <= 0} onClick={() => { setOffset((o) => Math.max(0, o - limit)); }}>
              Prev
            </Button>
            <Button variant="secondary" disabled={offset + limit >= total} onClick={() => { setOffset((o) => o + limit); }}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setFormInitial(null);
          setSelectedTaskId(null);
        }}
        title={formMode === 'create' ? 'Create task' : 'Edit task'}
        footer={null}
      >
        <TaskForm
          initial={formInitial ?? undefined}
          categories={categories}
          membersEnabled={members.length > 0}
          members={members}
          submitText={formMode === 'create' ? 'Create' : 'Save'}
          submitting={createMut.isPending || updateMut.isPending}
          onCancel={() => {
            setFormOpen(false);
            setFormInitial(null);
            setSelectedTaskId(null);
          }}
          onSubmit={(values) => {
            // backend expects categoryId: null ok, dueDate nullable
            void submitForm(values);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        danger={confirmState.danger}
        confirmText="Confirm"
        cancelText="Cancel"
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
        onConfirm={() => confirmState.onConfirm?.()}
      />
    </div>
  );
}

