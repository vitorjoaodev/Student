import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PomodoroSession, InsertPomodoroSession } from '../../../shared/schema';
import { apiRequest } from '../../lib/queryClient';
import { queryClient } from '../../lib/queryClient';
import { RootState } from '../index';

interface PomodoroState {
  sessions: PomodoroSession[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentSession: {
    isActive: boolean;
    startTime: Date | null;
    taskId: number | null;
    duration: number;
    timeLeft: number;
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    pomodoroCount: number;
  };
  settings: {
    pomodoroMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    notifications: boolean;
  };
}

const initialState: PomodoroState = {
  sessions: [],
  status: 'idle',
  error: null,
  currentSession: {
    isActive: false,
    startTime: null,
    taskId: null,
    duration: 25 * 60, // 25 minutos em segundos
    timeLeft: 25 * 60,
    mode: 'pomodoro',
    pomodoroCount: 0
  },
  settings: {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true
  }
};

// Thunks - Ações assíncronas
export const fetchSessions = createAsyncThunk<PomodoroSession[]>(
  'pomodoro/fetchSessions',
  async () => {
    return await apiRequest('/api/pomodoro/sessions');
  }
);

export const startSession = createAsyncThunk<PomodoroSession, { taskId: number | null }>(
  'pomodoro/startSession',
  async ({ taskId }) => {
    const session: InsertPomodoroSession = {
      taskId,
      startTime: new Date(),
      endTime: null,
      duration: 0
    };
    return await apiRequest('/api/pomodoro/sessions', { method: 'POST', body: session });
  }
);

export const endSession = createAsyncThunk(
  'pomodoro/endSession',
  async ({ id, duration }: { id: number; duration: number }) => {
    const updateData = {
      endTime: new Date(),
      duration
    };
    return await apiRequest(`/api/pomodoro/sessions/${id}`, { method: 'PATCH', body: updateData });
  }
);

export const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    setIsActive: (state, action: PayloadAction<boolean>) => {
      state.currentSession.isActive = action.payload;
      if (action.payload) {
        state.currentSession.startTime = new Date();
      }
    },
    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.currentSession.timeLeft = action.payload;
    },
    setMode: (state, action: PayloadAction<'pomodoro' | 'shortBreak' | 'longBreak'>) => {
      state.currentSession.mode = action.payload;
      
      // Atualiza duração e tempo restante com base no modo
      if (action.payload === 'pomodoro') {
        state.currentSession.duration = state.settings.pomodoroMinutes * 60;
        state.currentSession.timeLeft = state.settings.pomodoroMinutes * 60;
      } else if (action.payload === 'shortBreak') {
        state.currentSession.duration = state.settings.shortBreakMinutes * 60;
        state.currentSession.timeLeft = state.settings.shortBreakMinutes * 60;
      } else {
        state.currentSession.duration = state.settings.longBreakMinutes * 60;
        state.currentSession.timeLeft = state.settings.longBreakMinutes * 60;
      }
    },
    incrementPomodoroCount: (state) => {
      state.currentSession.pomodoroCount += 1;
    },
    resetPomodoroCount: (state) => {
      state.currentSession.pomodoroCount = 0;
    },
    updateSettings: (state, action: PayloadAction<Partial<PomodoroState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
      
      // Atualiza duração e tempo restante se o timer não estiver ativo
      if (!state.currentSession.isActive) {
        if (state.currentSession.mode === 'pomodoro') {
          state.currentSession.duration = state.settings.pomodoroMinutes * 60;
          state.currentSession.timeLeft = state.settings.pomodoroMinutes * 60;
        } else if (state.currentSession.mode === 'shortBreak') {
          state.currentSession.duration = state.settings.shortBreakMinutes * 60;
          state.currentSession.timeLeft = state.settings.shortBreakMinutes * 60;
        } else {
          state.currentSession.duration = state.settings.longBreakMinutes * 60;
          state.currentSession.timeLeft = state.settings.longBreakMinutes * 60;
        }
      }
    },
    setTaskId: (state, action: PayloadAction<number | null>) => {
      state.currentSession.taskId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Caso de fetchSessions
      .addCase(fetchSessions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro desconhecido ao buscar sessões';
      })
      
      // Caso de startSession
      .addCase(startSession.fulfilled, (state, action) => {
        // Adiciona a nova sessão à lista
        state.sessions.push(action.payload);
        queryClient.invalidateQueries({ queryKey: ['/api/pomodoro/sessions'] });
      })
      
      // Caso de endSession
      .addCase(endSession.fulfilled, (state, action) => {
        // Atualiza a sessão encerrada na lista
        const index = state.sessions.findIndex(session => session.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        queryClient.invalidateQueries({ queryKey: ['/api/pomodoro/sessions'] });
      });
  }
});

// Exportando ações
export const {
  setIsActive,
  setTimeLeft,
  setMode,
  incrementPomodoroCount,
  resetPomodoroCount,
  updateSettings,
  setTaskId
} = pomodoroSlice.actions;

// Seletores
export const selectCurrentSession = (state: RootState) => state.pomodoro.currentSession;
export const selectPomodoroSettings = (state: RootState) => state.pomodoro.settings;
export const selectAllSessions = (state: RootState) => state.pomodoro.sessions;
export const selectPomodoroStatus = (state: RootState) => state.pomodoro.status;

// Seletor para sessões agrupadas por dia
export const selectSessionsByDay = (state: RootState) => {
  const sessions = state.pomodoro.sessions;
  
  // Agrupa sessões por dia
  return sessions.reduce<Record<string, PomodoroSession[]>>((acc, session) => {
    const date = new Date(session.startTime);
    const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    
    acc[dateString].push(session);
    return acc;
  }, {});
};

// Seletor para total de tempo por dia
export const selectTotalTimeByDay = (state: RootState) => {
  const sessionsByDay = selectSessionsByDay(state);
  
  // Calcula tempo total por dia
  return Object.entries(sessionsByDay).reduce<Record<string, number>>((acc, [date, sessions]) => {
    acc[date] = sessions.reduce((total, session) => total + (session.duration || 0), 0);
    return acc;
  }, {});
};

export default pomodoroSlice.reducer;