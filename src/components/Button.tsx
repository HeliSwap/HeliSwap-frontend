import React from 'react';

interface IButtonProps {
  type?: string;
  disabled?: boolean;
  loading?: boolean;
  children: string | JSX.Element | JSX.Element[];
  className?: string;
  onClick?: () => void;
  loadingText?: string | JSX.Element | JSX.Element[];
}

const Button = ({
  type = 'primary',
  children,
  disabled = false,
  className,
  onClick,
  loading = false,
  loadingText,
}: IButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${type} ${className}`}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-3"
            role="status"
            aria-hidden="true"
          ></span>{' '}
          {loadingText ? <span>{loadingText}</span> : <span>Loading...</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
