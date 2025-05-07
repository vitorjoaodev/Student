import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  color: string;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) return savedTheme;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'dark'; // Default to dark mode
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
  color: '#6C5CE7', // Primary color
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
    setPrimaryColor(state, action: PayloadAction<string>) {
      state.color = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('primaryColor', action.payload);
      }
    },
  },
});

export const { setThemeMode, setPrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;