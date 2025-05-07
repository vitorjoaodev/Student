import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Task, InsertTask, UpdateTask } from '../../../shared/schema';
import { apiRequest } from '../../lib/queryClient';
import { queryClient } from '../../lib/queryClient';
import { RootState } from '../index';

interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filteredBy: 'all' | 'completed' | 'incomplete';
  sortedBy: 'dueDate' | 'priority' | 'createdAt';
  filterCourseId: number | null;
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  filteredBy: 'all',
  sortedBy: 'dueDate',
  filterCourseId: null
};

// Thunks - Ações assíncronas
export const fetchTasks = createAsyncThunk<Task[]>(
  'tasks/fetchTasks',
  async () => {
    return await apiRequest('/api/tasks');
  }
);

export const addTask = createAsyncThunk<Task, InsertTask>(
  'tasks/addTask',
  async (task) => {
    return await apiRequest('/api/tasks', { method: 'POST', body: task });
  }
);

export const updateTask = createAsyncThunk<Task, { id: number; data: UpdateTask }>(
  'tasks/updateTask',
  async ({ id, data }) => {
    return await apiRequest(`/api/tasks/${id}`, { method: 'PATCH', body: data });
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number) => {
    await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
    return id;
  }
);

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilteredBy: (state, action: PayloadAction<'all' | 'completed' | 'incomplete'>) => {
      state.filteredBy = action.payload;
    },
    setSortedBy: (state, action: PayloadAction<'dueDate' | 'priority' | 'createdAt'>) => {
      state.sortedBy = action.payload;
    },
    setFilterCourseId: (state, action: PayloadAction<number | null>) => {
      state.filterCourseId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Caso de fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Substitui o estado atual com os dados recebidos
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro desconhecido ao buscar tarefas';
      })
      
      // Caso de addTask
      .addCase(addTask.fulfilled, (state, action) => {
        // Adiciona a nova tarefa à lista
        state.items.push(action.payload);
        // Invalida o cache para garantir que os dados estejam atualizados
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      })
      
      // Caso de updateTask
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      })
      
      // Caso de deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.id !== action.payload);
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      });
  }
});

// Exportando ações
export const { setFilteredBy, setSortedBy, setFilterCourseId } = tasksSlice.actions;

// Seletores
export const selectAllTasks = (state: RootState) => state.tasks.items;

export const selectFilteredTasks = (state: RootState) => {
  const { items, filteredBy, sortedBy, filterCourseId } = state.tasks;
  
  // Filtra as tarefas com base no filtro atual
  let filteredTasks = items;
  
  if (filteredBy === 'completed') {
    filteredTasks = items.filter(task => task.completed);
  } else if (filteredBy === 'incomplete') {
    filteredTasks = items.filter(task => !task.completed);
  }
  
  // Filtra por curso se houver um filtro de curso
  if (filterCourseId !== null) {
    filteredTasks = filteredTasks.filter(task => task.courseId === filterCourseId);
  }
  
  // Ordena as tarefas
  return [...filteredTasks].sort((a, b) => {
    if (sortedBy === 'dueDate') {
      // Se data de vencimento estiver presente, ordena por ela
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (a.dueDate) {
        return -1; // a tem data, b não tem
      } else if (b.dueDate) {
        return 1; // b tem data, a não tem
      }
      // Se nenhum tem data, cai para a data de criação
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    if (sortedBy === 'priority') {
      // Mapeia prioridade para valores numéricos para ordenação
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority as keyof typeof priorityMap] - priorityMap[a.priority as keyof typeof priorityMap];
    }
    
    // Por padrão, ordena por data de criação (mais recente primeiro)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const selectTasksStatus = (state: RootState) => state.tasks.status;
export const selectTasksError = (state: RootState) => state.tasks.error;

export default tasksSlice.reducer;