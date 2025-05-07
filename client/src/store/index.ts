import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import pomodoroReducer from './slices/pomodoroSlice';
import themeReducer from './slices/themeSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    pomodoro: pomodoroReducer,
    theme: themeReducer,
    notifications: notificationsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;