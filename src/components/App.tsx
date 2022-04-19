import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import Styleguide from '../pages/Styleguide';

function App() {
  return (
    <BrowserRouter>
      <div className="container py-5 py-lg-7">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="styleguide" element={<Styleguide />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
