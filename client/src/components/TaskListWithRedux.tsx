import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import TaskCard from './TaskCard';
import { useToast } from '@/hooks/use-toast';
import TaskModal from './TaskModal';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchTasks, selectFilteredTasks, setFilteredBy, setSortedBy } from '@/store/slices/tasksSlice';
import { Course } from '../../shared/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskListWithReduxProps {
  title?: string;
  limit?: number;
  courses: Course[];
}

const TaskListWithRedux = ({ 
  title = "Tarefas", 
  limit,
  courses 
}: TaskListWithReduxProps) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectFilteredTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Carrega as tarefas ao montar o componente
  useEffect(() => {
    dispatch(fetchTasks())
      .unwrap()
      .catch(error => {
        toast({
          title: "Erro ao carregar tarefas",
          description: error.message || "Não foi possível carregar as tarefas. Tente novamente mais tarde.",
          variant: "destructive"
        });
      });
  }, [dispatch, toast]);
  
  // Função para abrir o modal de criação de tarefa
  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };
  
  // Função para abrir o modal de edição de tarefa
  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  // Função para aplicar filtro
  const handleFilterChange = (filter: 'all' | 'completed' | 'incomplete') => {
    dispatch(setFilteredBy(filter));
  };
  
  // Função para aplicar ordenação
  const handleSortChange = (sort: 'dueDate' | 'priority' | 'createdAt') => {
    dispatch(setSortedBy(sort));
  };
  
  // Limita o número de tarefas exibidas se especificado
  const displayedTasks = limit ? tasks.slice(0, limit) : tasks;
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('completed')}>
                  Concluídas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('incomplete')}>
                  Pendentes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSortChange('dueDate')}>
                  Data de vencimento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('priority')}>
                  Prioridade
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('createdAt')}>
                  Data de criação
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleAddTask} size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova tarefa
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma tarefa encontrada</p>
              <Button onClick={handleAddTask} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar primeira tarefa
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  courses={courses}
                  onEdit={() => handleEditTask(task)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <TaskModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        task={selectedTask}
        courses={courses}
      />
    </Card>
  );
};

export default TaskListWithRedux;