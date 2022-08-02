import React from 'react';

interface IModalContentProps {
  closeModal: () => void;
  modalTitle?: string;
}

const ModalContent = ({ closeModal, modalTitle }: IModalContentProps) => {
  return (
    <>
      <div className="modal-header">
        {modalTitle ? (
          <h5 className="modal-title text-main text-bold" id="exampleModalLabel">
            {modalTitle}
          </h5>
        ) : null}

        <button
          onClick={closeModal}
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">Modal content</div>
      <div className="modal-footer">
        <button
          onClick={closeModal}
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
        <button type="button" className="btn btn-primary">
          Save changes
        </button>
      </div>
    </>
  );
};

export default ModalContent;
