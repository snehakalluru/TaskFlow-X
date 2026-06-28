import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Input from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { normalizeApiError } from '../../lib/apiErrors';
import { apiRoutes } from '../../lib/apiRoutes';
import { useToast } from '../../providers/ToastProvider';

type Category = {
  _id: string;
  name: string;
  taskCount?: number;
  createdAt?: string;
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get(apiRoutes.categories)).data.data as Category[],
  });

  const createMutation = useMutation({
    mutationFn: async (categoryName: string) => (await api.post(apiRoutes.categories, { name: categoryName })).data.data as Category,
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      toast.push({ title: 'Category created', variant: 'success' });
    },
    onError: (err) => toast.push({ title: 'Create failed', description: normalizeApiError(err).message, variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, nextName }: { id: string; nextName: string }) =>
      (await api.patch(apiRoutes.categoryById(id), { name: nextName })).data.data as Category,
    onSuccess: () => {
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      toast.push({ title: 'Category updated', variant: 'success' });
    },
    onError: (err) => toast.push({ title: 'Update failed', description: normalizeApiError(err).message, variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(apiRoutes.categoryById(id))).data,
    onSuccess: () => {
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      toast.push({ title: 'Category deleted', variant: 'success' });
    },
    onError: (err) => toast.push({ title: 'Delete failed', description: normalizeApiError(err).message, variant: 'error' }),
  });

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    createMutation.mutate(trimmed);
  };

  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const trimmed = editing.name.trim();
    if (trimmed.length < 2) return;
    updateMutation.mutate({ id: editing._id, nextName: trimmed });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="mt-1 text-sm text-white/60">Organize tasks and track how many tasks belong to each category.</p>
      </div>

      <form onSubmit={submitCreate} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <Input label="New category" value={name} onChange={(event) => setName(event.target.value)} placeholder="Marketing, Engineering, Personal" />
          <Button type="submit" disabled={createMutation.isPending || name.trim().length < 2} leftIcon={<Plus size={16} />}>
            Add category
          </Button>
        </div>
      </form>

      {categories.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-28" />)}
        </div>
      ) : categories.isError ? (
        <ErrorState title="Failed to load categories" description={normalizeApiError(categories.error).message} />
      ) : categories.data?.length === 0 ? (
        <EmptyState title="No categories yet" description="Create a category to group your tasks." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categories.data?.map((category) => (
            <div key={category._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {editing?._id === category._id ? (
                <form onSubmit={submitEdit} className="space-y-3">
                  <Input label="Category name" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                    <Button type="submit" disabled={updateMutation.isPending}>Save</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{category.name}</h2>
                      <p className="mt-1 text-sm text-white/60">{category.taskCount ?? 0} tasks</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" aria-label="Edit category" onClick={() => setEditing(category)}><Edit2 size={16} /></Button>
                      <Button variant="danger" aria-label="Delete category" onClick={() => setConfirmDelete(category)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete category?"
        description="Tasks in this category will become uncategorized."
        danger
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete._id)}
      />
    </div>
  );
}
