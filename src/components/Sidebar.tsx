import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import Icon from './Icon';

const Sidebar = () => {
  // const isLocalDev = process.env.REACT_APP_LOCAL_DEV === 'true';

  return (
    <div className="container-sidebar">
      <div className="container-logo">
        <Link to="/">
          <img src="/logo-full.svg" alt="" />
        </Link>
      </div>

      <div className="container-menu">
        <div className="d-flex flex-column">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'link-menu is-active' : 'link-menu')}
          >
            <span className="icon-menu me-4">
              <Icon color="gray" name="swap" />
            </span>
            <span>Swap</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'link-menu is-active mt-4' : 'link-menu mt-4')}
            to="/my-pools"
          >
            <span className="icon-menu me-4">
              <Icon color="gray" name="pools" />
            </span>
            <span>Pools</span>
          </NavLink>
          {/* <Link className="link-menu" to="/my-pools">
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
          ) : null} */}
        </div>

        <div>
          <div className="d-flex align-items-center">
            <Icon color="gray" name="more" className="me-4" />
            <span className="text-small text-secondary">More</span>
          </div>

          <div className="d-flex align-items-center mt-4">
            <Icon color="gray" name="speach-bubble" className="me-4" />
            <span className="text-small text-secondary">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
