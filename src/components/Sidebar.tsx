import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import Icon from './Icon';

const Sidebar = () => {
  const [menuOpened, setMenuOpened] = useState(false);

  const handleMoreButtonClick = () => {
    setMenuOpened(prev => !prev);
  };

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
          <NavLink
            className={({ isActive }) => (isActive ? 'link-menu is-active mt-4' : 'link-menu mt-4')}
            to="/farms"
          >
            <span className="icon-menu">
              <Icon color="gray" name="farms" />
            </span>
            <span className="ms-4 d-none d-xxxl-inline-block">Farms</span>
          </NavLink>
        </div>

        <div className="position-relative">
          <div
            className={`d-flex align-items-center link-menu cursor-pointer ${
              menuOpened ? 'is-active' : ''
            }`}
            onClick={handleMoreButtonClick}
          >
            <span className="icon-menu">
              <Icon color="gray" name="more" />
            </span>
            <span className="text-small d-none d-xxxl-inline-block ms-4">More</span>
          </div>

          {menuOpened ? (
            <div className="container-sidebar-menu">
              <p className="text-small text-gray mb-4">Resources</p>
              <ul>
                <li className="py-2">
                  <a
                    className="text-main link"
                    target="_blank"
                    rel="noreferrer"
                    href="https://docs.heliswap.io"
                  >
                    Docs
                  </a>
                </li>
                <li className="py-2">
                  <a
                    className="text-main link"
                    target="_blank"
                    rel="noreferrer"
                    href="https://heliswap.io/about"
                  >
                    About
                  </a>
                </li>
                <li className="py-2">
                  <a
                    className="text-main link"
                    target="_blank"
                    rel="noreferrer"
                    href="https://heliswap.io/terms"
                  >
                    Terms of Use
                  </a>
                </li>
              </ul>
              <hr />
              <ul>
                <li className="py-3">
                  <a
                    className="text-main link d-flex align-items-center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://twitter.com/HeliSwap_DEX"
                  >
                    <Icon name="twitter" />
                    <span className="ms-3">Twitter</span>
                  </a>
                </li>
                <li className="py-3">
                  <a
                    className="text-main link d-flex align-items-center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://t.me/heliswap"
                  >
                    <Icon name="telegram" />
                    <span className="ms-3">Telegram</span>
                  </a>
                </li>
                <li className="py-3">
                  <a
                    className="text-main link d-flex align-items-center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://github.com/LimeChain/HeliSwap-frontend"
                  >
                    <Icon name="github" />
                    <span className="ms-3">GitHub</span>
                  </a>
                </li>
                <li className="py-3">
                  <a
                    className="text-main link d-flex align-items-center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://discord.gg/wVrkMwBKsm"
                  >
                    <Icon name="discord" />
                    <span className="ms-3">Discord</span>
                  </a>
                </li>
                <li className="py-3">
                  <a
                    className="text-main link d-flex align-items-center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://medium.com/@heliswap"
                  >
                    <Icon name="medium" />
                    <span className="ms-3">Medium</span>
                  </a>
                </li>
                <li className="py-3">
                  <a
                    className="text-main link d-flex align-items-center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.youtube.com/channel/UCPYjXlmxIXYmKJ72ajplrfg"
                  >
                    <Icon name="youtube" />
                    <span className="ms-3">Youtube</span>
                  </a>
                </li>
              </ul>
            </div>
          ) : null}

          {/* <div className="d-flex align-items-center mt-4">
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
