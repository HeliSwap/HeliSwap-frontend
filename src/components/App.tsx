import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GlobalProvider } from '../providers/Global';

import Home from '../pages/Home';
import Styleguide from '../pages/Styleguide';

import Header from './Header';
import Footer from './Footer';

function App() {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <div className="wrapper">
          <Header />
          <div className="main">
            <div className="container py-5 py-lg-7">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="styleguide" element={<Styleguide />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </div>
      </GlobalProvider>
    </BrowserRouter>
  );
}

export default App;
