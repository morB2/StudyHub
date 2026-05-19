// client/src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // שינוי ל-jsx
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';

// יצירת ה-Root ללא סימן הקריאה של TypeScript שעשה שגיאה
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);