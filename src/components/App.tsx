import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import { GlobalProvider } from '../providers/Global';
import { getApolloClient } from '../utils/apolloUtils';

import Swap from '../pages/Swap';
import Create from '../pages/Create';
import Pairs from '../pages/Pairs';
import PairDetails from '../pages/PairDetails';
import Tokens from '../pages/Tokens';
import Styleguide from '../pages/Styleguide';

import Header from './Header';
import Footer from './Footer';

function App() {
  const apolloClient = getApolloClient();

  return (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <GlobalProvider>
          <div className="wrapper">
            <Header />
            <div className="main">
              <div className="container py-5 py-lg-7">
                <Routes>
                  <Route path="/" element={<Swap />} />
                  <Route path="create" element={<Create />} />
                  <Route path="pairs" element={<Pairs />} />
                  <Route path="pairs/:address" element={<PairDetails />} />
                  <Route path="tokens" element={<Tokens />} />
                  <Route path="styleguide" element={<Styleguide />} />
                </Routes>
              </div>
            </div>
            <Footer />
          </div>
        </GlobalProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
