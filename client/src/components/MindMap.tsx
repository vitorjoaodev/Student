import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MindMapNode, MindMapEdge, Task } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { Plus, X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MindMapProps {
  tasks?: Task[];
  preview?: boolean;
}

const MindMap = ({ tasks = [], preview = false }: MindMapProps) => {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [edges, setEdges] = useState<MindMapEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [showNodePopover, setShowNodePopover] = useState(false);

  // Fetch mind map nodes and edges
  const { data: mindMapNodes = [] } = useQuery<MindMapNode[]>({
    queryKey: ["/api/mindmap/nodes"],
    enabled: !preview
  });

  const { data: mindMapEdges = [] } = useQuery<MindMapEdge[]>({
    queryKey: ["/api/mindmap/edges"],
    enabled: !preview
  });

  // Set up nodes and edges
  useEffect(() => {
    if (preview) {
      // Set up preview data for demo
      const previewNodes: MindMapNode[] = [
        {
          id: 1,
          userId: 1,
          title: 'Machine Learning',
          parentId: null,
          taskId: null,
          color: '#6C5CE7',
          position: { x: 250, y: 150 }
        },
        {
          id: 2,
          userId: 1,
          title: 'Supervised',
          parentId: 1,
          taskId: null,
          color: '#00B894',
          position: { x: 100, y: 80 }
        },
        {
          id: 3,
          userId: 1,
          title: 'Unsupervised',
          parentId: 1,
          taskId: null,
          color: '#00B894',
          position: { x: 100, y: 220 }
        },
        {
          id: 4,
          userId: 1,
          title: 'Neural Networks',
          parentId: 1,
          taskId: null,
          color: '#FF6B6B',
          position: { x: 400, y: 80 }
        },
        {
          id: 5,
          userId: 1,
          title: 'Clustering',
          parentId: 1,
          taskId: null,
          color: '#FF6B6B',
          position: { x: 400, y: 220 }
        }
      ];

      const previewEdges: MindMapEdge[] = [
        { id: 1, userId: 1, sourceId: 1, targetId: 2 },
        { id: 2, userId: 1, sourceId: 1, targetId: 3 },
        { id: 3, userId: 1, sourceId: 1, targetId: 4 },
        { id: 4, userId: 1, sourceId: 1, targetId: 5 }
      ];

      setNodes(previewNodes);
      setEdges(previewEdges);
    } else {
      setNodes(mindMapNodes);
      setEdges(mindMapEdges);
    }
  // Include dependencies but use them directly, not in comparisons inside the effect
  }, [preview, preview ? null : mindMapNodes, preview ? null : mindMapEdges]);

  // Create node mutation
  const createNodeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/mindmap/nodes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/nodes"] });
      setNewNodeTitle('');
      setShowNodePopover(false);
      toast({
        title: "Node created",
        description: "Mind map node has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create node",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Create edge mutation
  const createEdgeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/mindmap/edges", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/edges"] });
      setSelectedNode(null);
      toast({
        title: "Connection created",
        description: "Mind map connection has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create connection",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Delete node mutation
  const deleteNodeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/mindmap/nodes/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/nodes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/edges"] });
      toast({
        title: "Node deleted",
        description: "Mind map node has been deleted successfully",
      });
    }
  });

  const handleNodeClick = (nodeId: number) => {
    if (selectedNode && selectedNode !== nodeId) {
      // Create a connection between nodes
      createEdgeMutation.mutate({
        sourceId: selectedNode,
        targetId: nodeId
      });
    } else {
      setSelectedNode(nodeId);
    }
  };

  const addNode = () => {
    if (!newNodeTitle.trim()) {
      toast({
        title: "Node title required",
        description: "Please enter a title for the new node",
        variant: "destructive",
      });
      return;
    }

    createNodeMutation.mutate({
      title: newNodeTitle,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 },
      color: '#6C5CE7'
    });
  };

  // Function to calculate the lines between connected nodes
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.sourceId);
      const targetNode = nodes.find(n => n.id === edge.targetId);
      
      if (!sourceNode || !targetNode) return null;
      
      // Ensure position is properly typed
      const position = (node: MindMapNode) => {
        if (!node.position) return { x: 0, y: 0 };
        const pos = node.position as { x: number, y: number };
        return pos;
      };
      
      const sourcePos = position(sourceNode);
      const targetPos = position(targetNode);
      
      const sourceX = sourcePos.x;
      const sourceY = sourcePos.y;
      const targetX = targetPos.x;
      const targetY = targetPos.y;
      
      // Draw SVG path
      return (
        <svg 
          key={`edge-${edge.id}`} 
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: 'visible' }}
        >
          <path
            d={`M ${sourceX} ${sourceY} L ${targetX} ${targetY}`}
            stroke="#6C5CE7"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6C5CE7" />
            </marker>
          </defs>
        </svg>
      );
    });
  };

  return (
    <div className={`bg-background/50 rounded-lg ${preview ? 'h-[240px]' : 'h-[75vh]'} w-full overflow-hidden glass relative`}>
      {!preview && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Popover open={showNodePopover} onOpenChange={setShowNodePopover}>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-1" /> Add Node
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Add New Concept</h3>
                <Input 
                  placeholder="Concept title"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  className="bg-background/50"
                />
                <div className="flex justify-end">
                  <Button variant="default" size="sm" onClick={addNode}>
                    Add
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {selectedNode && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedNode(null)}
            >
              Cancel Connection
            </Button>
          )}
        </div>
      )}

      {/* Simple Mind Map Canvas */}
      <div className="w-full h-full relative p-4 overflow-hidden">
        {/* Edge connections */}
        {renderEdges()}

        {/* Node elements */}
        {nodes.map(node => {
          // Ensure position is properly typed
          const nodePos = node.position ? (node.position as { x: number, y: number }) : { x: 0, y: 0 };
          
          return (
            <div
              key={`node-${node.id}`}
              className={cn(
                "absolute px-4 py-2 rounded-full min-w-[100px] text-center shadow-lg cursor-pointer",
                "flex items-center justify-center transition-all duration-200 z-10",
                selectedNode === node.id && "ring-2 ring-white"
              )}
              style={{
                backgroundColor: node.color || "#6C5CE7",
                left: `${nodePos.x}px`,
                top: `${nodePos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleNodeClick(node.id)}
            >
              <div className="text-white font-medium">{node.title}</div>
              {!preview && (
                <button
                  className="ml-2 h-4 w-4 rounded-full bg-white/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNodeMutation.mutate(node.id);
                  }}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          );
        })}

        {/* Background pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
      </div>

      {/* Simple controls for non-preview mode */}
      {!preview && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50">
            <Move className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MindMap;
