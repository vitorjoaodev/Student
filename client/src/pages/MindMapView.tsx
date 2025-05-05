import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MindMapNode, Task } from '@shared/schema';
import MindMap from '@/components/MindMap';
import { Button } from '@/components/ui/button';
import { BrainCircuit, PlusIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const MindMapView = () => {
  const [selectedMap, setSelectedMap] = useState("main");

  const { data: mindMapNodes = [] } = useQuery<MindMapNode[]>({
    queryKey: ["/api/mindmap/nodes"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Group nodes by parent to identify different maps
  const maps = mindMapNodes.reduce((acc: Record<string, string>, node) => {
    if (!node.parentId) {
      acc[node.id.toString()] = node.title;
    }
    return acc;
  }, {});

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-space text-foreground flex items-center">
            <BrainCircuit className="h-8 w-8 mr-2 text-primary" />
            Mind Map
          </h1>
          <p className="text-foreground/70 mt-1">
            Visualize connections between your study concepts
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <Select 
            value={selectedMap} 
            onValueChange={setSelectedMap}
          >
            <SelectTrigger className="w-[200px] bg-background border-primary/30">
              <SelectValue placeholder="Select Mind Map" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Concept Map</SelectItem>
              {Object.entries(maps).map(([id, title]) => (
                <SelectItem key={id} value={id}>{title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 h-full">
        <MindMap tasks={tasks} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How to use Mind Maps</h3>
            <ul className="text-sm space-y-2 text-foreground/80">
              <li>• Click <strong>Add Node</strong> to create a concept</li>
              <li>• Click on a node then another to connect them</li>
              <li>• Drag nodes to rearrange your map</li>
              <li>• Use mind maps to organize related study concepts</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Connect Tasks</h3>
            <p className="text-sm text-foreground/80">
              When creating a new task, check the "Connect to mind map" option to link it to your concept map. This helps visualize how your tasks relate to the broader study topics.
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="text-sm space-y-2 text-foreground/80">
              <li>• Create a central concept first</li>
              <li>• Branch out with related subtopics</li>
              <li>• Color-code by subject or priority</li>
              <li>• Review your map before exams</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default MindMapView;
