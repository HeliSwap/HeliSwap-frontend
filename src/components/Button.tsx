import React from 'react';

interface IButtonProps {
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  children: string | JSX.Element | JSX.Element[];
  className?: string;
  onClick?: () => void;
  loadingText?: string | JSX.Element | JSX.Element[];
  size?: 'small' | 'large' | 'default';
  outline?: boolean;
}

const Button = ({
  type = 'primary',
  children,
  disabled = false,
  className = '',
  onClick,
  loading = false,
  loadingText,
  size = 'default',
  outline = false,
}: IButtonProps) => {
  const sizeMapping = {
    small: 'btn-sm',
    large: 'btn-lg',
    default: '',
  };

  const outlinePrefix = outline ? '-outline' : '';
  const typeMapping = {
    primary: `btn${outlinePrefix}-primary`,
    secondary: `btn${outlinePrefix}-secondary`,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${typeMapping[type]} ${sizeMapping[size]} ${className}`}
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
