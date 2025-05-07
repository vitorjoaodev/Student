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
  // Middleware para lidar com serialização de datas em Redux
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora ações específicas onde datas são usadas
        ignoredActions: ['tasks/addTask', 'tasks/updateTask', 'pomodoro/startSession', 'pomodoro/endSession'],
        // Ignora caminhos específicos no estado onde datas são armazenadas
        ignoredPaths: ['tasks.items.dueDate', 'tasks.items.createdAt', 'pomodoro.sessions.startTime', 'pomodoro.sessions.endTime'],
      },
    }),
});

// Tipos de inferência para o estado global e despacho
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;