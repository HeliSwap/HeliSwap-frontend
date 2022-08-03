import React from 'react';

type IInputTokenProps = {
  className?: string;
  placeholder?: string;
} & React.ComponentPropsWithoutRef<'input'>;

const InputToken = (props: IInputTokenProps) => {
  const { className = '', placeholder } = props;

  return (
    <input
      autoComplete="off"
      placeholder={placeholder ? placeholder : '0.0'}
      className={`input-token ${className}`}
      type="text"
      {...props}
    />
  );
};

export default InputToken;
