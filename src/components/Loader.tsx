import React from 'react';

interface ILoaderProps {
  loadingText?: string;
}

const Loader = ({ loadingText }: ILoaderProps) => {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="container-loader"></div>
      {loadingText ? <p className="mt-3">{loadingText}</p> : null}
    </div>
  );
};

export default Loader;
