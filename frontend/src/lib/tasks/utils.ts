import type { TaskItem } from './types';

export const STATUSES: TaskItem['status'][] = ['todo', 'in_progress', 'blocked', 'completed'];

export function statusLabel(s: string) {
  switch (s) {
    case 'todo':
      return 'To do';
    case 'in_progress':
      return 'In progress';
    case 'blocked':
      return 'Blocked';
    case 'completed':
      return 'Completed';
    default:
      return s;
  }
}

export function sortByKanbanOrder(a: TaskItem, b: TaskItem) {
  const ao = typeof a.kanbanOrder === 'number' ? a.kanbanOrder : 0;
  const bo = typeof b.kanbanOrder === 'number' ? b.kanbanOrder : 0;
  return ao - bo;
}

