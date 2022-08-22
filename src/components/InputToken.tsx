import React from 'react';

type IInputTokenProps = {
  isCompact?: boolean;
  className?: string;
  placeholder?: string;
} & React.ComponentPropsWithoutRef<'input'>;

const InputToken = (props: IInputTokenProps) => {
  const { className = '', placeholder, isCompact } = props;

  return (
    <input
      autoComplete="off"
      placeholder={placeholder ? placeholder : '0.0'}
      className={`input-token ${className} ${isCompact ? 'is-compact' : ''}`}
      type="text"
      {...props}
    />
  );
};

export default InputToken;
