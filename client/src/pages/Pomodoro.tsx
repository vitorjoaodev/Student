import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Task, PomodoroSession } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, History, BarChart3 } from 'lucide-react';
import PomodoroTimer from '@/components/PomodoroTimer';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getDay, subDays } from 'date-fns';

const Pomodoro = () => {
  const [activeTab, setActiveTab] = useState("timer");

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: sessions = [] } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro/sessions"],
  });

  // Format pomodoro sessions for history display
  const formatSessionDate = (date: Date | string) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };
  
  const getSessionDuration = (session: PomodoroSession) => {
    if (session.duration) {
      return `${session.duration} minutes`;
    }
    if (session.startTime && session.endTime) {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const diffInMs = end.getTime() - start.getTime();
      const diffInMinutes = Math.round(diffInMs / (1000 * 60));
      return `${diffInMinutes} minutes`;
    }
    return 'Unknown duration';
  };

  const getSessionTask = (session: PomodoroSession) => {
    if (!session.taskId) return "No specific task";
    const task = tasks.find(t => t.id === session.taskId);
    return task ? task.title : "Unknown task";
  };

  // Prepare chart data
  const prepareChartData = () => {
    const today = new Date();
    const startDay = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
    const endDay = endOfWeek(today, { weekStartsOn: 1 });
    
    const daysOfWeek = eachDayOfInterval({ start: startDay, end: endDay });
    
    // Initialize daily totals
    const dailyTotals = new Array(7).fill(0);
    
    // Calculate minutes studied per day
    sessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      if (sessionDate >= startDay && sessionDate <= endDay) {
        const dayIndex = getDay(sessionDate) - 1; // Adjust if using Monday as start (0-6)
        const adjustedIndex = dayIndex < 0 ? 6 : dayIndex; // Convert Sunday (0) to be 6
        dailyTotals[adjustedIndex] += session.duration;
      }
    });
    
    // Prepare chart data
    const chartData = {
      labels: daysOfWeek.map(day => format(day, 'EEE')),
      datasets: [
        {
          label: 'Minutes Studied',
          data: dailyTotals,
          backgroundColor: '#6C5CE7',
          borderColor: '#6C5CE7',
          borderWidth: 1,
        },
      ],
    };
    
    return chartData;
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ECF0F1',
        }
      },
      title: {
        display: true,
        text: 'Weekly Study Time (Minutes)',
        color: '#ECF0F1',
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(236, 240, 241, 0.1)',
        },
        ticks: {
          color: '#ECF0F1',
        }
      },
      y: {
        grid: {
          color: 'rgba(236, 240, 241, 0.1)',
        },
        ticks: {
          color: '#ECF0F1',
        }
      }
    },
  };

  // Calculate statistics
  const calculateStats = () => {
    if (sessions.length === 0) return { total: 0, average: 0, streak: 0 };
    
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageMinutes = Math.round(totalMinutes / sessions.length);
    
    // Calculate streak (consecutive days with sessions)
    const sessionDays = sessions.map(s => format(new Date(s.startTime), 'yyyy-MM-dd'));
    // Handle Set conversion by converting to array first
    const uniqueDaysSet = new Set(sessionDays);
    const uniqueDays = Array.from(uniqueDaysSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (uniqueDays.includes(today)) {
      streak = 1;
      let checkDate = subDays(new Date(), 1);
      
      while (uniqueDays.includes(format(checkDate, 'yyyy-MM-dd'))) {
        streak++;
        checkDate = subDays(checkDate, 1);
      }
    }
    
    return {
      total: totalMinutes,
      average: averageMinutes,
      streak,
    };
  };

  const stats = calculateStats();

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-space text-foreground flex items-center">
            <Timer className="h-8 w-8 mr-2 text-primary" />
            Pomodoro Timer
          </h1>
          <p className="text-foreground/70 mt-1">
            Focus on your tasks with timed study sessions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="timer" className="flex items-center">
            <Timer className="h-4 w-4 mr-2" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <PomodoroTimer tasks={tasks.filter(t => !t.completed)} />
            </div>
            
            <Card className="glass neon-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-space text-lg text-foreground">Pomodoro Technique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">How it works:</h3>
                    <ol className="list-decimal list-inside text-sm space-y-1 text-foreground/80">
                      <li>Choose a task to focus on</li>
                      <li>Set the timer for 25 minutes</li>
                      <li>Work on the task until the timer rings</li>
                      <li>Take a short 5-minute break</li>
                      <li>After 4 pomodoros, take a longer 15-30 minute break</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">Benefits:</h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-foreground/80">
                      <li>Improves focus and concentration</li>
                      <li>Reduces mental fatigue</li>
                      <li>Increases accountability</li>
                      <li>Creates a sense of accomplishment</li>
                      <li>Helps manage distractions</li>
                    </ul>
                  </div>
                  
                  <div className="py-2 px-4 rounded-md bg-primary/10 border border-primary/20">
                    <p className="text-sm text-foreground/90">
                      <span className="font-medium">Pro tip:</span> Start with one pomodoro at a time and gradually increase as your focus improves.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass neon-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-space text-lg text-foreground">Current Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-lg text-center">
                  <div className="text-3xl font-mono font-bold text-primary">{stats.total}</div>
                  <div className="text-sm text-foreground/70">Total Minutes</div>
                </div>
                <div className="glass p-4 rounded-lg text-center">
                  <div className="text-3xl font-mono font-bold text-secondary">{stats.average}</div>
                  <div className="text-sm text-foreground/70">Avg Minutes/Session</div>
                </div>
                <div className="glass p-4 rounded-lg text-center">
                  <div className="text-3xl font-mono font-bold text-accent">{stats.streak}</div>
                  <div className="text-sm text-foreground/70">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="glass neon-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-space text-lg text-foreground">Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-foreground/70">
                  <p>No pomodoro sessions recorded yet.</p>
                  <p className="text-sm mt-2">Complete your first session to see it here!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                  {sessions
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map(session => (
                      <div key={session.id} className="glass p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div>
                            <h3 className="font-medium">{getSessionTask(session)}</h3>
                            <p className="text-sm text-foreground/70">{formatSessionDate(session.startTime)}</p>
                          </div>
                          <div className="mt-2 sm:mt-0 text-right">
                            <div className="text-lg font-mono text-primary">{getSessionDuration(session)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="glass neon-border">
              <CardContent className="pt-6">
                <div className="text-4xl font-mono font-bold text-primary text-center">{stats.total}</div>
                <div className="text-center text-foreground/70">Total Minutes</div>
              </CardContent>
            </Card>
            
            <Card className="glass neon-border">
              <CardContent className="pt-6">
                <div className="text-4xl font-mono font-bold text-secondary text-center">{sessions.length}</div>
                <div className="text-center text-foreground/70">Total Sessions</div>
              </CardContent>
            </Card>
            
            <Card className="glass neon-border">
              <CardContent className="pt-6">
                <div className="text-4xl font-mono font-bold text-accent text-center">{stats.streak}</div>
                <div className="text-center text-foreground/70">Day Streak</div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass neon-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-space text-lg text-foreground">Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {sessions.length === 0 ? (
                <div className="text-center text-foreground/70 h-full flex items-center justify-center">
                  <div>
                    <p>No data to display yet.</p>
                    <p className="text-sm mt-2">Complete some pomodoro sessions to see your statistics!</p>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <div className="flex items-end h-[300px] justify-between px-4 mt-8">
                    {prepareChartData().datasets[0].data.map((value, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-primary w-14 rounded-t-md transition-all duration-300"
                          style={{ 
                            height: `${Math.max(5, (value / Math.max(...prepareChartData().datasets[0].data)) * 100)}%`,
                            minHeight: value > 0 ? '20px' : '5px'
                          }}
                        />
                        <div className="text-xs mt-2">{prepareChartData().labels[index]}</div>
                        <div className="text-xs font-mono text-primary/80">{value}m</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Pomodoro;
