import React, { useContext } from 'react';
import Tippy from '@tippyjs/react';
import { GlobalContext } from '../providers/Global';

const Footer = () => {
  const contextValue = useContext(GlobalContext);
  const { isRunning, lastUpdated } = contextValue;

  return (
    <div className="d-none d-md-flex justify-content-end pe-4 mb-4">
      <Tippy content="The time at which the application was updated. Prices are updated up to this timestamp.">
        <div className="d-flex align-items-center">
          <span className="me-3 text-micro">{lastUpdated}</span>
          <span className={`icon-healthcheck ${isRunning ? 'is-running' : ''}`}></span>
        </div>
      </Tippy>
    </div>
  );
};

export default Footer;
