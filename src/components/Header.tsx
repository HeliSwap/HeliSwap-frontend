import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../providers/Global';
import Menu from './Menu';

const Header = () => {
  const contextValue = useContext(GlobalContext);
  const { connected, connectWallet, disconnectWallet, extensionFound, isConnectionLoading } =
    contextValue.connection;

  return (
    <div className="container py-3 py-lg-5">
      <div className="d-flex justify-content-between align-items-center">
        <Link to="/">
          <img height={60} src="/logo.png" alt="" />
        </Link>
        <Menu />
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
