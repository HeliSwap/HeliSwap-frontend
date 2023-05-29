import React from 'react';
import { Link } from 'react-router-dom';

const GlobalMessage = () => {
  return (
    <div className="container-global-message">
      <p className="text-main text-center">
        POOL MIGRATION IN PROCESS: PLEASE READ{' '}
        <Link className="link-white" to="lockdrop">
          <span className="text-bold">THESE INSTRUCTIONS</span>
        </Link>
      </p>
    </div>
  );
};

export default GlobalMessage;
