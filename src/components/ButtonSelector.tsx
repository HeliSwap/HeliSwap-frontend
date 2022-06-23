import React, { useState } from 'react';
import Icon from '../components/Icon';
import IconToken from '../components/IconToken';

interface IButtonSelectorProps {
  selectorText: string;
  type?: 'background' | 'border' | 'default';
  className?: string;
  selectedToken?: string;
  onClick?: () => void;
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
}: IButtonSelectorProps) => {
  return (
    <div onClick={onClick} className={`btn-selector ${typeMapping[type]} ${className}`}>
      {selectedToken ? <IconToken symbol={selectedToken} className="me-3" /> : null}
      {selectedToken ? (
        <span className="text-main">{selectedToken}</span>
      ) : (
        <span className="text-small">{selectorText}</span>
      )}
      <Icon name="chevron" className="ms-2" />
    </div>
  );
};

export default ButtonSelector;
