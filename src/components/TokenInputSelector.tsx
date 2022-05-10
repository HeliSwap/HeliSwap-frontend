import React, { useState, useEffect } from 'react';
import { ITokenData, IUserToken } from '../interfaces/tokens';
// TODO Interfaces to be combined into comon export
import { IStringToString } from '../interfaces/comon';

interface ITokenInputSelector {
  tokenDataList: ITokenData[];
  userTokenList: IUserToken[];
  inputName: string;
  selectName: string;
  onInputChange?: (tokenData: IStringToString) => void;
  onSelectChange?: (tokenData: IStringToString) => void;
}

const TokenInputSelector = ({
  tokenDataList,
  userTokenList,
  inputName,
  selectName,
  onInputChange,
  onSelectChange,
}: ITokenInputSelector) => {
  const [inputValue, setInputValue] = useState('0');
  const [selectValue, setSelectValue] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0.00');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setInputValue(value);

    const tokenData = {
      [selectName]: selectValue,
      [name]: value,
    };

    onInputChange && onInputChange(tokenData);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;

    setSelectValue(value);

    const tokenData = {
      [name]: value,
    };

    onSelectChange && onSelectChange(tokenData);
  };

  const setMaxNumber = () => {
    setInputValue(tokenBalance);
  };

  useEffect(() => {
    if (tokenDataList.length > 0) {
      setSelectValue(tokenDataList[0].tokenId);
    }
  }, [tokenDataList]);

  useEffect(() => {
    const getTokenBalance = () => {
      const tokenFound = userTokenList.find(item => item.tokenId === selectValue);
      const tokenDecimals = tokenDataList.find(item => item.tokenId === selectValue)?.decimals || 2;
      const tokenBalance = tokenFound
        ? (tokenFound.balance / Math.pow(10, tokenDecimals)).toFixed(tokenDecimals)
        : '0.00';

      setTokenBalance(tokenBalance);
    };

    selectValue && tokenDataList.length > 0 && getTokenBalance();
  }, [selectValue, userTokenList, tokenDataList]);

  const hasTokens = tokenDataList.length > 0;

  return (
    <div className="row justify-content-between align-items-end mt-3">
      <div className="col-8">
        <div className="input-container">
          <input
            value={inputValue}
            name={inputName}
            onChange={handleInputChange}
            type="text"
            className="form-control mt-2"
          />
          <span onClick={() => setMaxNumber()} className="link-primary text-link-input">
            Max
          </span>
        </div>
        <p className="text-success mt-3">$0.00</p>
      </div>

      <div className="col-4">
        {hasTokens && selectValue ? (
          <select
            value={selectValue}
            onChange={handleSelectChange}
            name={selectName}
            id=""
            className="form-control"
          >
            {tokenDataList.map(item => (
              <option key={item.tokenId} value={item.tokenId}>
                {item.symbol}
              </option>
            ))}
          </select>
        ) : null}

        <p className="text-steel mt-3 text-end">Wallet balance: {tokenBalance}</p>
      </div>
    </div>
  );
};

export default TokenInputSelector;
