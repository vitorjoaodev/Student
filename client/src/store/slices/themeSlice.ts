import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
  sidebarCollapsed: boolean;
}

// Verifica se há preferência salva no localStorage (se disponível)
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Se não houver tema salvo, use a preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  
  return 'light'; // Padrão
};

const getInitialAccentColor = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accentColor') || '#6C5CE7';
  }
  return '#6C5CE7'; // Cor padrão
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
  fontSize: 'medium',
  accentColor: getInitialAccentColor(),
  sidebarCollapsed: false
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
    
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accentColor', action.payload);
        // Atualiza a variável CSS para a cor de destaque
        document.documentElement.style.setProperty('--accent-color', action.payload);
      }
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarState: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    }
  }
});

// Export actions
export const { 
  setTheme, 
  setFontSize, 
  setAccentColor, 
  toggleSidebar, 
  setSidebarState 
} = themeSlice.actions;

// Selectors
export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectFontSize = (state: RootState) => state.theme.fontSize;
export const selectAccentColor = (state: RootState) => state.theme.accentColor;
export const selectSidebarState = (state: RootState) => state.theme.sidebarCollapsed;

export default themeSlice.reducer;