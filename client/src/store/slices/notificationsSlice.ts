import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isRead: boolean;
  actions?: {
    label: string;
    action: string;
    url?: string;
  }[];
}

interface NotificationsState {
  items: Notification[];
  settings: {
    enabled: boolean;
    soundEnabled: boolean;
    desktopNotificationsEnabled: boolean;
    taskReminders: boolean;
    pomodoroNotifications: boolean;
    goalReminders: boolean;
  };
}

const initialState: NotificationsState = {
  items: [],
  settings: {
    enabled: true,
    soundEnabled: true,
    desktopNotificationsEnabled: true,
    taskReminders: true,
    pomodoroNotifications: true,
    goalReminders: true
  }
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'isRead'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        isRead: false
      };
      
      state.items.push(newNotification);
      
      // Limita a quantidade de notificações armazenadas (mantém apenas as 50 mais recentes)
      if (state.items.length > 50) {
        state.items = state.items.slice(-50);
      }
      
      // Se as notificações de desktop estiverem habilitadas e o navegador suportar, mostra a notificação
      if (state.settings.desktopNotificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'granted') {
            // Mostra notificação ao usuário
            const desktopNotification = new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/icons/icon-192x192.png'
            });
            
            // Reproduz som se habilitado
            if (state.settings.soundEnabled) {
              const audio = new Audio('/sounds/notification.mp3');
              audio.play().catch(e => console.error('Erro ao reproduzir som:', e));
            }
          }
        } catch (error) {
          console.error('Erro ao mostrar notificação:', error);
        }
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(notification => {
        notification.isRead = true;
      });
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationsState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    }
  }
});

// Exportando ações
export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  updateNotificationSettings
} = notificationsSlice.actions;

// Seletores
export const selectAllNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadNotifications = (state: RootState) => 
  state.notifications.items.filter(notification => !notification.isRead);
export const selectNotificationSettings = (state: RootState) => state.notifications.settings;
export const selectHasUnreadNotifications = (state: RootState) => 
  state.notifications.items.some(notification => !notification.isRead);

export default notificationsSlice.reducer;