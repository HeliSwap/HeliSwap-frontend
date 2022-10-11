import React from 'react';
import { Link } from 'react-router-dom';

import Icon from './Icon';

const MobileWarning = () => {
  return (
    <div className="py-4">
      <div className="container">
        <Link to="/">
          <img src="/logo-full.svg" alt="" />
        </Link>
        <div className="text-center">
          <img className="img-fluid" src="/mobile-device.svg" alt="" />
          <h1 className="text-subheader text-bold mt-5">Mobile version coming soon…</h1>
          <p className="text-main mt-4 p-3">Please connect from desktop computer.</p>
          <div className="mt-5">
            <a
              className="link-primary text-bold d-inline-flex align-items-center"
              href="https://heliswap.io"
            >
              <Icon color="info" name="arrow-left" />
              <span className="ms-2">Go to Landing page</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWarning;
