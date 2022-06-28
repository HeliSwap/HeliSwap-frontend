import React, { useState, useEffect } from 'react';
import { IPairData, ITokenData, TokenType } from '../../interfaces/tokens';

import { useLazyQuery } from '@apollo/client';
import { GET_POOL_BY_TOKEN, GET_TOKEN_INFO } from '../../GraphQL/Queries';

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
  const [showDecimalsField, setShowDecimalsField] = useState(false);
  const [readyToImport, setReadyToImport] = useState(false);

  const { tokens: tokenDataList, loading: loadingGT } = useTokens({
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
    console.log('result', result);
    result && setTokenList([result]);
  };

  useEffect(() => {
    const found =
      tokenDataList?.find((item: ITokenData) => {
        console.log('item.symbol', item.symbol);
        console.log('item.hederaId', item.hederaId);
        console.log('searchInputValue', searchInputValue);
        return item.hederaId === searchInputValue;
      }) || false;

    if (found) {
      setTokenList([found]);
    }

    setReadyToImport(Object.keys(found).length === 0);
    console.log('found', found);
  }, [searchInputValue]);

  useEffect(() => {
    if (tokenDataList) {
      setTokenList(tokenDataList);
    }
  }, [tokenDataList]);

  console.log('readyToImport', readyToImport);

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
