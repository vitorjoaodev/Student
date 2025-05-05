import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Task } from '@shared/schema';
import { Button } from '@/components/ui/button';
import TaskModal from '@/components/TaskModal';
import TaskList from '@/components/TaskList';
import PomodoroTimer from '@/components/PomodoroTimer';
import GoalVisualization from '@/components/GoalVisualization';
import MindMap from '@/components/MindMap';
import WeeklyCalendar from '@/components/WeeklyCalendar';

const Dashboard = () => {
  const { user } = useUser();
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const upcomingTasksCount = tasks.filter(task => !task.completed).length;

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-space text-foreground">
            Welcome back, <span className="text-primary">{user?.firstName || 'Student'}</span>
          </h1>
          <p className="text-foreground/70 mt-1">
            You have <span className="text-accent font-semibold">{upcomingTasksCount} tasks</span> due this week
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-neon flex items-center font-medium transition-all duration-300"
            onClick={() => setShowTaskModal(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Access Components */}
        <PomodoroTimer tasks={tasks.filter(t => !t.completed)} minimal />
        <GoalVisualization preview />
      </div>

      {/* Mind Map Preview */}
      <div className="glass rounded-xl p-4 shadow-card neon-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-space font-semibold text-lg text-foreground">Mind Map: Study Concepts</h2>
          <Button 
            variant="link" 
            className="text-xs text-primary p-0 h-auto"
            onClick={() => window.location.href = "/mindmap"}
          >
            Expand
          </Button>
        </div>
        <MindMap preview />
      </div>

      {/* Tasks Section */}
      <TaskList title="Upcoming Tasks" limit={3} />

      {/* Weekly Overview */}
      <WeeklyCalendar />

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal 
          open={showTaskModal} 
          onOpenChange={setShowTaskModal} 
          courses={courses} 
        />
      )}
    </main>
  );
};

export default Dashboard;
