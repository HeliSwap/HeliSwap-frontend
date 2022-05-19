import React, { useState, useEffect, useContext } from 'react';
import { ITokenData } from '../interfaces/tokens';
// TODO Interfaces to be combined into comon export
import { IStringToString } from '../interfaces/comon';
import { GlobalContext } from '../providers/Global';

import WalletBalance from '../components/WalletBalance';

interface ITokenInputSelector {
  tokenDataList: ITokenData[];
  inputName: string;
  selectName: string;
  onInputChange?: (tokenData: IStringToString) => void;
  onSelectChange?: (tokenData: IStringToString) => void;
}

const TokenInputSelector = ({
  tokenDataList,
  inputName,
  selectName,
  onInputChange,
  onSelectChange,
}: ITokenInputSelector) => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [inputValue, setInputValue] = useState('0');
  const [selectValue, setSelectValue] = useState('0');
  const [maxNumber, setMaxNumber] = useState('0.00');

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

  const handleMaxNumClick = () => {
    setInputValue(maxNumber);
  };

  useEffect(() => {
    if (tokenDataList.length > 0) {
      setSelectValue(tokenDataList[0].hederaId);
    }
  }, [tokenDataList]);

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
          <span onClick={() => handleMaxNumClick()} className="link-primary text-link-input">
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
              <option key={item.hederaId} value={item.hederaId}>
                {item.symbol}
              </option>
            ))}
          </select>
        ) : null}

        {hasTokens ? (
          <WalletBalance
            setMaxNumber={setMaxNumber}
            userId={userId}
            tokenData={
              tokenDataList.find(item => item.hederaId === selectValue) || ({} as ITokenData)
            }
          />
        ) : null}
      </div>
    </div>
  );
};

export default TokenInputSelector;
