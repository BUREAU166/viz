import React from 'react';

import { App } from './App';
import { createRoot } from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


const container = document.querySelector('#app');
const root = createRoot(container);

root.render(<App />);
