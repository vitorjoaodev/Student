import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '../../lib/queryClient';
import { PomodoroSession, InsertPomodoroSession } from '../../../../shared/schema';

interface PomodoroState {
  sessions: PomodoroSession[];
  currentSession: {
    isActive: boolean;
    startTime: number | null;
    timeRemaining: number;
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    taskId: number | null;
  };
  settings: {
    pomodoroMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
  };
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PomodoroState = {
  sessions: [],
  currentSession: {
    isActive: false,
    startTime: null,
    timeRemaining: 25 * 60, // 25 minutes in seconds
    mode: 'pomodoro',
    taskId: null,
  },
  settings: {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
  },
  loading: 'idle',
  error: null,
};

export const fetchSessions = createAsyncThunk(
  'pomodoro/fetchSessions',
  async () => {
    const response = await apiRequest<PomodoroSession[]>('GET', '/api/pomodoro/sessions');
    return response;
  }
);

export const createSession = createAsyncThunk(
  'pomodoro/createSession',
  async (session: InsertPomodoroSession) => {
    const response = await apiRequest<PomodoroSession>('POST', '/api/pomodoro/sessions', session);
    return response;
  }
);

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    startTimer(state, action: PayloadAction<{ taskId?: number | null }>) {
      state.currentSession.isActive = true;
      state.currentSession.startTime = Date.now();
      state.currentSession.taskId = action.payload.taskId || null;
    },
    pauseTimer(state) {
      state.currentSession.isActive = false;
    },
    resetTimer(state) {
      state.currentSession.isActive = false;
      state.currentSession.timeRemaining = state.settings.pomodoroMinutes * 60;
      state.currentSession.mode = 'pomodoro';
    },
    tick(state, action: PayloadAction<number>) {
      if (state.currentSession.isActive) {
        state.currentSession.timeRemaining = Math.max(0, state.currentSession.timeRemaining - action.payload);
      }
    },
    switchMode(state, action: PayloadAction<'pomodoro' | 'shortBreak' | 'longBreak'>) {
      state.currentSession.mode = action.payload;
      
      switch (action.payload) {
        case 'pomodoro':
          state.currentSession.timeRemaining = state.settings.pomodoroMinutes * 60;
          break;
        case 'shortBreak':
          state.currentSession.timeRemaining = state.settings.shortBreakMinutes * 60;
          break;
        case 'longBreak':
          state.currentSession.timeRemaining = state.settings.longBreakMinutes * 60;
          break;
      }
    },
    updateSettings(state, action: PayloadAction<Partial<PomodoroState['settings']>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
      });
  },
});

export const { 
  startTimer, 
  pauseTimer, 
  resetTimer, 
  tick, 
  switchMode, 
  updateSettings 
} = pomodoroSlice.actions;

export default pomodoroSlice.reducer;