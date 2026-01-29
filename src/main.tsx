import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './context/ThemeContext'

const Root = () => {
  const { theme } = useTheme();
  return (
    <Theme appearance={theme} accentColor="indigo" grayColor="slate" radius="large">
      <App />
    </Theme>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </StrictMode>,
)
