import {
  users, type User, type InsertUser,
  courses, type Course, type InsertCourse,
  tasks, type Task, type InsertTask, type UpdateTask,
  mindMapNodes, type MindMapNode, type InsertMindMapNode,
  mindMapEdges, type MindMapEdge, type InsertMindMapEdge,
  goals, type Goal, type InsertGoal,
  pomodoroSessions, type PomodoroSession, type InsertPomodoroSession
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByUserId(userId: number): Promise<Course[]>;
  createCourse(userId: number, course: InsertCourse): Promise<Course>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Mind Map methods
  getMindMapNodesByUserId(userId: number): Promise<MindMapNode[]>;
  createMindMapNode(userId: number, node: InsertMindMapNode): Promise<MindMapNode>;
  updateMindMapNode(id: number, node: Partial<InsertMindMapNode>): Promise<MindMapNode | undefined>;
  deleteMindMapNode(id: number): Promise<boolean>;
  
  getMindMapEdgesByUserId(userId: number): Promise<MindMapEdge[]>;
  createMindMapEdge(userId: number, edge: InsertMindMapEdge): Promise<MindMapEdge>;
  deleteMindMapEdge(id: number): Promise<boolean>;
  
  // Goal methods
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  createGoal(userId: number, goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Pomodoro methods
  getPomodoroSessionsByUserId(userId: number): Promise<PomodoroSession[]>;
  createPomodoroSession(userId: number, session: InsertPomodoroSession): Promise<PomodoroSession>;
  updatePomodoroSession(id: number, session: Partial<InsertPomodoroSession>): Promise<PomodoroSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private tasks: Map<number, Task>;
  private mindMapNodes: Map<number, MindMapNode>;
  private mindMapEdges: Map<number, MindMapEdge>;
  private goals: Map<number, Goal>;
  private pomodoroSessions: Map<number, PomodoroSession>;
  
  private currentUserId: number;
  private currentCourseId: number;
  private currentTaskId: number;
  private currentNodeId: number;
  private currentEdgeId: number;
  private currentGoalId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.tasks = new Map();
    this.mindMapNodes = new Map();
    this.mindMapEdges = new Map();
    this.goals = new Map();
    this.pomodoroSessions = new Map();
    
    this.currentUserId = 1;
    this.currentCourseId = 1;
    this.currentTaskId = 1;
    this.currentNodeId = 1;
    this.currentEdgeId = 1;
    this.currentGoalId = 1;
    this.currentSessionId = 1;
    
    // Add sample user for development
    this.createUser({
      username: "student",
      password: "password123",
      firstName: "John",
      lastName: "Smith",
      university: "Stanford University"
    });
    
    // Add some sample courses for the user
    this.createCourse(1, {
      name: "Deep Learning",
      code: "CS 401",
      color: "#6C5CE7"
    });
    
    this.createCourse(1, {
      name: "Calculus II",
      code: "MATH 240",
      color: "#00B894"
    });
    
    this.createCourse(1, {
      name: "Waves & Optics",
      code: "PHYS 210",
      color: "#FF6B6B"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      university: insertUser.university || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCoursesByUserId(userId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.userId === userId
    );
  }
  
  async createCourse(userId: number, insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = { ...insertCourse, id, userId };
    this.courses.set(id, course);
    return course;
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async createTask(userId: number, insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const createdAt = new Date();
    
    // Handle null values and convert string dates to Date objects
    const dueDate = insertTask.dueDate ? 
      (typeof insertTask.dueDate === 'string' ? new Date(insertTask.dueDate) : insertTask.dueDate) : 
      null;
      
    const task: Task = { 
      ...insertTask, 
      id, 
      userId, 
      createdAt,
      description: insertTask.description || null,
      courseId: insertTask.courseId || null,
      dueDate,
      priority: insertTask.priority || "medium",
      completed: insertTask.completed || false
    };
    
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, updateData: UpdateTask): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    // Convert date string to Date if needed
    if (updateData.dueDate && typeof updateData.dueDate === 'string') {
      updateData = {
        ...updateData,
        dueDate: new Date(updateData.dueDate)
      };
    }
    
    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Mind Map methods
  async getMindMapNodesByUserId(userId: number): Promise<MindMapNode[]> {
    return Array.from(this.mindMapNodes.values()).filter(
      (node) => node.userId === userId
    );
  }
  
  async createMindMapNode(userId: number, insertNode: InsertMindMapNode): Promise<MindMapNode> {
    const id = this.currentNodeId++;
    const node: MindMapNode = { 
      ...insertNode, 
      id, 
      userId,
      color: insertNode.color || null,
      parentId: insertNode.parentId || null,
      taskId: insertNode.taskId || null
    };
    this.mindMapNodes.set(id, node);
    return node;
  }
  
  async updateMindMapNode(id: number, updateData: Partial<InsertMindMapNode>): Promise<MindMapNode | undefined> {
    const node = this.mindMapNodes.get(id);
    if (!node) return undefined;
    
    const updatedNode = { ...node, ...updateData };
    this.mindMapNodes.set(id, updatedNode);
    return updatedNode;
  }
  
  async deleteMindMapNode(id: number): Promise<boolean> {
    return this.mindMapNodes.delete(id);
  }
  
  async getMindMapEdgesByUserId(userId: number): Promise<MindMapEdge[]> {
    return Array.from(this.mindMapEdges.values()).filter(
      (edge) => edge.userId === userId
    );
  }
  
  async createMindMapEdge(userId: number, insertEdge: InsertMindMapEdge): Promise<MindMapEdge> {
    const id = this.currentEdgeId++;
    const edge: MindMapEdge = { ...insertEdge, id, userId };
    this.mindMapEdges.set(id, edge);
    return edge;
  }
  
  async deleteMindMapEdge(id: number): Promise<boolean> {
    return this.mindMapEdges.delete(id);
  }
  
  // Goal methods
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }
  
  async createGoal(userId: number, insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      userId,
      color: insertGoal.color || null,
      courseId: insertGoal.courseId || null,
      progress: insertGoal.progress || 0
    };
    this.goals.set(id, goal);
    return goal;
  }
  
  async updateGoal(id: number, updateData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updateData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
  
  // Pomodoro methods
  async getPomodoroSessionsByUserId(userId: number): Promise<PomodoroSession[]> {
    return Array.from(this.pomodoroSessions.values()).filter(
      (session) => session.userId === userId
    );
  }
  
  async createPomodoroSession(userId: number, insertSession: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = this.currentSessionId++;
    const session: PomodoroSession = { 
      ...insertSession, 
      id, 
      userId,
      taskId: insertSession.taskId || null,
      endTime: insertSession.endTime || null
    };
    this.pomodoroSessions.set(id, session);
    return session;
  }
  
  async updatePomodoroSession(id: number, updateData: Partial<InsertPomodoroSession>): Promise<PomodoroSession | undefined> {
    const session = this.pomodoroSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updateData };
    this.pomodoroSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
