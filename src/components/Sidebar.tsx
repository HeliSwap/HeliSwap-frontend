import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GlobalContext } from '../providers/Global';

import Icon from './Icon';

const Sidebar = () => {
  const contextValue = useContext(GlobalContext);
  const { isRunning, lastUpdated } = contextValue;

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
        </div>

        <div>
          <div className="container-healthcheck d-flex align-items-center">
            <span className="me-3 d-none d-xxl-block text-micro">{lastUpdated}</span>
            <span className={`icon-healthcheck ${isRunning ? 'is-running' : ''}`}></span>
          </div>

          {/* <div className="d-flex align-items-center">
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
