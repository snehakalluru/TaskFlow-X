import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';

const schema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().max(5000).optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(), // yyyy-mm-dd
  categoryId: z.string().optional().nullable(),
  tags: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function TaskForm({
  initial,
  membersEnabled,
  members,
  onSubmit,
  submitText,
  submitting,
  onCancel,
}: {
  initial?: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    categoryId?: string | null;
    tags?: string[];
  };
  membersEnabled?: boolean;
  members?: any[];
  onSubmit: (values: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    categoryId?: string | null;
    tags?: string[];
    assignedMemberIds?: string[];
    status?: string;
  }) => void;
  submitText: string;
  submitting?: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      priority: (initial?.priority as any) ?? 'medium',
      dueDate: initial?.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 10) : undefined,
      categoryId: initial?.categoryId ?? undefined,
      tags: (initial?.tags ?? []).join(','),
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => {
        onSubmit({
          title: values.title,
          description: values.description ?? '',
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
          categoryId: values.categoryId ? values.categoryId : null,
          tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 20) : [],
        });
      })}
    >
      <Input label="Title" error={errors.title?.message} {...register('title')} />

      <Textarea label="Description" error={errors.description?.message} {...register('description')} rows={4} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={(register('priority') as any).value}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          onValueChange={() => {}}
          // react-hook-form integration handled by register below
          {...(register('priority') as any)}
        />

        <Input label="Due date" type="date" {...register('dueDate')} />
      </div>

      <Input label="Category ID" {...register('categoryId')} placeholder="(optional)" />

      <Input label="Tags" {...register('tags')} placeholder="comma,separated" />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}

