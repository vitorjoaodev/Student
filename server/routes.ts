import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertMindMapNodeSchema, 
  insertMindMapEdgeSchema, 
  insertGoalSchema, 
  insertPomodoroSessionSchema,
  updateTaskSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Middleware to handle Zod validation errors
const handleZodError = (err: unknown, res: Response) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors
    });
  }
  return res.status(500).json({ message: "Internal server error" });
};

// Helper to get the current user (mock implementation)
const getCurrentUserId = (req: Request): number => {
  // In a real app, this would be derived from JWT or session
  return 1; 
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - all prefixed with /api
  
  // User routes
  app.get('/api/user', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const courses = await storage.getCoursesByUserId(userId);
      res.json(courses);
    } catch (err) {
      res.status(500).json({ message: "Failed to get courses" });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, taskData);
      res.status(201).json(task);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const updateData = updateTaskSchema.parse(req.body);
      const updatedTask = await storage.updateTask(taskId, updateData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Mind Map routes
  app.get('/api/mindmap/nodes', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const nodes = await storage.getMindMapNodesByUserId(userId);
      res.json(nodes);
    } catch (err) {
      res.status(500).json({ message: "Failed to get mind map nodes" });
    }
  });

  app.post('/api/mindmap/nodes', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const nodeData = insertMindMapNodeSchema.parse(req.body);
      const node = await storage.createMindMapNode(userId, nodeData);
      res.status(201).json(node);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch('/api/mindmap/nodes/:id', async (req: Request, res: Response) => {
    try {
      const nodeId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedNode = await storage.updateMindMapNode(nodeId, updateData);
      
      if (!updatedNode) {
        return res.status(404).json({ message: "Node not found" });
      }
      
      res.json(updatedNode);
    } catch (err) {
      res.status(500).json({ message: "Failed to update node" });
    }
  });

  app.delete('/api/mindmap/nodes/:id', async (req: Request, res: Response) => {
    try {
      const nodeId = parseInt(req.params.id);
      const success = await storage.deleteMindMapNode(nodeId);
      
      if (!success) {
        return res.status(404).json({ message: "Node not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete node" });
    }
  });

  app.get('/api/mindmap/edges', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const edges = await storage.getMindMapEdgesByUserId(userId);
      res.json(edges);
    } catch (err) {
      res.status(500).json({ message: "Failed to get mind map edges" });
    }
  });

  app.post('/api/mindmap/edges', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const edgeData = insertMindMapEdgeSchema.parse(req.body);
      const edge = await storage.createMindMapEdge(userId, edgeData);
      res.status(201).json(edge);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete('/api/mindmap/edges/:id', async (req: Request, res: Response) => {
    try {
      const edgeId = parseInt(req.params.id);
      const success = await storage.deleteMindMapEdge(edgeId);
      
      if (!success) {
        return res.status(404).json({ message: "Edge not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete edge" });
    }
  });

  // Goal routes
  app.get('/api/goals', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (err) {
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  app.post('/api/goals', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(userId, goalData);
      res.status(201).json(goal);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch('/api/goals/:id', async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedGoal = await storage.updateGoal(goalId, updateData);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(updatedGoal);
    } catch (err) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete('/api/goals/:id', async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const success = await storage.deleteGoal(goalId);
      
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Pomodoro routes
  app.get('/api/pomodoro/sessions', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const sessions = await storage.getPomodoroSessionsByUserId(userId);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Failed to get pomodoro sessions" });
    }
  });

  app.post('/api/pomodoro/sessions', async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const sessionData = insertPomodoroSessionSchema.parse(req.body);
      const session = await storage.createPomodoroSession(userId, sessionData);
      res.status(201).json(session);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch('/api/pomodoro/sessions/:id', async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedSession = await storage.updatePomodoroSession(sessionId, updateData);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(updatedSession);
    } catch (err) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
