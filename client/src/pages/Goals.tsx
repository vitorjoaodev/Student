import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusIcon, Target, Trash2 } from 'lucide-react';
import { Goal, Course, insertGoalSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GoalVisualization from '@/components/GoalVisualization';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Progress } from '@/components/ui/progress';

const Goals = () => {
  const { toast } = useToast();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Form schema for the goal
  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    progress: z.number().min(0).max(100),
    courseId: z.number().optional().nullable(),
    color: z.string().optional(),
  });

  // Initialize form with default values or editing goal
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingGoal?.title || "",
      progress: editingGoal?.progress || 0,
      courseId: editingGoal?.courseId || null,
      color: editingGoal?.color || "#6C5CE7",
    },
  });

  // Reset form when editing goal changes
  useState(() => {
    if (editingGoal) {
      form.reset({
        title: editingGoal.title,
        progress: editingGoal.progress,
        courseId: editingGoal.courseId || null,
        color: editingGoal.color || "#6C5CE7",
      });
    } else {
      form.reset({
        title: "",
        progress: 0,
        courseId: null,
        color: "#6C5CE7",
      });
    }
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertGoalSchema>) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal created",
        description: "Your goal has been created successfully",
      });
      setShowGoalModal(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create goal",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof insertGoalSchema>> }) => {
      return await apiRequest("PATCH", `/api/goals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully",
      });
      setShowGoalModal(false);
      setEditingGoal(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update goal",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/goals/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully",
      });
      setEditingGoal(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete goal",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleDeleteGoal = (goal: Goal) => {
    if (confirm(`Are you sure you want to delete the goal "${goal.title}"?`)) {
      deleteGoalMutation.mutate(goal.id);
    }
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    form.reset({
      title: goal.title,
      progress: goal.progress,
      courseId: goal.courseId || null,
      color: goal.color || "#6C5CE7",
    });
    setShowGoalModal(true);
  };

  const closeModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
    form.reset({
      title: "",
      progress: 0,
      courseId: null,
      color: "#6C5CE7",
    });
  };

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-space text-foreground flex items-center">
            <Target className="h-8 w-8 mr-2 text-secondary" />
            Goals
          </h1>
          <p className="text-foreground/70 mt-1">
            Track your semester objectives and visualize progress
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg shadow-neon-secondary flex items-center font-medium transition-all duration-300"
            onClick={() => {
              setEditingGoal(null);
              form.reset({
                title: "",
                progress: 0,
                courseId: null,
                color: "#6C5CE7",
              });
              setShowGoalModal(true);
            }}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* 3D Goal Visualization */}
      <div className="h-[400px] w-full">
        <GoalVisualization />
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-space text-foreground">
          Your Goals
        </h2>
        
        {goalsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="glass animate-pulse h-36"></Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Card className="glass p-8 text-center">
            <p className="text-foreground/70">You haven't set any goals yet. Create your first goal to start tracking progress!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => {
              const course = goal.courseId ? courses.find(c => c.id === goal.courseId) : null;
              
              return (
                <Card 
                  key={goal.id} 
                  className="glass shadow-card task-card overflow-hidden"
                  style={{ borderColor: goal.color || '#6C5CE7' }}
                  onClick={() => openEditModal(goal)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{goal.title}</h3>
                        {course && (
                          <div 
                            className="text-xs px-2 py-0.5 rounded inline-block mt-1"
                            style={{ 
                              backgroundColor: `${course.color}20`, 
                              color: course.color 
                            }}
                          >
                            {course.code}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-foreground/60 hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-foreground/70">Progress</span>
                        <span className="text-sm font-mono">{goal.progress}%</span>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        max={100}
                        className="h-2"
                        style={{ 
                          '--progress-background': goal.color || '#6C5CE7' 
                        } as React.CSSProperties}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={closeModal}>
        <DialogContent className="glass-modal sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-space text-foreground">
              {editingGoal ? "Edit Goal" : "New Goal"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter goal title" 
                        {...field} 
                        className="bg-background border-primary/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Course</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-primary/30">
                          <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Course</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.code}: {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex space-x-2">
                      {['#6C5CE7', '#00B894', '#FF6B6B', '#FFC400', '#E056FD'].map(color => (
                        <div 
                          key={color}
                          className={`h-8 w-8 rounded-full cursor-pointer transition-all ${field.value === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          className="w-8 h-8 p-0 overflow-hidden rounded-full cursor-pointer"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Progress</FormLabel>
                      <span className="text-sm font-mono">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex space-x-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeModal}
                  className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-white shadow-neon-secondary"
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                >
                  {editingGoal ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Goals;
