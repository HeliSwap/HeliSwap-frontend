import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  const isLocalDev = process.env.REACT_APP_LOCAL_DEV === 'true';

  return (
    <div className="d-flex justify-content-between align-items-center">
      <Link className="link-menu" to="/">
        Swap
      </Link>
      <Link className="link-menu" to="/create">
        Create
      </Link>
      <Link className="link-menu" to="/my-pools">
        My pools
      </Link>
      <Link className="link-menu" to="/pairs">
        Pairs
      </Link>
      <Link className="link-menu" to="/tokens">
        Tokens
      </Link>
      {isLocalDev ? (
        <Link className="link-menu" to="/helpers">
          Helpers
        </Link>
      ) : null}
    </div>
  );
};

export default Menu;
