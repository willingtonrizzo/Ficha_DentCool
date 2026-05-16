import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles.css';
import { initPersistence } from './persistence';

async function bootstrap() {
  await initPersistence();
  const { default: App } = await import('./root');

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

void bootstrap();
