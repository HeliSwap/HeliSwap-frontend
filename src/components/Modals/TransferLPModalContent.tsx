import React from 'react';

interface ITransferLPModalContentProps {
  closeModal: () => void;
  modalTitle: string;
  children: any;
}

const TransferLPModalContent = ({
  closeModal,
  modalTitle,
  children,
}: ITransferLPModalContentProps) => {
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
      <div className="modal-body">{children}</div>
    </>
  );
};

export default TransferLPModalContent;
