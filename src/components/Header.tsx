import React from 'react';

const Footer = () => {
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-end">
        <div>
          <button className="btn btn-sm btn-outline-primary mx-2">Connect to wallet</button>
          <button className="btn btn-sm btn-primary mx-2">Bridging</button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
