import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Task, Course } from '@shared/schema';
import { cn } from '@/lib/utils';

interface WeeklyCalendarProps {
  minimal?: boolean;
}

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: string;
  tasks: Task[];
  isToday: boolean;
}

const WeeklyCalendar = ({ minimal = false }: WeeklyCalendarProps) => {
  const [weekStartDate, setWeekStartDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 })); // Week starts on Monday
  
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const getDaysOfWeek = () => {
    const days: WeekDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStartDate, i);
      days.push({
        date,
        dayName: format(date, 'EEE'),
        dayNumber: format(date, 'd'),
        tasks: tasks.filter(task => {
          if (!task.dueDate) return false;
          return isSameDay(new Date(task.dueDate), date);
        }),
        isToday: isSameDay(date, today)
      });
    }
    
    return days;
  };

  const weekDays = getDaysOfWeek();
  
  const goToPreviousWeek = () => {
    setWeekStartDate(prevDate => addDays(prevDate, -7));
  };
  
  const goToNextWeek = () => {
    setWeekStartDate(prevDate => addDays(prevDate, 7));
  };

  const getTaskBgColor = (task: Task) => {
    const course = task.courseId 
      ? courses.find(c => c.id === task.courseId) 
      : null;
    
    return course 
      ? `${course.color}20` 
      : task.priority === 'high' 
        ? 'bg-accent/20' 
        : 'bg-primary/20';
  };

  return (
    <Card className="glass neon-border">
      <CardHeader className={minimal ? 'p-4 pb-2' : 'pb-2'}>
        <div className="flex justify-between items-center">
          <CardTitle className="font-space text-lg text-foreground">Weekly Overview</CardTitle>
          <div className="flex items-center text-sm text-foreground/70">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 hover:text-primary" 
              onClick={goToPreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous week</span>
            </Button>
            <span className="px-2">
              {format(weekStartDate, 'MMM d')} - {format(addDays(weekStartDate, 6), 'MMM d, yyyy')}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 hover:text-primary" 
              onClick={goToNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next week</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={minimal ? 'p-4 pt-0' : 'pt-2'}>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {weekDays.map((day) => (
            <div 
              key={day.dayNumber} 
              className={cn(
                "flex flex-col",
                day.isToday && "glass rounded-md p-1 neon-border-accent"
              )}
            >
              <div className={cn(
                "font-medium mb-1",
                day.isToday ? "text-foreground" : "text-foreground/70"
              )}>
                {day.dayName}
              </div>
              <div className={cn(
                "font-mono font-medium",
                day.isToday ? "text-accent" : "text-primary"
              )}>
                {day.dayNumber}
              </div>
              <div className="mt-2 space-y-1">
                {day.tasks.slice(0, minimal ? 2 : 3).map(task => (
                  <div 
                    key={task.id}
                    className={cn(
                      "rounded-md px-1 py-0.5 text-xs mx-1 truncate",
                      getTaskBgColor(task)
                    )}
                    title={task.title}
                  >
                    {task.title.length > 8 ? `${task.title.substring(0, 8)}...` : task.title}
                  </div>
                ))}
                {day.tasks.length > (minimal ? 2 : 3) && (
                  <div className="text-[10px] text-foreground/70">
                    +{day.tasks.length - (minimal ? 2 : 3)} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalendar;
