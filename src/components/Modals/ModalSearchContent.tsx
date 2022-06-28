import React, { useState, useEffect } from 'react';
import { ITokenData, TokenType } from '../../interfaces/tokens';

import useTokens from '../../hooks/useTokens';

import { getHTSTokenInfo, idToAddress } from '../../utils/tokenUtils';
import IconToken from '../IconToken';
import Button from '../Button';

interface IModalProps {
  modalTitle?: string;
  closeModal: () => void;
  setTokensData: (prev: any) => void;
  tokenFieldId: string;
  defaultToken?: ITokenData;
}

const ModalSearchContent = ({
  closeModal,
  setTokensData,
  tokenFieldId,
  modalTitle,
  defaultToken,
}: IModalProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');

  const [decimals, setDecimals] = useState(18);
  const [readyToImport, setReadyToImport] = useState(false);
  const [readyToImportERC, setReadyToImportERC] = useState(false);

  const { tokens: tokenDataList } = useTokens({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const [tokenList, setTokenList] = useState<ITokenData[]>([]);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setSearchInputValue(value);
  };

  const handleDecimalsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const valueNum = Number(value);

    if (!valueNum || isNaN(valueNum)) return;

    setDecimals(valueNum);
  };

  const handleTokenListClick = (token: ITokenData) => {
    setTokensData((prev: any) => ({
      ...prev,
      [tokenFieldId]: token,
    }));

    resetModalState();
    closeModal();
  };

  const handleImportERC20ButtonClick = () => {
    const sampleERC20 = {
      hederaId: searchInputValue,
      type: TokenType.ERC20,
      symbol: 'ERC20',
      name: 'Possible ERC20 Token',
      decimals,
      address: idToAddress(searchInputValue),
    };

    setTokensData((prev: any) => ({
      ...prev,
      [tokenFieldId]: sampleERC20,
    }));

    resetModalState();
    closeModal();
  };

  const resetModalState = () => {
    setSearchInputValue('');
    tokenDataList && setTokenList(tokenDataList);
  };

  const handleCloseClick = () => {
    resetModalState();
    closeModal();
  };

  const handleImportButtonClick = async () => {
    const result = await getHTSTokenInfo(searchInputValue);
    const hasResults = Object.keys(result).length > 0;
    console.log('hasResults', hasResults);
    hasResults && setTokenList([result]);
    setReadyToImportERC(!hasResults && searchInputValue !== '');
  };

  useEffect(() => {
    const found =
      tokenDataList?.find((item: ITokenData) => item.hederaId === searchInputValue) || false;

    if (found) {
      setTokenList([found]);
    }

    setReadyToImport(!found);
  }, [searchInputValue, tokenDataList]);

  useEffect(() => {
    if (tokenDataList) {
      setTokenList(tokenDataList);
    }
  }, [tokenDataList]);

  console.log('readyToImportERC', readyToImportERC);

  const hasTokenList = tokenList && tokenList.length > 0;

  return (
    <>
      <div className="modal-header">
        {modalTitle ? (
          <h5 className="modal-title text-main text-bold" id="exampleModalLabel">
            {modalTitle}
          </h5>
        ) : null}

        <button
          onClick={handleCloseClick}
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <div>
          <p className="text-small mb-3">Search</p>
          <input
            value={searchInputValue}
            onChange={onSearchInputChange}
            type="text"
            className="form-control"
          />
        </div>

        {readyToImport ? (
          <div className="text-center mt-5">
            <Button onClick={handleImportButtonClick} type="primary" className="btn-sm">
              Import
            </Button>
          </div>
        ) : null}

        {readyToImportERC ? (
          <div className="d-flex align-items-center mt-5">
            <input
              className="form-control"
              type="text"
              value={decimals}
              onChange={handleDecimalsInputChange}
            />
            <Button onClick={handleImportERC20ButtonClick} className="btn btn-sm btn-primary ms-3">
              Import ERC-20
            </Button>
          </div>
        ) : null}

        {hasTokenList ? (
          <div className="mt-7">
            <h3 className="text-small">Token name</h3>
            <div className="mt-5">
              {tokenList.map((token: ITokenData, index: number) => (
                <div
                  onClick={() => handleTokenListClick(token)}
                  className="cursor-pointer list-token-item d-flex align-items-center"
                  key={index}
                >
                  <IconToken symbol={token.symbol} />
                  <div className="d-flex flex-column ms-3">
                    <span className="text-main">{token.symbol}</span>
                    <span className="text-small text-secondary">{token.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ModalSearchContent;
