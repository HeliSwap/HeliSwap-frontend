import React from 'react';

type IInputTokenProps = {
  className?: string;
} & React.ComponentPropsWithoutRef<'input'>;

const InputToken = (props: IInputTokenProps) => {
  const { className = '' } = props;

  return <input className={`input-token ${className}`} type="text" {...props} />;
};

export default InputToken;
