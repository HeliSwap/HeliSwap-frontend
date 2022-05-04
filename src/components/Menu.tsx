import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <Link className="link-menu" to="/">
        Swap
      </Link>
      <Link className="link-menu" to="/provide">
        Add Liquidity
      </Link>
      <Link className="link-menu" to="/pairs">
        Pairs
      </Link>
    </div>
  );
};

export default Menu;
