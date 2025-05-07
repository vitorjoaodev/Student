import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'task' | 'pomodoro' | 'goal' | 'system';
  actionLink?: string;
}

interface NotificationsState {
  items: Notification[];
  permission: 'default' | 'granted' | 'denied';
  enabled: boolean;
}

const initialState: NotificationsState = {
  items: [],
  permission: 'default',
  enabled: false,
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const id = Date.now().toString();
      state.items.push({
        ...action.payload,
        id,
        timestamp: Date.now(),
        read: false,
      });
      
      // Keep only the latest 50 notifications
      if (state.items.length > 50) {
        state.items = state.items.slice(-50);
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(notification => {
        notification.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
    setPermission: (state, action: PayloadAction<'default' | 'granted' | 'denied'>) => {
      state.permission = action.payload;
    },
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setPermission,
  setEnabled,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;