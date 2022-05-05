import React, { useState } from 'react';

interface IModalProps {
  setShow?: () => void;
}

const Modal = ({ setShow }: IModalProps) => {
  const [shown, setShown] = useState(false);

  const openModal = () => {
    setShown(true);
  };

  const closeModal = () => {
    setShown(false);
  };

  return (
    <div
      className="modal fade show"
      id="exampleModal"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
      style={{ display: shown ? 'block' : 'none' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Modal title
            </h5>
            <button
              onClick={() => closeModal()}
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">...</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
