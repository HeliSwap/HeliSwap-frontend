import React from 'react';
import Button from '../Button';
import Icon from '../Icon';
import { Md5 } from 'ts-md5/dist/md5';
import { HASHSCAN_ROOT_DOMAIN } from '../../constants';

interface IUserAccoutnModalContentProps {
  closeModal: () => void;
  disconnectWallet: () => void;
  modalTitle: string;
  userId: string;
}

const UserAccoutnModalContent = ({
  closeModal,
  disconnectWallet,
  modalTitle,
  userId,
}: IUserAccoutnModalContentProps) => {
  const handleDisconnectButtonClick = () => {
    disconnectWallet();
    closeModal();
  };

  const handleCopyButtonClick = () => {
    navigator.clipboard.writeText(userId);
  };

  const hashscanLink = `${HASHSCAN_ROOT_DOMAIN}/${process.env.REACT_APP_NETWORK_TYPE}/account/${userId}`;

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
        <div className="border border-secondary rounded p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="text-small text-bold">Connected with Hashpack</p>
              {userId ? (
                <div className="d-flex align-items-center mt-5">
                  <img
                    className="img-profile me-3"
                    src={`https://www.gravatar.com/avatar/${Md5.hashStr(userId)}/?d=identicon`}
                    alt=""
                  />
                  <p className="text-main text-bold">{userId}</p>
                </div>
              ) : null}
            </div>

            <Button
              size="small"
              type="primary"
              outline={true}
              onClick={handleDisconnectButtonClick}
            >
              Disconnect
            </Button>
          </div>

          <hr className="my-5" />

          <div className="d-flex align-items-center" onClick={() => handleCopyButtonClick()}>
            <span className="link cursor-pointer">
              <Icon name="copy" />
              <span className="text-small ms-2">Copy Id</span>
            </span>

            <a rel="noreferrer" target="_blank" href={hashscanLink} className="link ms-6">
              <Icon name="external" />
              <span className="text-small ms-2">View on Hashscan</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAccoutnModalContent;
