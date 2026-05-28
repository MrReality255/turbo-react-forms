import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import DemoApp from './DemoApp.tsx';

createRoot(document.getElementById('root')!).render(
    <React.Fragment>
        <DemoApp />
    </React.Fragment>
);
