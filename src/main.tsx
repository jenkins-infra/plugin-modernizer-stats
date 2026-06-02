import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@jenkinsci/jenkins-io-components';
import App from './App.tsx';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#15171a',
      paper: '#1e2329',
    },
    primary: { main: '#3b82f6' },
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    secondary: { main: '#a855f7' },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily:
      'system-ui, "Segoe UI", roboto, "Noto Sans", oxygen, ubuntu, cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", arial, sans-serif',
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
