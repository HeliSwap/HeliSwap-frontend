import React from 'react';
import { Link } from 'react-router-dom';

const GlobalMessage = () => {
  return (
    <div className="container-global-message">
      <p className="text-main text-center">
        We are launching the $HELI token through a community focused Lockdrop approach that rewards
        our early supporters.{' '}
        <Link className="link-white" to="lockdrop">
          <span className="text-bold">Read More</span>
        </Link>
      </p>
    </div>
  );
};

export default GlobalMessage;
