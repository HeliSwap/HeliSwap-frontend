import React, { useContext } from 'react';
import { GlobalContext } from '../providers/Global';

const Header = () => {
  const contextValue = useContext(GlobalContext);
  const { connected, connectWallet, disconnectWallet, extensionFound, isConnectionLoading } =
    contextValue.connection;

  return (
    <div className="p-5">
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center">
          {!isConnectionLoading ? (
            extensionFound ? (
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
                  Connect wallet
                </button>
              )
            ) : (
              <p className="text-warning mx-2">Please install a wallet</p>
            )
          ) : (
            <p className="text-success mx-2">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
