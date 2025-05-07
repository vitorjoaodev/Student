import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '../../lib/queryClient';
import { Task, InsertTask, UpdateTask } from '../../../../shared/schema';

interface TasksState {
  items: Task[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: 'idle',
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async () => {
    const response = await apiRequest<Task[]>('GET', '/api/tasks');
    return response;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: InsertTask) => {
    const response = await apiRequest<Task>('POST', '/api/tasks', task);
    return response;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: number; data: UpdateTask }) => {
    const response = await apiRequest<Task>('PATCH', `/api/tasks/${id}`, data);
    return response;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number) => {
    await apiRequest('DELETE', `/api/tasks/${id}`);
    return id;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    toggleTaskCompletion(state, action: PayloadAction<number>) {
      const task = state.items.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.id !== action.payload);
      });
  },
});

export const { toggleTaskCompletion } = tasksSlice.actions;
export default tasksSlice.reducer;