import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import { GlobalProvider } from '../providers/Global';
import { getApolloClient } from '../utils/apolloUtils';

import Swap from '../pages/Swap';
import Create from '../pages/Create';
import Pools from '../pages/Pools';
import Farms from '../pages/Farms';
import Tokens from '../pages/Tokens';
import Styleguide from '../pages/Styleguide';
import FarmDetails from '../pages/FarmDetails';
import Analytics from '../pages/Analytics';
import AnalyticsPoolDetials from '../pages/AnalyticsPoolDetials';
import Lockdrop from '../pages/Lockdrop';
import C14 from '../pages/C14';

import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

function App() {
  const apolloClient = getApolloClient();

  return (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <GlobalProvider>
          <div className="d-md-flex">
            <Sidebar />
            <div className="wrapper flex-1">
              <div className="main">
                <div className="flex-1">
                  <Header />
                  <div className="container py-4 py-lg-7">
                    <Routes>
                      <Route path="/" element={<Swap />} />
                      <Route path="/:token0/:token1" element={<Swap />} />
                      <Route path="create/" element={<Create />} />
                      <Route path="create/:token0/:token1" element={<Create />} />
                      <Route path="pools" element={<Pools itemsPerPage={10} />} />
                      <Route path="farms" element={<Farms itemsPerPage={10} />} />
                      <Route path="farms/:campaignAddress" element={<FarmDetails />} />
                      <Route path="tokens" element={<Tokens />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="lockdrop" element={<Lockdrop />} />
                      <Route
                        path="analytics/pool/:poolAddress"
                        element={<AnalyticsPoolDetials />}
                      />
                      <Route path="/buy-crypto" element={<C14 />} />
                      <Route path="styleguide" element={<Styleguide />} />
                    </Routes>
                  </div>
                </div>
                <Footer />
              </div>
            </div>
          </div>
        </GlobalProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
