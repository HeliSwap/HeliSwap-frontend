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
          className: 'toast-success',
          icon: <Icon name="check" color="success" size="small" />,
          duration: 5000,
        },
        error: {
          className: 'toast-error',
          icon: <Icon name="warning" color="danger" size="small" />,
          duration: 5000,
        },
      }}
    />
  );
};

export default ToasterWrapper;
