import React from 'react';
import { Link } from 'react-router-dom';

const MobileWarning = () => {
  return (
    <div className="py-4">
      <div className="container">
        <Link to="/">
          <img src="/logo-full.svg" alt="" />
        </Link>
        <h1 className="text-subheader text-bold mt-5">Mobile version coming soon…</h1>
        <p className="alert alert-warning text-main text-warning mt-4 p-3">
          Please connect from desktop computer.
        </p>
      </div>
    </div>
  );
};

export default MobileWarning;
