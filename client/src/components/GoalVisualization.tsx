import { useState, useEffect } from 'react';
import { Goal, Course } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

interface GoalVisualizationProps {
  preview?: boolean;
}

const GoalVisualization = ({ preview = false }: GoalVisualizationProps) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !preview,
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !preview,
  });

  // Simple animation effect
  useEffect(() => {
    if (!preview) {
      const interval = setInterval(() => {
        setRotationAngle(prev => (prev + 0.5) % 360);
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [preview]);

  const getGoalsWithCourses = () => {
    if (preview) {
      // Return preview data
      return [
        { id: 1, title: "Semester", progress: 68, color: "#00B894" },
        { id: 2, title: "Web Dev", progress: 75, color: "#6C5CE7" },
        { id: 3, title: "Math", progress: 54, color: "#FF6B6B" },
        { id: 4, title: "AI", progress: 82, color: "#00B894" },
        { id: 5, title: "Physics", progress: 62, color: "#6C5CE7" }
      ];
    }
    
    // Return real data with course info
    return goals.map(goal => {
      const course = goal.courseId ? courses.find(c => c.id === goal.courseId) : null;
      return {
        ...goal,
        color: goal.color || (course?.color || "#6C5CE7")
      };
    });
  };

  const goalsWithCourses = getGoalsWithCourses();
  const mainGoal = goalsWithCourses.find(g => g.title === "Semester") || goalsWithCourses[0];
  const otherGoals = goalsWithCourses.filter(g => g.id !== mainGoal?.id);

  // Calculate semester progress from all goals
  const calculateOverallProgress = () => {
    if (goalsWithCourses.length === 0) return 0;
    const sum = goalsWithCourses.reduce((total, goal) => total + goal.progress, 0);
    return Math.round(sum / goalsWithCourses.length);
  };

  return (
    <Card className="glass neon-border-secondary">
      <CardHeader className={preview ? 'p-4 pb-0' : 'pb-0'}>
        <CardTitle className="font-space text-lg text-foreground">Semester Goals</CardTitle>
      </CardHeader>
      <CardContent className={preview ? 'p-4 pt-2' : 'pt-4'}>
        <div className="bg-background/50 rounded-lg p-5 h-[200px] flex items-center justify-center goal-viz relative">
          {goalsWithCourses.length === 0 ? (
            <div className="text-center text-foreground/70">
              <p>No goals yet.</p>
              <p className="text-sm">Create goals to see your progress visualization</p>
            </div>
          ) : (
            // Simple visualization (works for both preview and full mode)
            <div className="relative w-full h-full">
              {/* Main central goal */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full bg-secondary/10 flex items-center justify-center z-10">
                <div className="w-[100px] h-[100px] rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-secondary text-2xl font-bold font-mono">{calculateOverallProgress()}%</div>
                    <div className="text-xs text-foreground/70">Semester</div>
                  </div>
                </div>
              </div>
              
              {/* Satellite goals */}
              {otherGoals.slice(0, 4).map((goal, index) => {
                // Calculate position based on angle
                const angle = (index / otherGoals.length) * 360 + rotationAngle;
                const radius = preview ? 80 : 120; // Smaller radius for preview
                
                // Convert polar to cartesian coordinates
                const top = `calc(50% - ${Math.sin(angle * Math.PI / 180) * radius}px)`;
                const left = `calc(50% - ${Math.cos(angle * Math.PI / 180) * radius}px)`;
                
                return (
                  <div 
                    key={goal.id} 
                    className="absolute w-[60px] h-[60px] rounded-full flex items-center justify-center pulse"
                    style={{
                      top,
                      left,
                      backgroundColor: `${goal.color}20`,
                      animationDelay: `${index * 0.4}s`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="text-xs text-center">
                      <div className="text-sm font-bold" style={{ color: goal.color }}>{goal.progress}%</div>
                      <div className="text-foreground/70 text-[10px]">{goal.title}</div>
                    </div>
                  </div>
                );
              })}
              
              {/* Add circular orbit paths */}
              {!preview && (
                <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
                  <circle 
                    cx="50%" 
                    cy="50%" 
                    r="120" 
                    fill="none" 
                    stroke="#6C5CE720" 
                    strokeWidth="1" 
                    strokeDasharray="5,5" 
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalVisualization;
