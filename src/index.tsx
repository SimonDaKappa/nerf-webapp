import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Note ! to assert that document.getElementById('root') is not null
const root = ReactDOM.createRoot(document.getElementById('root')!); 
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

