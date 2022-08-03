import React from 'react';
import Icon from '../components/Icon';
import IconToken from '../components/IconToken';

interface IButtonSelectorProps {
  selectorText: string;
  type?: 'background' | 'border' | 'default';
  className?: string;
  selectedToken?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface ITypeMapping {
  [key: string]: string;
}

const typeMapping: ITypeMapping = {
  default: '',
  background: 'with-background',
  border: 'with-border',
};

const ButtonSelector = ({
  selectorText,
  type = 'default',
  className,
  onClick,
  selectedToken,
  disabled = false,
}: IButtonSelectorProps) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`btn-selector ${disabled ? 'is-disabled' : ''} ${typeMapping[type]} ${className}`}
    >
      {selectedToken ? <IconToken symbol={selectedToken} className="me-3" /> : null}
      {selectedToken ? (
        <span className="text-main">{selectedToken}</span>
      ) : (
        <span className="text-small">{selectorText}</span>
      )}
      {!disabled ? <Icon name="chevron-down" className="ms-2" /> : null}
    </div>
  );
};

export default ButtonSelector;
