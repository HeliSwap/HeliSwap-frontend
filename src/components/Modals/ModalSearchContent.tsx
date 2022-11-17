import React, { useState, useEffect, ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import { ITokenData, TokenType } from '../../interfaces/tokens';
import { hethers } from '@hashgraph/hethers';

import {
  addressToId,
  getHTSTokenInfo,
  isAddressValid,
  isHederaIdValid,
  requestAddressFromId,
  requestIdFromAddress,
} from '../../utils/tokenUtils';

import { ASYNC_SEARCH_THRESHOLD, HASHSCAN_ROOT_DOMAIN } from '../../constants';

import IconToken from '../IconToken';
import Button from '../Button';
import Icon from '../Icon';
import Loader from '../Loader';

import search from '../../icons/system/search-gradient.svg';
import useDebounce from '../../hooks/useDebounce';
import { concatWarningMessage } from '../../content/messages';

interface IModalProps {
  modalTitle?: string;
  closeModal: () => void;
  setTokensData: (prev: any) => void;
  tokenFieldId: string;
  canImport?: boolean;
  tokenDataList: ITokenData[];
  loadingTDL: boolean;
  searchFunc?: (value: string) => void;
  itemToExlude?: ITokenData;
}

const ModalSearchContent = ({
  closeModal,
  setTokensData,
  tokenFieldId,
  modalTitle,
  canImport = true,
  tokenDataList,
  loadingTDL,
  searchFunc,
  itemToExlude,
}: IModalProps) => {
  const networkType = process.env.REACT_APP_NETWORK_TYPE as string;
  const hashScanUrl = `${HASHSCAN_ROOT_DOMAIN}/${networkType}/token/`;

  const [searchInputValue, setSearchInputValue] = useState('');

  const [decimals, setDecimals] = useState(18);
  const [showNotFound, setShowNotFound] = useState(false);
  const [readyToImport, setReadyToImport] = useState(false);
  const [readyToImportERC, setReadyToImportERC] = useState(false);
  const [warningMessage, setWarningMessage] = useState<JSX.Element[]>([]);

  const [tokenList, setTokenList] = useState<ITokenData[]>([]);
  const [searchingResults, setSearchingResults] = useState(false);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchingResults(value.length > ASYNC_SEARCH_THRESHOLD);
    setSearchInputValue(value);
  };
  const debouncedSearchTerm: string = useDebounce(searchInputValue, 1000);

  useEffect(() => {
    if (debouncedSearchTerm && searchFunc) {
      searchFunc(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchFunc]);

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

  const handleImportERC20ButtonClick = async () => {
    const searchValueIsAddress = isAddressValid(searchInputValue.trim());
    const hederaId = searchValueIsAddress
      ? await requestIdFromAddress(searchInputValue.trim())
      : searchInputValue;
    const address = searchValueIsAddress
      ? hethers.utils.getChecksumAddress(searchInputValue.trim())
      : await requestAddressFromId(searchInputValue);

    const sampleERC20 = {
      hederaId,
      type: TokenType.ERC20,
      symbol: 'ERC20',
      name: 'Possible ERC20 Token',
      decimals,
      address,
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
    setWarningMessage([]);
    tokenDataList && setTokenList(tokenDataList);
  };

  const handleCloseClick = () => {
    resetModalState();
    closeModal();
  };

  const handleImportButtonClick = async () => {
    const isAddress = !!isAddressValid(searchInputValue.trim());
    const result = await getHTSTokenInfo(
      isAddress ? addressToId(searchInputValue) : searchInputValue,
    );
    const hasResults = Object.keys(result).length > 0;

    if (hasResults) {
      const messageList = concatWarningMessage(result);

      if (messageList.length > 0) {
        setWarningMessage(messageList);
      }

      setTokenList([result]);
    }

    setShowNotFound(false);
    setReadyToImport(false);
    setReadyToImportERC(!hasResults && searchInputValue !== '');
  };

  useEffect(() => {
    const inputEmpty = searchInputValue.trim() === '';
    if (inputEmpty) {
      setReadyToImport(false);
      setReadyToImportERC(false);
    }

    setWarningMessage([]);

    const isId = !!isHederaIdValid(searchInputValue.trim());
    const isAddress = !!isAddressValid(searchInputValue.trim());

    const foundItem = tokenDataList.find(
      (item: ITokenData) =>
        item.hederaId === searchInputValue ||
        item.address.toLowerCase() === searchInputValue.toLowerCase(),
    );
    const foundItemArray = foundItem ? [foundItem] : [];

    const foundItems =
      isId || isAddress
        ? foundItemArray
        : tokenDataList?.filter(
            (item: ITokenData) =>
              item.symbol.toLowerCase().includes(searchInputValue.toLowerCase()) ||
              item.name.toLowerCase().includes(searchInputValue.toLowerCase()),
          ) || [];

    const haveResults = foundItems.length > 0;

    setShowNotFound(!haveResults);

    if (searchInputValue !== '') {
      setTokenList(foundItems);
    }

    if (searchInputValue === '' && tokenDataList) {
      setTokenList(tokenDataList);
    }

    const searchAddressExluded = isAddress && searchInputValue.trim() === itemToExlude?.address;
    const searchIdExluded = isId && searchInputValue.trim() === itemToExlude?.hederaId;

    setReadyToImport(
      !haveResults && (isId || isAddress) && !searchAddressExluded && !searchIdExluded,
    );
  }, [searchInputValue, tokenDataList, itemToExlude]);

  useEffect(() => {
    setSearchingResults(false);
  }, [tokenDataList]);

  const renderWarningTooltip = (token: ITokenData) => {
    if (token.type === TokenType.HBAR) return null;

    const messageList = concatWarningMessage(token);

    if (messageList.length > 0) {
      return (
        <Tippy
          content={
            <div>
              <div className="d-flex align-items-center">
                <Icon name="info" color="info" />
                <p className="text-bold ms-3">Warning!</p>
              </div>
              <p className="mt-3">
                This token contains additional properites that could cause potential issues:
              </p>
              <ul className="list-default mt-2">
                {messageList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          }
        >
          <span className="ms-2">
            <Icon color="info" name="info" />
          </span>
        </Tippy>
      );
    } else {
      return null;
    }
  };

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
            className="form-control form-control-sm"
            placeholder="Search name or paste token Id or address"
          />
        </div>

        {warningMessage.length > 0 ? (
          <div className="alert alert-warning mt-5">
            <div className="d-flex align-items-center">
              <Icon name="warning" color="warning" />
              <p className="text-bold ms-3">Warning!</p>
            </div>
            <p className="mt-3">
              This token contains additional properites that could cause potential issues:
            </p>
            <ul className="list-default mt-2">
              {warningMessage.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {searchingResults ? (
          <div className="d-flex justify-content-center my-6">
            <Loader />
          </div>
        ) : null}

        {showNotFound && !searchingResults ? (
          <div className="text-center mt-5">
            <img src={search} alt="" />
            <h2 className="text-subheader mt-4">Not Found</h2>

            {showImportButton ? (
              <>
                <div className="mt-3 mb-5 d-flex justify-content-center align-items-center">
                  <p className="text-micro text-secondary">
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
                  <Tippy content="This token is not in our database, but you can add it by providing its tokenID or token address. After clicking Import, please specify the number of decimals for this token (i.e. ERC-20 = 18 decimals). Make sure you are providing the correct number of decimals. ">
                    <span className="ms-2">
                      <Icon size="small" color="gray" name="hint" />
                    </span>
                  </Tippy>
                </div>
                <Button onClick={handleImportButtonClick} type="primary" className="btn-sm">
                  Import
                </Button>
              </>
            ) : null}
          </div>
        ) : null}

        {readyToImportERC ? (
          <div className="d-flex align-items-end mt-5">
            <div className="flex-1">
              <div className="d-flex align-items-center mb-3">
                <p className="text-small">Decimals</p>
                <Tippy content="Number of decimals for this token. Make sure you are providing the correct number of decimals.">
                  <span className="ms-2">
                    <Icon color="gray" name="hint" />
                  </span>
                </Tippy>
              </div>
              <input
                className="form-control form-control-sm"
                type="text"
                value={decimals}
                onChange={handleDecimalsInputChange}
              />
            </div>
            <Button onClick={handleImportERC20ButtonClick} className="btn btn-sm btn-primary ms-3">
              Import
            </Button>
          </div>
        ) : null}

        {showTokenList && !searchingResults ? (
          <div className="mt-7">
            <h3 className="text-small">Token name</h3>
            <div className="container-scroll mt-3">
              {tokenList.reduce((acc: ReactNode[], token: ITokenData, index: number) => {
                //Currently we don't want to show WHBAR
                if (token.address !== process.env.REACT_APP_WHBAR_ADDRESS) {
                  acc.push(
                    <div
                      onClick={() => handleTokenListClick(token)}
                      className="cursor-pointer list-token-item d-flex align-items-center"
                      key={index}
                    >
                      <>
                        <div className="d-flex align-items-center">
                          <IconToken symbol={token.symbol} />
                          <div className="ms-3">
                            <div className="d-flex align-items-center">
                              <p className="text-main">{token.symbol}</p>
                              {renderWarningTooltip(token)}
                            </div>
                            <p className="text-small text-secondary">
                              {token.name}{' '}
                              {token.type !== TokenType.HBAR ? (
                                <span>({token.hederaId})</span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                      </>
                    </div>,
                  );
                }
                return acc;
              }, [])}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ModalSearchContent;
