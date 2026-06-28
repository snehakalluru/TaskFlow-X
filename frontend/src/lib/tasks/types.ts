import type { Priority, TaskStatus } from '../../lib/types';

export type TaskMember = {
  id: string;
  name: string;
  email: string;
  theme?: 'light' | 'dark';
  profileImageUrl?: string;
};

export type CategoryLite = {
  _id: string;
  name: string;
  taskCount?: number;
};

export type TaskItem = {
  _id: string;
  ownerId?: string;
  title: string;
  description?: string;
  priority: Priority | string;
  dueDate: string | null;
  categoryId: CategoryLite | null;
  tags?: string[];
  assignedMemberIds?: string[];
  status: TaskStatus | string;
  kanbanOrder?: number;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

