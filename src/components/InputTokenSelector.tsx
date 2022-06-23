import React from 'react';

interface IInputTokenSelector {
  className?: string;
  inputTokenComponent: React.ReactNode;
  buttonSelectorComponent: React.ReactNode;
  walletBalanceComponent: React.ReactNode;
}

const InputTokenSelector = ({
  className,
  inputTokenComponent,
  buttonSelectorComponent,
  walletBalanceComponent,
}: IInputTokenSelector) => {
  return (
    <div className={`container-input-token ${className}`}>
      <div className="d-flex justify-content-between align-items-center">
        {inputTokenComponent}
        {buttonSelectorComponent}
      </div>

      <div className="d-flex justify-content-end mt-7">{walletBalanceComponent}</div>
    </div>
  );
};

export default InputTokenSelector;
