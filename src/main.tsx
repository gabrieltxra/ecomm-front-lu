import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAnalyticsFromStoredConsent } from './lib/analytics.ts';

initializeAnalyticsFromStoredConsent();

createRoot(document.getElementById("root")!).render(
    <App />
);
