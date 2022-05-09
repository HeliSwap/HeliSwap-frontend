import React from 'react';

interface IModalProps {
  closeModal: () => void;
}

const ModalContent = ({ closeModal }: IModalProps) => {
  return (
    <>
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
