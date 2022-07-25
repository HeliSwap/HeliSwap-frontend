import React from 'react';
import Button from '../Button';

interface IConfirmTransactionModalContentProps {
  closeModal: () => void;
  confirmTansaction: () => void;
  modalTitle: string;
  children: any;
  confirmButtonLabel: string;
  isLoading: boolean;
}

const ConfirmTransactionModalContent = ({
  closeModal,
  confirmTansaction,
  modalTitle,
  children,
  confirmButtonLabel,
  isLoading,
}: IConfirmTransactionModalContentProps) => {
  const handleConfirmButtonClick = () => {
    confirmTansaction();
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
        {children}
        {!isLoading ? (
          <div className="d-grid mt-4">
            <Button loading={isLoading} onClick={handleConfirmButtonClick}>
              {confirmButtonLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ConfirmTransactionModalContent;
