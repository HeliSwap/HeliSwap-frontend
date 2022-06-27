import { printIntrospectionSchema } from 'graphql';
import React, { useState } from 'react';

interface IModalProps {
  closeModal: () => void;
  confirmTansaction: () => void;
  modalTitle: string;
  children: any;
  confirmButtonLabel: string;
}

const ConfirmTransactionModalContent = ({
  closeModal,
  confirmTansaction,
  modalTitle,
  children,
  confirmButtonLabel,
}: IModalProps) => {
  const handleConfirmButtonClick = () => {
    confirmTansaction();
    closeModal();
  };
  return (
    <>
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">
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
      <div className="modal-body">{children}</div>
      <div className="d-grid mt-4">
        <button type="button" className="btn btn-primary" onClick={handleConfirmButtonClick}>
          {confirmButtonLabel}
        </button>
      </div>
    </>
  );
};

export default ConfirmTransactionModalContent;