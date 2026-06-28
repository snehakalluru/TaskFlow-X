import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { apiRoutes } from '../apiRoutes';
import type { TaskItem, CategoryLite, TaskMember } from './types';

export type TasksListResponse = {
  items: TaskItem[];
  total: number;
  limit: number;
  offset: number;
};

export async function fetchTasks(params: {
  q?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  tag?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  const res = await api.get(apiRoutes.tasks, { params });
  return res.data?.data as TasksListResponse;
}

export async function createTask(payload: any) {
  const res = await api.post(apiRoutes.tasks, payload);
  return res.data?.data as TaskItem;
}

export async function updateTask(id: string, payload: any) {
  const res = await api.put(apiRoutes.taskById(id), payload);
  return res.data?.data as TaskItem;
}

export async function deleteTask(id: string) {
  const res = await api.delete(apiRoutes.taskById(id));
  return res.data;
}

export async function patchTaskComplete(id: string) {
  const res = await api.patch(apiRoutes.completeTask(id));
  return res.data?.data as TaskItem;
}

export async function patchTaskStatus(id: string, payload: { status: string; kanbanOrder?: number }) {
  const res = await api.patch(apiRoutes.taskStatus(id), payload);
  return res.data?.data as TaskItem;
}

export async function fetchCategories(): Promise<CategoryLite[]> {
  const res = await api.get(apiRoutes.categories);
  return res.data?.data as CategoryLite[];
}

export async function fetchMembers(): Promise<TaskMember[]> {
  const res = await api.get(apiRoutes.taskMembers);
  return res.data?.data as TaskMember[];
}

export function useTasksList(opts: {
  q?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  tag?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['tasks', opts],
    queryFn: () => fetchTasks(opts),
  });
}


export async function fetchTaskById(id: string) {
  const res = await api.get(apiRoutes.taskById(id));
  return res.data?.data as TaskItem;
}


