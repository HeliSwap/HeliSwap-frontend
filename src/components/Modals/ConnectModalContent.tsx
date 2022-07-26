import React from 'react';
import Loader from '../Loader';

interface IConnectModalContentProps {
  closeModal: () => void;
  connectWallet: () => void;
  modalTitle: string;
  isLoading: boolean;
  extensionFound: boolean;
}

const ConnectModalContent = ({
  closeModal,
  connectWallet,
  modalTitle,
  isLoading,
  extensionFound,
}: IConnectModalContentProps) => {
  const handleConnectButtonClick = () => {
    connectWallet();
  };

  return (
    <>
      <div className="modal-header">
        <h5 className="modal-title text-small text-bold" id="exampleModalLabel">
          {modalTitle}
        </h5>

        <button
          onClick={closeModal}
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        {!extensionFound ? (
          <p className="text-warning mx-2">
            Please{' '}
            <a target="_blank" className="link" rel="noreferrer" href="https://www.hashpack.app/">
              install
            </a>{' '}
            a wallet
          </p>
        ) : isLoading ? (
          <>
            <Loader></Loader>
            <div className="text-center mt-4">
              <p className="text-subheader">Connecting...</p>
              <p className="text-micro text-gray mt-4">
                By connecting a wallet, you agree to HeliSwap Terms of Service and acknowledge that
                you have read and understand the Uniswap Protocol Disclaimer.
              </p>
            </div>
          </>
        ) : (
          <>
            <div onClick={handleConnectButtonClick} className="btn-connect-wallet">
              <span className="text-main">Hashpack</span>
              <span className="icon-hashpack"></span>
            </div>
            <p className="text-micro text-gray mt-4">
              By connecting a wallet, you agree to HeliSwap Terms of Service and acknowledge that
              you have read and understand the Uniswap Protocol Disclaimer.
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default ConnectModalContent;
