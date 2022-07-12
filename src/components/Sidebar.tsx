import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import Icon from './Icon';

const Sidebar = () => {
  // const isLocalDev = process.env.REACT_APP_LOCAL_DEV === 'true';

  return (
    <div className="container-sidebar">
      <div className="container-logo">
        <Link className="d-none d-xxxl-inline-block" to="/">
          <img src="/logo-full.svg" alt="" />
        </Link>
        <Link className="d-xxxl-none" to="/">
          <img src="/logo.svg" alt="" />
        </Link>
      </div>

      <div className="container-menu">
        <div className="d-flex flex-column">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'link-menu is-active' : 'link-menu')}
          >
            <span className="icon-menu">
              <Icon color="gray" name="swap" />
            </span>
            <span className="ms-4 d-none d-xxxl-inline-block">Swap</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'link-menu is-active mt-4' : 'link-menu mt-4')}
            to="/pools"
          >
            <span className="icon-menu">
              <Icon color="gray" name="pools" />
            </span>
            <span className="ms-4 d-none d-xxxl-inline-block">Pools</span>
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
            <span className="icon-menu">
              <Icon color="gray" name="more" />
            </span>
            <span className="text-small text-secondary d-none d-xxxl-inline-block ms-4">More</span>
          </div>

          <div className="d-flex align-items-center mt-4">
            <span className="icon-menu">
              <Icon color="gray" name="speach-bubble" />
            </span>
            <span className="text-small text-secondary d-none d-xxxl-inline-block ms-4">
              Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
