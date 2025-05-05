import { Edit, Check } from "lucide-react";
import { Task, Course } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import TaskModal from "./TaskModal";

interface TaskCardProps {
  task: Task;
  courses: Course[];
}

const TaskCard = ({ task, courses }: TaskCardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const course = courses.find(c => c.id === task.courseId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-accent";
      case "medium":
        return "bg-primary";
      case "low":
        return "bg-secondary";
      default:
        return "bg-primary";
    }
  };

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return "No due date";
    
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return `Today, ${dueDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${dueDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return dueDate.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
  };

  const completeTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/tasks/${task.id}`, { completed: !task.completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task completed",
        description: task.title,
        variant: task.completed ? "default" : "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    completeTaskMutation.mutate();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const getBorderClass = () => {
    if (task.completed) return "neon-border-secondary opacity-60";
    if (task.priority === "high") return "neon-border-accent";
    return "neon-border";
  };

  return (
    <>
      <div 
        className={`glass rounded-lg p-4 task-card shadow-card ${getBorderClass()}`}
        onClick={() => setIsEditing(true)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`h-4 w-4 rounded-full ${getPriorityColor(task.priority)} mr-2`}></div>
              <h3 className={`font-medium text-foreground ${task.completed ? 'line-through opacity-60' : ''}`}>
                {task.title}
              </h3>
            </div>
            {task.description && (
              <p className={`text-foreground/70 text-sm mt-1 ${task.completed ? 'opacity-60' : ''}`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center mt-2 space-x-4">
              {course && (
                <div 
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ 
                    backgroundColor: `${course.color}20`, 
                    color: course.color 
                  }}
                >
                  {course.code}: {course.name}
                </div>
              )}
              {task.dueDate && (
                <div className="text-xs flex items-center text-foreground/60">
                  <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDueDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className="p-1.5 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors duration-200"
              onClick={handleEdit}
              aria-label="Edit task"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              className="p-1.5 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded-md transition-colors duration-200"
              onClick={handleComplete}
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <TaskModal 
          open={isEditing} 
          onOpenChange={setIsEditing} 
          task={task} 
          courses={courses} 
        />
      )}
    </>
  );
};

export default TaskCard;
