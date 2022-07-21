import React, { useEffect, useState, useCallback } from 'react';

interface IModalProps {
  show?: boolean;
  children: JSX.Element | JSX.Element[] | string;
}

const Modal = ({ show = true, children }: IModalProps) => {
  const [toShow, setToShow] = useState(show);

  const handleKeyDown = useCallback((event: any) => {
    if (event.key === 'Escape') {
      setToShow(prev => prev && false);
    }
  }, []);

  useEffect(() => {
    setToShow(show);

    return () => {
      setToShow(false);
    };
  }, [show]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  console.log('toShow', toShow);

  return (
    <>
      <div
        className="modal fade show"
        id="exampleModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        style={{ display: toShow ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">{children}</div>
        </div>
      </div>
      <div
        style={{ display: toShow ? 'block' : 'none' }}
        className="modal-backdrop fade show"
      ></div>
    </>
  );
};

export default Modal;
