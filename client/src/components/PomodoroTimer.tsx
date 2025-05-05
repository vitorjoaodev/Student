import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Task } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import usePomodoroTimer from '@/hooks/usePomodoroTimer';

interface PomodoroTimerProps {
  tasks?: Task[];
  minimal?: boolean;
}

const PomodoroTimer = ({ tasks = [], minimal = false }: PomodoroTimerProps) => {
  const { toast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  const {
    minutes,
    seconds,
    isRunning,
    isBreak,
    start,
    pause,
    reset,
    completedPomodoros,
  } = usePomodoroTimer();

  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const recordSessionMutation = useMutation({
    mutationFn: async (duration: number) => {
      return await apiRequest("POST", "/api/pomodoro/sessions", {
        taskId: selectedTaskId,
        startTime: new Date(),
        endTime: new Date(),
        duration,
      });
    },
    onSuccess: () => {
      toast({
        title: "Session recorded",
        description: "Your pomodoro session has been recorded",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to record session",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const handleStart = () => {
    if (selectedTaskId) {
      start();
    } else {
      toast({
        title: "No task selected",
        description: "Please select a task to start the timer",
        variant: "destructive",
      });
    }
  };

  const handleCompletePomodoro = () => {
    if (selectedTaskId) {
      recordSessionMutation.mutate(25);
    }
  };

  // When pomodoro finishes, record the session
  useEffect(() => {
    if (isBreak && completedPomodoros > 0) {
      handleCompletePomodoro();
    }
  }, [isBreak, completedPomodoros]);

  return (
    <Card className={`glass neon-border ${minimal ? 'p-0' : ''}`}>
      <CardHeader className={minimal ? 'p-3 pb-0' : 'pb-0'}>
        <CardTitle className="font-space text-lg text-foreground flex justify-between items-center">
          <span>Focus Session</span>
          {minimal && completedPomodoros > 0 && (
            <span className="text-xs text-primary">Completed: {completedPomodoros}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={minimal ? 'p-3 pt-2' : 'pt-4'}>
        <div className="bg-background/50 rounded-lg p-4 flex flex-col items-center">
          <div className="font-mono text-4xl md:text-5xl font-bold text-foreground mb-2">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          
          {isBreak ? (
            <div className="text-sm text-accent mb-4">
              Take a break! Next pomodoro in {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          ) : (
            <div className="text-sm text-foreground/70 mb-4">
              {selectedTask 
                ? `Currently studying: ${selectedTask.title}`
                : "Select a task to focus on"}
            </div>
          )}

          {!minimal && (
            <div className="w-full mb-4">
              <Select
                value={selectedTaskId?.toString() || "none"}
                onValueChange={(value) => setSelectedTaskId(value !== "none" ? parseInt(value) : null)}
                disabled={isRunning}
              >
                <SelectTrigger className="w-full bg-background/50 border-primary/30">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.length === 0 ? (
                    <SelectItem value="none">No tasks available</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="none">Select a task</SelectItem>
                      {tasks.map(task => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex space-x-3">
            {isRunning ? (
              <Button 
                variant="outline"
                className="bg-accent/20 hover:bg-accent/30 text-accent"
                onClick={pause}
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="bg-secondary/20 hover:bg-secondary/30 text-secondary"
                onClick={handleStart}
              >
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            )}
            <Button 
              variant="outline"
              className="border border-foreground/20 hover:border-foreground/40 text-foreground/70"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          {!minimal && completedPomodoros > 0 && (
            <div className="mt-4 text-sm text-primary">
              Completed pomodoros: {completedPomodoros}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
