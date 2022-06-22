import React from 'react';
import Icon from '../components/Icon';

interface IButtonSelectorProps {
  selectorText: string;
  type?: 'background' | 'border' | 'default';
  className?: string;
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
}: IButtonSelectorProps) => {
  return (
    <div onClick={onClick} className={`btn-selector ${typeMapping[type]} ${className}`}>
      <span className="text-small">{selectorText}</span>
      <Icon name="chevron" className="ms-2" />
    </div>
  );
};

export default ButtonSelector;
