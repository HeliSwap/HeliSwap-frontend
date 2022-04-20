import React from 'react';

interface IHeaderProps {
  connected: boolean;
  isConnectionLoading: boolean;
  readyToConnect: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const Header = ({
  connected,
  connectWallet,
  disconnectWallet,
  readyToConnect,
  isConnectionLoading,
}: IHeaderProps) => {
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center">
          {!isConnectionLoading ? (
            readyToConnect ? (
              connected ? (
                <>
                  <p className="text-success mx-2">Connected</p>
                  <button
                    onClick={() => disconnectWallet()}
                    className="btn btn-sm btn-outline-primary mx-2"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connectWallet()}
                  className="btn btn-sm btn-outline-primary mx-2"
                >
                  Connect to wallet
                </button>
              )
            ) : (
              <p className="text-warning mx-2">Please install a wallet</p>
            )
          ) : (
            <p className="text-success mx-2">Loading...</p>
          )}

          <button className="btn btn-sm btn-primary mx-2">Bridging</button>
        </div>
      </div>
    </div>
  );
};

export default Header;
