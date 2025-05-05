import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, InsertTask, UpdateTask } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for task management operations
 */
export function useTaskManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Create new task
  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      return await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Update existing task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTask }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/tasks/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Mark task as complete or incomplete
  const toggleTaskCompletionMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: variables.completed ? "Task completed" : "Task marked incomplete",
        description: "Task status updated successfully",
        variant: variables.completed ? "success" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task status",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Create a task
  const createTask = (data: InsertTask) => {
    createTaskMutation.mutate(data);
  };

  // Update a task
  const updateTask = (id: number, data: UpdateTask) => {
    updateTaskMutation.mutate({ id, data });
  };

  // Delete a task
  const deleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  // Toggle task completion
  const toggleTaskCompletion = (task: Task) => {
    toggleTaskCompletionMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  // Set the current task for editing
  const setTaskForEditing = (task: Task | null) => {
    setCurrentTask(task);
  };

  return {
    currentTask,
    setTaskForEditing,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    isLoading: 
      createTaskMutation.isPending || 
      updateTaskMutation.isPending || 
      deleteTaskMutation.isPending || 
      toggleTaskCompletionMutation.isPending,
  };
}

export default useTaskManagement;
