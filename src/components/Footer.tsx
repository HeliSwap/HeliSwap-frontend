import React from 'react';

const Header = () => {
  return (
    <div className="footer">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div>
            <a className="link mx-4" href="#">
              USD
            </a>
            <a className="link mx-4" href="#">
              English
            </a>
          </div>

          <div>
            <a className="link mx-4" href="#">
              Support
            </a>
            <a className="link mx-4" href="#">
              FAQ
            </a>
            <a className="link mx-4" href="#">
              Privacy policy
            </a>
            <a className="link mx-4" href="#">
              Terms of service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
