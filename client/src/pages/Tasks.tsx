import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { Task } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';

const Tasks = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold font-space text-foreground">
          Tasks
        </h1>
        <Button 
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-neon flex items-center font-medium transition-all duration-300"
          onClick={() => setShowTaskModal(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Task
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="space-y-6">
            <TaskList title="All Tasks" />
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="space-y-6">
            {pendingTasks.length > 0 ? (
              <TaskList title="Pending Tasks" />
            ) : (
              <div className="glass rounded-lg p-8 text-center">
                <p className="text-foreground/70">No pending tasks. Great job!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="space-y-6">
            {completedTasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="glass rounded-lg p-4 opacity-60 neon-border-secondary">
                    <h3 className="font-medium text-foreground line-through">{task.title}</h3>
                    {task.description && (
                      <p className="text-foreground/70 text-sm mt-1">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-lg p-8 text-center">
                <p className="text-foreground/70">No completed tasks yet. Start with your first task!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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

export default Tasks;
