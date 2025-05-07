import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define os temas disponíveis na aplicação
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'purple' | 'green' | 'blue' | 'red';

interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  reducedMotion: boolean;
}

// Carrega configurações salvas no localStorage
const getInitialState = (): ThemeState => {
  if (typeof window === 'undefined') {
    return {
      mode: 'system',
      colorScheme: 'default',
      fontSize: 'medium',
      animationsEnabled: true,
      reducedMotion: false
    };
  }

  try {
    const savedTheme = localStorage.getItem('theme-settings');
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
  } catch (error) {
    console.error('Erro ao carregar tema do localStorage:', error);
  }

  return {
    mode: 'system',
    colorScheme: 'default',
    fontSize: 'medium',
    animationsEnabled: true,
    reducedMotion: false
  };
};

const initialState: ThemeState = getInitialState();

// Slice para gerenciamento do tema
export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      saveThemeSettings({ ...state, mode: action.payload });
    },
    setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      state.colorScheme = action.payload;
      saveThemeSettings({ ...state, colorScheme: action.payload });
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
      saveThemeSettings({ ...state, fontSize: action.payload });
    },
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
      saveThemeSettings({ ...state, animationsEnabled: !state.animationsEnabled });
    },
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion;
      saveThemeSettings({ ...state, reducedMotion: !state.reducedMotion });
    }
  }
});

// Função auxiliar para salvar configurações no localStorage
const saveThemeSettings = (settings: ThemeState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('theme-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar tema no localStorage:', error);
    }
  }
};

// Exportando ações
export const {
  setThemeMode,
  setColorScheme,
  setFontSize,
  toggleAnimations,
  toggleReducedMotion
} = themeSlice.actions;

// Seletores
export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectColorScheme = (state: RootState) => state.theme.colorScheme;
export const selectFontSize = (state: RootState) => state.theme.fontSize;
export const selectAnimationsEnabled = (state: RootState) => state.theme.animationsEnabled;
export const selectReducedMotion = (state: RootState) => state.theme.reducedMotion;

// Seletor para verificar se o modo escuro está ativo
export const selectIsDarkMode = (state: RootState) => {
  const { mode } = state.theme;
  
  if (mode === 'system') {
    // Verifica a preferência do sistema
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }
  
  return mode === 'dark';
};

export default themeSlice.reducer;