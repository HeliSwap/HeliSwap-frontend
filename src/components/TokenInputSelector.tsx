import React, { useState, useContext } from 'react';
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
  inputValue: string;
  selectValue: string;
}

const TokenInputSelector = ({
  tokenDataList,
  inputName,
  selectName,
  onInputChange,
  onSelectChange,
  inputValue,
  selectValue,
}: ITokenInputSelector) => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  /*eslint-disable */
  const [maxNumber, setMaxNumber] = useState('0.00');
  /*eslint-enable */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    const tokenData = {
      [selectName]: selectValue,
      [name]: value,
    };

    onInputChange && onInputChange(tokenData);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;

    const tokenData = {
      [name]: value,
    };

    onSelectChange && onSelectChange(tokenData);
  };

  return (
    <div className="row justify-content-between align-items-end mt-3">
      <div className="col-7">
        <div className="input-container">
          <input
            value={inputValue}
            name={inputName}
            onChange={handleInputChange}
            type="text"
            className="form-control mt-2"
          />
          <span className="link-primary text-link-input">Max</span>
        </div>
        <p className="text-success mt-3">$0.00</p>
      </div>

      <div className="col-5">
        <select
          onChange={handleSelectChange}
          name={selectName}
          id=""
          className="form-control"
          value={selectValue}
        >
          {selectValue ? null : (
            <option value="" disabled hidden>
              Select token
            </option>
          )}
          {tokenDataList.map(item => (
            <option key={item.hederaId} value={item.hederaId}>
              {item.symbol}
            </option>
          ))}
        </select>

        <WalletBalance
          setMaxNumber={setMaxNumber}
          userId={userId}
          tokenData={
            tokenDataList.find(item => item.hederaId === selectValue) || ({} as ITokenData)
          }
        />
      </div>
    </div>
  );
};

export default TokenInputSelector;
