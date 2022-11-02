import React from 'react';
import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';

import App from './components/App';

import 'tippy.js/dist/tippy.css';
import './styles/styles.scss';

const tagManagerArgs = {
  gtmId: 'GTM-PTWJC2Z',
};

TagManager.initialize(tagManagerArgs);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
