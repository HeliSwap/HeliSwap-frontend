import React from 'react';
import { Toaster } from 'react-hot-toast';
import Icon from './Icon';

const ToasterWrapper = () => {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 100,
      }}
      toastOptions={{
        style: {
          background: '#ffffff',
          fontSize: '14px',
        },
        success: {
          duration: 50000,
          className: 'toast-success',
          icon: <Icon name="check" color="success" size="small" />,
        },
        error: {
          className: 'toast-error',
          duration: 50000,
          icon: <Icon name="warning" color="danger" size="small" />,
        },
      }}
    />
  );
};

export default ToasterWrapper;
