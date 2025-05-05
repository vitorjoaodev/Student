import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MindMapNode, InsertMindMapNode, MindMapEdge, InsertMindMapEdge } from '@shared/schema';
import { randomColor } from '@/lib/utils';

interface CreateNodeParams {
  title: string;
  parentId?: number | null;
  position: { x: number, y: number };
  color?: string;
  taskId?: number | null;
}

interface CreateEdgeParams {
  sourceId: number;
  targetId: number;
}

/**
 * Custom hook for mind map operations
 */
export default function useMindMap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Create node mutation
  const createNodeMutation = useMutation({
    mutationFn: async (data: InsertMindMapNode) => {
      return await apiRequest("POST", "/api/mindmap/nodes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/nodes"] });
      toast({
        title: "Node created",
        description: "Mind map node has been created successfully",
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

  // Update node mutation
  const updateNodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertMindMapNode> }) => {
      return await apiRequest("PATCH", `/api/mindmap/nodes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/nodes"] });
      toast({
        title: "Node updated",
        description: "Mind map node has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update node",
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
    },
    onError: (error) => {
      toast({
        title: "Failed to delete node",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Create edge mutation
  const createEdgeMutation = useMutation({
    mutationFn: async (data: InsertMindMapEdge) => {
      return await apiRequest("POST", "/api/mindmap/edges", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/edges"] });
      toast({
        title: "Connection created",
        description: "Mind map connection has been created successfully",
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

  // Delete edge mutation
  const deleteEdgeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/mindmap/edges/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindmap/edges"] });
      toast({
        title: "Connection deleted",
        description: "Mind map connection has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete connection",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Create a new node
  const createNode = useCallback(({ title, parentId = null, position, color, taskId = null }: CreateNodeParams) => {
    createNodeMutation.mutate({
      title,
      parentId,
      position,
      color: color || randomColor(),
      taskId
    });
  }, [createNodeMutation]);

  // Update a node
  const updateNode = useCallback((id: number, data: Partial<InsertMindMapNode>) => {
    updateNodeMutation.mutate({ id, data });
  }, [updateNodeMutation]);

  // Delete a node
  const deleteNode = useCallback((id: number) => {
    deleteNodeMutation.mutate(id);
  }, [deleteNodeMutation]);

  // Create an edge between nodes
  const createEdge = useCallback(({ sourceId, targetId }: CreateEdgeParams) => {
    createEdgeMutation.mutate({
      sourceId,
      targetId
    });
  }, [createEdgeMutation]);

  // Delete an edge
  const deleteEdge = useCallback((id: number) => {
    deleteEdgeMutation.mutate(id);
  }, [deleteEdgeMutation]);

  // Handle node selection for creating connections
  const handleNodeSelection = useCallback((nodeId: string) => {
    if (selectedNode && selectedNode !== nodeId) {
      // Create a connection between nodes
      createEdge({
        sourceId: parseInt(selectedNode),
        targetId: parseInt(nodeId)
      });
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
    }
  }, [selectedNode, createEdge]);

  // Clear node selection
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return {
    selectedNode,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
    handleNodeSelection,
    clearSelection,
    isLoading: 
      createNodeMutation.isPending || 
      updateNodeMutation.isPending || 
      deleteNodeMutation.isPending || 
      createEdgeMutation.isPending || 
      deleteEdgeMutation.isPending
  };
}
