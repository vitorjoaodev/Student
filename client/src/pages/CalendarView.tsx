import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Task, Course } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as LucideCalendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, parseISO } from 'date-fns';

const CalendarView = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Generate calendar days
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Adjust to start from the beginning of the week
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // Adjust to end at the end of the week
    const lastDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek));
    
    const days: Date[] = [];
    let day = new Date(startDate);
    
    while (day <= endDate) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    
    setCalendarDays(days);
  }, [currentDate]);

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      // Handle string or Date type for dueDate
      const taskDate = typeof task.dueDate === 'string' 
        ? parseISO(task.dueDate) 
        : task.dueDate;
      return isSameDay(taskDate, day);
    });
  };

  // Format the day cell class based on whether it's in the current month, today, etc.
  const getDayClass = (day: Date) => {
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, currentDate);
    
    return `
      relative h-24 border border-background/20 p-1
      ${isToday ? 'bg-primary/10 border-primary/30' : ''}
      ${isCurrentMonth ? 'bg-background/50' : 'bg-background/20 text-foreground/50'}
      ${isToday ? 'font-bold' : ''}
    `;
  };

  // Show task details
  const showTaskDetails = (task: Task) => {
    const course = task.courseId ? courses.find(c => c.id === task.courseId) : null;
    
    toast({
      title: task.title,
      description: (
        <div className="text-sm space-y-1">
          {task.description && <p>{task.description}</p>}
          {course && <p>Course: {course.name}</p>}
          <p>Priority: {task.priority}</p>
          <p>Status: {task.completed ? "Completed" : "Pending"}</p>
        </div>
      ),
    });
  };

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-space text-foreground flex items-center">
            <LucideCalendar className="h-8 w-8 mr-2 text-primary" />
            Calendar
          </h1>
          <p className="text-foreground/70 mt-1">
            View and manage your task schedule
          </p>
        </div>
      </div>

      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="font-space text-lg text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar header with weekday names */}
          <div className="grid grid-cols-7 mb-2 text-center font-medium">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 min-h-[500px]">
            {calendarDays.map((day, i) => {
              const dayTasks = getTasksForDay(day);
              
              return (
                <div key={i} className={getDayClass(day)}>
                  <div className="text-right">{format(day, 'd')}</div>
                  <div className="mt-1 max-h-[80px] overflow-y-auto space-y-1">
                    {dayTasks.slice(0, 3).map(task => {
                      const course = task.courseId ? courses.find(c => c.id === task.courseId) : null;
                      return (
                        <div 
                          key={task.id}
                          className="text-xs p-1 rounded truncate cursor-pointer"
                          style={{ 
                            backgroundColor: course?.color ? `${course.color}20` : (task.priority === 'high' ? '#FF6B6B20' : '#6C5CE720'),
                            borderLeft: `3px solid ${course?.color || (task.priority === 'high' ? '#FF6B6B' : '#6C5CE7')}`
                          }}
                          onClick={() => showTaskDetails(task)}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <div className="text-[10px] text-foreground/60 text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass p-4">
          <h3 className="font-semibold mb-2">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {tasks
              .filter(task => {
                if (!task.dueDate || task.completed) return false;
                const dueDate = typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate;
                return dueDate > new Date();
              })
              .sort((a, b) => {
                const dateA = typeof a.dueDate === 'string' ? new Date(a.dueDate) : (a.dueDate as Date);
                const dateB = typeof b.dueDate === 'string' ? new Date(b.dueDate) : (b.dueDate as Date);
                return dateA.getTime() - dateB.getTime();
              })
              .slice(0, 5)
              .map(task => {
                const course = task.courseId ? courses.find(c => c.id === task.courseId) : null;
                const dueDate = typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate as Date;
                
                return (
                  <div key={task.id} className="flex justify-between items-center p-2 rounded-md bg-background/20">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {course && <div className="text-xs" style={{ color: course.color }}>{course.code}</div>}
                    </div>
                    <div className="text-sm">
                      {dueDate.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                );
              })}
            {tasks.filter(t => t.dueDate && !t.completed).length === 0 && (
              <p className="text-foreground/70 text-sm py-2">No upcoming deadlines</p>
            )}
          </div>
        </Card>
        
        <Card className="glass p-4">
          <h3 className="font-semibold mb-2">Course Distribution</h3>
          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map(course => {
                const taskCount = tasks.filter(t => t.courseId === course.id).length;
                const completedCount = tasks.filter(t => t.courseId === course.id && t.completed).length;
                const percentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
                
                return (
                  <div key={course.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{course.code}</div>
                      <div className="text-xs">{completedCount}/{taskCount} tasks</div>
                    </div>
                    <div className="w-full bg-background/30 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: course.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-foreground/70 text-sm py-2">No courses found</p>
          )}
        </Card>
      </div>
    </main>
  );
};

export default CalendarView;
