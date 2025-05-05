import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Task, Course } from "@shared/schema";
import TaskCard from "./TaskCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskListProps {
  title?: string;
  limit?: number;
}

const TaskList = ({ title = "Tasks", limit }: TaskListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const filteredTasks = tasks
    .filter(task => 
      (searchTerm === "" || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (task.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      ) &&
      (courseFilter === "all" || task.courseId === parseInt(courseFilter))
    )
    .sort((a, b) => {
      // Sort by due date, then by priority
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }
      
      const priorityMap: Record<string, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };
      
      return (priorityMap[a.priority] || 1) - (priorityMap[b.priority] || 1);
    });

  const displayedTasks = limit ? filteredTasks.slice(0, limit) : filteredTasks;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-space font-semibold text-xl text-foreground">{title}</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tasks..."
              className="pl-8 bg-background border border-primary/30 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
          </div>
          <Select 
            value={courseFilter} 
            onValueChange={setCourseFilter}
          >
            <SelectTrigger className="bg-background border border-primary/30 text-sm">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {tasksLoading || coursesLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-lg p-4 animate-pulse h-24"></div>
          ))}
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center">
          <p className="text-foreground/70">No tasks found. Create a new task to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedTasks.map(task => (
            <TaskCard key={task.id} task={task} courses={courses} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
