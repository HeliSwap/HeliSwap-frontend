import React from 'react';

interface IHeaderProps {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ connected, setConnected }: IHeaderProps) => {
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center">
          {connected ? (
            <>
              <p className="text-success mx-2">Connected</p>
              <button className="btn btn-sm btn-outline-primary mx-2">Disconnect</button>
            </>
          ) : (
            <button className="btn btn-sm btn-outline-primary mx-2">Connect to wallet</button>
          )}

          <button className="btn btn-sm btn-primary mx-2">Bridging</button>
        </div>
      </div>
    </div>
  );
};

export default Header;
