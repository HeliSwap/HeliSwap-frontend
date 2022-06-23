import React, { useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import WalletBalance from '../components/WalletBalance';
import ButtonSelector from '../components/ButtonSelector';
import Icon from '../components/Icon';

import { ITokenData, TokenType } from '../interfaces/tokens';

interface ITokenInputSelector {
  className?: string;
  tokenData?: ITokenData;
}

const TokenInputSelector = ({ className, tokenData }: ITokenInputSelector) => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [inputValue, setInputValue] = useState('0.0123');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setInputValue(value);
  };

  return (
    <div className={`container-input-token ${className}`}>
      <div className="d-flex justify-content-between align-items-center">
        <input
          onChange={handleInputChange}
          value={inputValue}
          className="input-token"
          type="text"
        />
        <ButtonSelector selectedToken={tokenData?.symbol} selectorText="Select token" />
      </div>

      <div className="d-flex justify-content-end mt-7">
        {tokenData?.type !== TokenType.ERC20 ? (
          <WalletBalance tokenData={tokenData} userId={userId} />
        ) : (
          <p className="d-flex align-items-center">
            <span className="text-gray text-micro me-3">Balance not viewable</span>{' '}
            <Icon color="gray" name="hint" />
          </p>
        )}
      </div>
    </div>
  );
};

export default TokenInputSelector;
