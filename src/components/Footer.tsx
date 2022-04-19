import React from 'react';

const Header = () => {
  return (
    <div className="footer">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div>
            <a className="link mx-4" href="#index">
              USD
            </a>
            <a className="link mx-4" href="#index">
              English
            </a>
          </div>

          <div>
            <a className="link mx-4" href="#index">
              Support
            </a>
            <a className="link mx-4" href="#index">
              FAQ
            </a>
            <a className="link mx-4" href="#index">
              Privacy policy
            </a>
            <a className="link mx-4" href="#index">
              Terms of service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
