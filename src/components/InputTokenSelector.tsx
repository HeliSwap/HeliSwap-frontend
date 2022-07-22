import React from 'react';

interface IInputTokenSelector {
  className?: string;
  inputTokenComponent: React.ReactNode;
  buttonSelectorComponent: React.ReactNode;
  walletBalanceComponent?: React.ReactNode;
  isInvalid?: boolean;
}

const InputTokenSelector = ({
  className = '',
  inputTokenComponent,
  buttonSelectorComponent,
  walletBalanceComponent,
  isInvalid,
}: IInputTokenSelector) => {
  return (
    <div className={`container-input-token ${isInvalid ? 'is-invalid' : ''} ${className}`}>
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
