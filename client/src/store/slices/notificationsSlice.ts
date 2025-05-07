import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Interface para uma notificação
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  isRead: boolean;
  createdAt: Date;
}

// Estado das notificações
interface NotificationsState {
  notifications: Notification[];
  enabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
}

// Estado inicial
const initialState: NotificationsState = {
  notifications: [],
  enabled: true,
  pushEnabled: false,
  soundEnabled: true
};

// Gera um ID único para cada notificação
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Adicionar uma nova notificação
    addNotification: {
      reducer: (state, action: PayloadAction<Notification>) => {
        state.notifications.unshift(action.payload);
        
        // Limita a quantidade de notificações armazenadas (máximo 50)
        if (state.notifications.length > 50) {
          state.notifications = state.notifications.slice(0, 50);
        }
      },
      prepare: ({ type, title, message, duration }: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
        return {
          payload: {
            id: generateId(),
            type,
            title,
            message,
            duration: duration || 5000, // Padrão de 5 segundos
            isRead: false,
            createdAt: new Date()
          }
        };
      }
    },
    
    // Marcar uma notificação como lida
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    
    // Marcar todas as notificações como lidas
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
    },
    
    // Remover uma notificação por ID
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    // Limpar todas as notificações
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Ativar/Desativar notificações
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
    
    // Ativar/Desativar notificações push
    setPushNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.pushEnabled = action.payload;
    },
    
    // Ativar/Desativar sons de notificação
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    }
  }
});

// Export actions
export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setNotificationsEnabled,
  setPushNotificationsEnabled,
  setSoundEnabled
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadNotifications = (state: RootState) => 
  state.notifications.notifications.filter(n => !n.isRead);
export const selectNotificationsEnabled = (state: RootState) => state.notifications.enabled;
export const selectPushNotificationsEnabled = (state: RootState) => state.notifications.pushEnabled;
export const selectSoundEnabled = (state: RootState) => state.notifications.soundEnabled;

export default notificationsSlice.reducer;