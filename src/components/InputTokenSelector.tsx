import React from 'react';

interface IInputTokenSelector {
  className?: string;
  inputTokenComponent: React.ReactNode;
  buttonSelectorComponent: React.ReactNode;
  walletBalanceComponent?: React.ReactNode;
  isInvalid?: boolean;
  readonly?: boolean;
}

const InputTokenSelector = ({
  className = '',
  inputTokenComponent,
  buttonSelectorComponent,
  walletBalanceComponent,
  isInvalid,
  readonly = false,
}: IInputTokenSelector) => {
  return (
    <div
      className={`container-input-token ${isInvalid ? 'is-invalid' : ''} ${className} ${
        readonly ? 'is-readonly' : ''
      }`}
    >
      <div className="d-flex justify-content-between align-items-center">
        {inputTokenComponent}
        {buttonSelectorComponent}
      </div>

      {walletBalanceComponent ? (
        <div className="d-flex justify-content-end mt-4">{walletBalanceComponent}</div>
      ) : null}
    </div>
  );
};

export default InputTokenSelector;
