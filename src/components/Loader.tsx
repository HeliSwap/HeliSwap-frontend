import React from 'react';

interface ILoaderProps {
  loadingText?: string;
}

const Loader = ({ loadingText }: ILoaderProps) => {
  return (
    <div className="d-flex align-items-center">
      <div className="spinner-border text-primary me-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>{loadingText ? loadingText : 'Loading...'}</p>
    </div>
  );
};

export default Loader;
