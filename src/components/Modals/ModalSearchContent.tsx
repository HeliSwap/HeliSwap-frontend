import React, { useState, useEffect } from 'react';
import { ITokenData, TokenType } from '../../interfaces/tokens';

import useTokens from '../../hooks/useTokens';

import { getHTSTokenInfo, idToAddress } from '../../utils/tokenUtils';
import IconToken from '../IconToken';
import Button from '../Button';

import search from '../../icons/system/search-gradient.svg';

interface IModalProps {
  modalTitle?: string;
  closeModal: () => void;
  setTokensData: (prev: any) => void;
  tokenFieldId: string;
  canImport?: boolean;
}

const ModalSearchContent = ({
  closeModal,
  setTokensData,
  tokenFieldId,
  modalTitle,
  canImport = true,
}: IModalProps) => {
  const networkType = process.env.REACT_APP_NETWORK_TYPE as string;
  const hashScanUrl = `https://hashscan.io/#/${networkType}/token/`;

  const [searchInputValue, setSearchInputValue] = useState('');

  const [decimals, setDecimals] = useState(18);
  const [showNotFound, setShowNotFound] = useState(false);
  const [readyToImport, setReadyToImport] = useState(false);
  const [readyToImportERC, setReadyToImportERC] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const { tokens: tokenDataList, loading: loadingTDL } = useTokens({
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
    setReadyToImportERC(false);
    setReadyToImport(false);
    setWarningMessage('');
    tokenDataList && setTokenList(tokenDataList);
  };

  const handleCloseClick = () => {
    resetModalState();
    closeModal();
  };

  const handleImportButtonClick = async () => {
    const result = await getHTSTokenInfo(searchInputValue);
    const { details } = result;
    const { hasFees } = details;

    setWarningMessage(hasFees ? 'Token has fees!' : '');

    const hasResults = Object.keys(result).length > 0;
    hasResults && setTokenList([result]);
    setShowNotFound(false);
    setReadyToImport(false);
    setReadyToImportERC(!hasResults && searchInputValue !== '');
  };

  useEffect(() => {
    const inputEmpty = searchInputValue === '';
    if (inputEmpty) {
      setReadyToImport(false);
      setReadyToImportERC(false);
    }

    setWarningMessage('');

    const found =
      tokenDataList?.find((item: ITokenData) => item.hederaId === searchInputValue) || false;

    setShowNotFound(!found);

    if (searchInputValue !== '' && found) {
      setTokenList([found]);
    }

    if (searchInputValue === '' && tokenDataList) {
      setTokenList(tokenDataList);
    }

    setReadyToImport(!found);
  }, [searchInputValue, tokenDataList]);

  useEffect(() => {
    if (tokenDataList) {
      setTokenList(tokenDataList);
    }
  }, [tokenDataList]);

  const hasTokenList = tokenList && tokenList.length > 0;
  const showImportButton = canImport && readyToImport;
  const showTokenList = canImport
    ? !loadingTDL && hasTokenList && !showImportButton && !readyToImportERC
    : !loadingTDL && hasTokenList && !showNotFound;

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

        {warningMessage ? <div className="alert alert-warning mt-5">{warningMessage}</div> : null}

        {showNotFound ? (
          <div className="text-center mt-5">
            <img src={search} alt="" />
            <h2 className="text-subheader mt-4">Not Found</h2>

            {showImportButton ? (
              <>
                <p className="text-micro text-secondary mt-3 mb-5">
                  Would you like to import{' '}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="link-primary"
                    href={`${hashScanUrl}${searchInputValue}`}
                  >
                    {searchInputValue}
                  </a>
                  ?
                </p>
                <Button onClick={handleImportButtonClick} type="primary" className="btn-sm">
                  Import
                </Button>
              </>
            ) : null}
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
              Import
            </Button>
          </div>
        ) : null}

        {showTokenList ? (
          <div className="mt-7">
            <h3 className="text-small">Token name</h3>
            <div className="mt-3">
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
