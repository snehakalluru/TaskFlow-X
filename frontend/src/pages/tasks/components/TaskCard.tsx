import type { TaskItem } from '../../../lib/tasks/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Tag } from 'lucide-react';

export default function TaskCard({ task }: { task: TaskItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        'rounded-2xl border border-white/10 bg-white/5 p-3 text-sm backdrop-blur ' +
        (isDragging ? 'opacity-80 ring-2 ring-red-400/40' : '')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate" title={task.title}>
            {task.title}
          </div>
          {task.description ? (
            <div className="mt-1 text-xs text-white/70 line-clamp-2">{task.description}</div>
          ) : null}
          {task.dueDate ? (
            <div className="mt-2 text-xs text-white/60">Due {new Date(task.dueDate).toLocaleDateString()}</div>
          ) : null}
          <div className="mt-2 w-fit rounded-full border border-red-400/20 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-100">
            {task.categoryId?.name ?? 'No category'}
          </div>
        </div>

        <button
          type="button"
          className="mt-0.5 rounded-lg p-1 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Drag task"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </div>

      {task.tags && task.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-100">
              <Tag size={12} />{t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

