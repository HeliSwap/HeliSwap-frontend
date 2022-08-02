import React, { useContext } from 'react';
import { GlobalContext } from '../providers/Global';

const Footer = () => {
  const contextValue = useContext(GlobalContext);
  const { isRunning, lastUpdated } = contextValue;

  return (
    <div className="d-flex justify-content-end pe-4 mb-4">
      <div className="d-flex align-items-center">
        <span className="me-3 text-micro">{lastUpdated}</span>
        <span className={`icon-healthcheck ${isRunning ? 'is-running' : ''}`}></span>
      </div>
    </div>
  );
};

export default Footer;
