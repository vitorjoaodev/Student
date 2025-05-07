import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PomodoroSession, InsertPomodoroSession } from '../../../shared/schema';
import { apiRequest } from '../../lib/queryClient';
import { queryClient } from '../../lib/queryClient';
import { RootState } from '../index';

// Interface para o estado do pomodoro
interface PomodoroState {
  // Configurações
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  
  // Estado atual
  isActive: boolean;
  isPaused: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  timeRemaining: number; // em segundos
  completedPomodoros: number;
  currentTaskId: number | null;
  
  // Sessões armazenadas
  sessions: PomodoroSession[];
  sessionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Estado inicial
const initialState: PomodoroState = {
  // Configurações padrão
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  
  // Estado inicial
  isActive: false,
  isPaused: false,
  mode: 'pomodoro',
  timeRemaining: 25 * 60, // 25 minutos em segundos
  completedPomodoros: 0,
  currentTaskId: null,
  
  // Sessões
  sessions: [],
  sessionsStatus: 'idle',
  error: null
};

// Thunks - Ações assíncronas
export const fetchSessions = createAsyncThunk<PomodoroSession[]>(
  'pomodoro/fetchSessions',
  async () => {
    return await apiRequest('/api/pomodoro/sessions');
  }
);

export const createSession = createAsyncThunk<PomodoroSession, InsertPomodoroSession>(
  'pomodoro/createSession',
  async (session) => {
    return await apiRequest('/api/pomodoro/sessions', { method: 'POST', body: session });
  }
);

export const updateSession = createAsyncThunk(
  'pomodoro/updateSession',
  async ({ id, data }: { id: number; data: Partial<InsertPomodoroSession> }) => {
    return await apiRequest(`/api/pomodoro/sessions/${id}`, { method: 'PATCH', body: data });
  }
);

// Slice
export const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    // Configurações
    updateSettings: (state, action: PayloadAction<{
      pomodoroMinutes?: number;
      shortBreakMinutes?: number;
      longBreakMinutes?: number;
      longBreakInterval?: number;
    }>) => {
      const { pomodoroMinutes, shortBreakMinutes, longBreakMinutes, longBreakInterval } = action.payload;
      
      if (pomodoroMinutes !== undefined) state.pomodoroMinutes = pomodoroMinutes;
      if (shortBreakMinutes !== undefined) state.shortBreakMinutes = shortBreakMinutes;
      if (longBreakMinutes !== undefined) state.longBreakMinutes = longBreakMinutes;
      if (longBreakInterval !== undefined) state.longBreakInterval = longBreakInterval;
      
      // Atualiza o tempo restante se estiver no modo correspondente e não estiver ativo
      if (!state.isActive) {
        if (pomodoroMinutes !== undefined && state.mode === 'pomodoro') {
          state.timeRemaining = pomodoroMinutes * 60;
        } else if (shortBreakMinutes !== undefined && state.mode === 'shortBreak') {
          state.timeRemaining = shortBreakMinutes * 60;
        } else if (longBreakMinutes !== undefined && state.mode === 'longBreak') {
          state.timeRemaining = longBreakMinutes * 60;
        }
      }
    },
    
    // Controles do timer
    startTimer: (state, action: PayloadAction<{ taskId?: number | null }>) => {
      state.isActive = true;
      state.isPaused = false;
      if (action.payload.taskId !== undefined) {
        state.currentTaskId = action.payload.taskId;
      }
    },
    
    pauseTimer: (state) => {
      state.isPaused = true;
    },
    
    resumeTimer: (state) => {
      state.isPaused = false;
    },
    
    stopTimer: (state) => {
      state.isActive = false;
      state.isPaused = false;
      
      // Reseta o tempo para o valor inicial baseado no modo atual
      if (state.mode === 'pomodoro') {
        state.timeRemaining = state.pomodoroMinutes * 60;
      } else if (state.mode === 'shortBreak') {
        state.timeRemaining = state.shortBreakMinutes * 60;
      } else {
        state.timeRemaining = state.longBreakMinutes * 60;
      }
    },
    
    // Atualização de tempo
    tick: (state) => {
      if (state.isActive && !state.isPaused && state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    
    // Mudança de modo
    setMode: (state, action: PayloadAction<'pomodoro' | 'shortBreak' | 'longBreak'>) => {
      state.mode = action.payload;
      state.isActive = false;
      state.isPaused = false;
      
      // Atualiza o tempo restante de acordo com o novo modo
      if (action.payload === 'pomodoro') {
        state.timeRemaining = state.pomodoroMinutes * 60;
      } else if (action.payload === 'shortBreak') {
        state.timeRemaining = state.shortBreakMinutes * 60;
      } else {
        state.timeRemaining = state.longBreakMinutes * 60;
      }
    },
    
    // Completar um pomodoro
    completePomodoro: (state) => {
      state.completedPomodoros += 1;
      state.isActive = false;
      
      // Determina o próximo modo
      if (state.completedPomodoros % state.longBreakInterval === 0) {
        state.mode = 'longBreak';
        state.timeRemaining = state.longBreakMinutes * 60;
      } else {
        state.mode = 'shortBreak';
        state.timeRemaining = state.shortBreakMinutes * 60;
      }
    },
    
    // Reset do contador
    resetCompletedPomodoros: (state) => {
      state.completedPomodoros = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.sessionsStatus = 'loading';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessionsStatus = 'succeeded';
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.sessionsStatus = 'failed';
        state.error = action.error.message || 'Erro ao buscar sessões de pomodoro';
      })
      
      // Create session
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        queryClient.invalidateQueries({ queryKey: ['/api/pomodoro/sessions'] });
      })
      
      // Update session
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(session => session.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        queryClient.invalidateQueries({ queryKey: ['/api/pomodoro/sessions'] });
      });
  }
});

// Export actions
export const {
  updateSettings,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  tick,
  setMode,
  completePomodoro,
  resetCompletedPomodoros
} = pomodoroSlice.actions;

// Selectors
export const selectPomodoroSettings = (state: RootState) => ({
  pomodoroMinutes: state.pomodoro.pomodoroMinutes,
  shortBreakMinutes: state.pomodoro.shortBreakMinutes,
  longBreakMinutes: state.pomodoro.longBreakMinutes,
  longBreakInterval: state.pomodoro.longBreakInterval,
});

export const selectPomodoroStatus = (state: RootState) => ({
  isActive: state.pomodoro.isActive,
  isPaused: state.pomodoro.isPaused,
  mode: state.pomodoro.mode,
  timeRemaining: state.pomodoro.timeRemaining,
  completedPomodoros: state.pomodoro.completedPomodoros,
  currentTaskId: state.pomodoro.currentTaskId,
});

export const selectPomodoroSessions = (state: RootState) => state.pomodoro.sessions;
export const selectPomodoroSessionsStatus = (state: RootState) => state.pomodoro.sessionsStatus;

export default pomodoroSlice.reducer;