import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from './Icon';
import Navigation from './Navigation';

const Sidebar = () => {
  const sidebarMenuRef: MutableRefObject<null | HTMLDivElement> = useRef(null);

  const [menuOpened, setMenuOpened] = useState(false);

  const handleMoreButtonClick = () => {
    setMenuOpened(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (!sidebarMenuRef.current?.contains(event.target as HTMLDivElement)) {
        setMenuOpened(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <Navigation />

        <div className="position-relative" ref={sidebarMenuRef}>
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
