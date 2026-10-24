import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import type { PaginatedResponse, TaskRecord, TaskStatus, TaskPriority } from "../types";

export interface TaskFilters {
  page?: number;
  limit?: number;
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  archived?: boolean;
  sort?: "title" | "createdAt" | "updatedAt" | "dueDate" | "priority" | "status";
  order?: "asc" | "desc";
}

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<TaskRecord>>("/tasks", {
        params: { ...filters, archived: filters.archived ? "true" : "false" }
      });
      return data;
    }
  });
}
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; dueDate?: string | null; labels?: string[] }) => {
      const { data } = await api.post<{ data: TaskRecord }>("/tasks", input);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  });
}
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority; dueDate?: string | null; labels?: string[] }) => {
      const { data } = await api.patch<{ data: TaskRecord }>(`/tasks/${id}`, patch);
      return data.data;
    },
    onSuccess: task => {
      queryClient.setQueryData(taskKeys.detail(task._id), task);
      return queryClient.invalidateQueries({ queryKey: taskKeys.all });
    }
  });
}
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/tasks/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  });
}
