import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import TagManager from 'react-gtm-module';

import Sunset from './components/Sunset';
import App from './components/App';

import 'tippy.js/dist/tippy.css';
import './styles/styles.scss';

const tagManagerArgs = {
  gtmId: 'GTM-PTWJC2Z',
};

TagManager.initialize(tagManagerArgs);

// Component to conditionally render App or Sunset based on route
const AppRouter = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Routes where App should be shown: farms, farms/:campaignAddress, and pools
  const isAppRoute =
    pathname === '/farms' || pathname === '/pools' || pathname.startsWith('/farms/');

  if (isAppRoute) {
    return <App />;
  }

  // Default: show Sunset component
  return <Sunset />;
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AppRouter />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
