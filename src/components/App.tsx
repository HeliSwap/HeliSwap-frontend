import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import { GlobalProvider } from '../providers/Global';
import { getApolloClient } from '../utils/apolloUtils';

import Swap from '../pages/Swap';
import Create from '../pages/Create';
import MyPools from '../pages/MyPools';
import Pairs from '../pages/Pairs';
import PairDetails from '../pages/PairDetails';
import Tokens from '../pages/Tokens';
import Helpers from '../pages/Helpers';
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
                  <Route path="my-pools" element={<MyPools />} />
                  <Route path="pairs" element={<Pairs />} />
                  <Route path="pairs/:address" element={<PairDetails />} />
                  <Route path="tokens" element={<Tokens />} />
                  <Route path="styleguide" element={<Styleguide />} />
                  <Route path="helpers" element={<Helpers />} />
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
