import type { TaskItem } from '../../../lib/tasks/types';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { statusLabel } from '../../../lib/tasks/utils';
import { useCallback } from 'react';
import { STATUSES } from '../../../lib/tasks/utils';

export default function KanbanBoard({
  tasks,
  onOptimisticMove,
  onPersistMove,
}: {
  tasks: TaskItem[];
  onOptimisticMove: (next: TaskItem[]) => void;
  onPersistMove: (args: { taskId: string; nextStatus: string; nextOrder: number }) => Promise<void>;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = [] as TaskItem[];
    return acc;
  }, {} as Record<string, TaskItem[]>);

  for (const t of tasks) {
    const bucket = byStatus[String(t.status)] ?? (byStatus as any)[t.status];
    if (bucket) bucket.push(t);
  }

  const handleDragEnd = useCallback(
    async (event: any) => {
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);

      const activeTask = tasks.find((t) => t._id === activeId);
      if (!activeTask) return;

      // Columns use ids like column:todo
      const nextStatus = overId.startsWith('column:') ? overId.replace('column:', '') : activeTask.status;

      const statusTasks = tasks.filter((t) => String(t.status) === nextStatus && t._id !== activeId);
      const nextOrder = statusTasks.length;

      const next = tasks.map((t) =>
        t._id === activeId ? ({ ...t, status: nextStatus, kanbanOrder: nextOrder } as TaskItem) : t
      );

      onOptimisticMove(next);
      await onPersistMove({ taskId: activeId, nextStatus, nextOrder });
    },
    [tasks, onOptimisticMove, onPersistMove]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {STATUSES.map((s) => {
          const colId = `column:${s}`;
          const colTasks = tasks
            .filter((t) => String(t.status) === s)
            .sort((a, b) => (a.kanbanOrder ?? 0) - (b.kanbanOrder ?? 0));

          return (
            <div key={s} className="rounded-2xl border border-white/10 bg-white/5 p-3 min-h-[16rem]">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{statusLabel(String(s))}</div>
                <div className="text-xs text-white/60">{colTasks.length}</div>
              </div>
              <SortableContext items={colTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                <div
                  id={colId}
                  className="mt-3 space-y-2"
                  aria-label={`${statusLabel(String(s))} column`}
                >
                  {colTasks.length === 0 ? (
                    <div className="text-xs text-white/50">Drop tasks here</div>
                  ) : null}
                  {colTasks.map((t) => (
                    <TaskCard key={t._id} task={t} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}

