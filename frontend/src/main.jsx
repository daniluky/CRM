import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

const root = createRoot(document.getElementById('root'));

const RouterComponent = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

root.render(
  <React.StrictMode>
    <RouterComponent>
      <App />
    </RouterComponent>
  </React.StrictMode>
);
