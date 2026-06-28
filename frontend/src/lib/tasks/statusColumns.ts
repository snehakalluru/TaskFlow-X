export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'completed'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export function statusToLabel(status: string) {
  switch (status) {
    case 'todo':
      return 'To do';
    case 'in_progress':
      return 'In progress';
    case 'blocked':
      return 'Blocked';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

