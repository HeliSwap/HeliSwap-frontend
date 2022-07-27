import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import { GlobalProvider } from '../providers/Global';
import { getApolloClient } from '../utils/apolloUtils';

import Swap from '../pages/Swap';
import Create from '../pages/Create';
import Pools from '../pages/Pools';
import Tokens from '../pages/Tokens';
import Styleguide from '../pages/Styleguide';

import Header from './Header';
import Sidebar from './Sidebar';

function App() {
  const apolloClient = getApolloClient();

  return (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <GlobalProvider>
          <div className="d-flex">
            <Sidebar />
            <div className="wrapper flex-1">
              <div className="main">
                <Header />
                <div className="container py-5 py-lg-7">
                  <Routes>
                    <Route path="/" element={<Swap />} />
                    <Route path="/:address" element={<Swap />} />
                    <Route path="create/" element={<Create />} />
                    <Route path="create/:address" element={<Create />} />
                    <Route path="pools" element={<Pools />} />
                    <Route path="tokens" element={<Tokens />} />
                    <Route path="styleguide" element={<Styleguide />} />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        </GlobalProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
