import React, { useState, useEffect } from 'react';
import { IPairData, ITokenData, TokenType } from '../../interfaces/tokens';

import { useLazyQuery } from '@apollo/client';
import { GET_POOL_BY_TOKEN, GET_TOKEN_INFO } from '../../GraphQL/Queries';

import useTokens from '../../hooks/useTokens';

import Button from '../../components/Button';
import { idToAddress } from '../../utils/tokenUtils';

interface IModalProps {
  modalTitle?: string;
  closeModal: () => void;
  setTokensData: (prev: any) => void;
  setPairsData?: (prev: any) => void;
  tokenFieldId: string;
  defaultToken?: ITokenData;
}

const ModalSearchContent = ({
  closeModal,
  setTokensData,
  setPairsData,
  tokenFieldId,
  modalTitle,
  defaultToken,
}: IModalProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [currentToken, setCurrentToken] = useState<ITokenData>(defaultToken!);

  const [decimals, setDecimals] = useState(18);
  const [showDecimalsField, setShowDecimalsField] = useState(false);

  const [showAddresses, setShowAddresses] = useState(false);

  const [getTokenByAddressOrId, { data: dataTBI, loading: loadingTBI }] =
    useLazyQuery(GET_TOKEN_INFO);
  const [getPoolByToken, { data: dataPBT, loading: loadingPBT }] = useLazyQuery(GET_POOL_BY_TOKEN);

  const { tokens: tokenDataList, loading: loadingGT } = useTokens({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

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

  const handleSearchButtonClick = async () => {
    // TODO Make proper check for token id format
    if (!searchInputValue) return;

    const result = await getTokenByAddressOrId({
      variables: { id: searchInputValue },
    });

    // Temp check for not found tokend
    if (!result.data) {
      setShowDecimalsField(true);
      setCurrentToken((prev: any) => ({
        hederaId: searchInputValue,
        type: TokenType.ERC20,
        symbol: 'ERC20',
        name: 'Possible ERC20 Token',
        decimals,
        address: idToAddress(searchInputValue),
      }));
    }
  };

  const handleTokenListClick = (token: ITokenData) => {
    setCurrentToken(token);
  };

  const resetModalState = () => {
    setSearchInputValue('');
    setCurrentToken({} as ITokenData);
  };

  const handleSaveButton = () => {
    if (hasTokenData) {
      setTokensData((prev: any) => ({
        ...prev,
        [tokenFieldId]: currentToken,
      }));

      setPairsData &&
        dataPBT &&
        dataPBT.poolsByToken.length > 0 &&
        setPairsData((prev: any) => ({ ...prev, [tokenFieldId]: dataPBT.poolsByToken }));
    }

    resetModalState();
    closeModal();
  };

  const handleCloseClick = () => {
    resetModalState();
    closeModal();
  };

  /* Helper functions - to be removed */
  const copyAddress = (address: string) => {
    setSearchInputValue(address);
  };

  const handleToggleAddressesButtonClick = () => {
    setShowAddresses(prev => !prev);
  };
  /* Helper functions - to be removed */

  useEffect(() => {
    if (dataTBI) {
      const { getTokenInfo } = dataTBI;
      if (Object.keys(getTokenInfo).length > 0) {
        setCurrentToken({
          ...getTokenInfo,
          type: getTokenInfo.isHTS ? TokenType.HTS : TokenType.ERC20,
        });
      }
    }
  }, [dataTBI]);

  useEffect(() => {
    currentToken &&
      currentToken.address &&
      getPoolByToken({
        variables: { token: currentToken.address },
      });
  }, [currentToken, getPoolByToken]);

  useEffect(() => {
    setCurrentToken((prev: any) => ({
      ...prev,
      decimals,
    }));
  }, [decimals]);

  const hasTokenData = currentToken?.type;
  const hasPools = dataPBT && dataPBT.poolsByToken.length > 0;
  const hasTokenList = tokenDataList && tokenDataList.length > 0;

  return (
    <>
      <div className="modal-header">
        {modalTitle ? (
          <h5 className="modal-title" id="exampleModalLabel">
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
        {/* Helper - to be removed */}
        <div className="py-2">
          <Button className="btn-sm" onClick={handleToggleAddressesButtonClick}>
            Show addresses
          </Button>
        </div>
        {showAddresses ? (
          <div className="my-4">
            <div className="bg-slate p-3 rounded mb-4">
              <ul>
                <li>
                  0.0.447200 - HEX [HTS]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.447200')}>
                    📝
                  </span>
                </li>
                <li>
                  0.0.34741585 - USDT [HTS]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34741585')}>
                    📝
                  </span>
                </li>
                <li>
                  0.0.34741650 - WETH [HTS]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34741650')}>
                    📝
                  </span>
                </li>
                <li>
                  0.0.34741685 - WBTC [HTS]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34741685')}>
                    📝
                  </span>
                </li>

                <li>
                  0.0.34947702 - USDT [ERC20]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34947702')}>
                    📝
                  </span>
                </li>

                <li>
                  0.0.34838105 - WETH [ERC20]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34838105')}>
                    📝
                  </span>
                </li>

                <li>
                  0.0.34838117 - WBTC [ERC20]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34838117')}>
                    📝
                  </span>
                </li>

                <li>
                  0.0.34838123 - DOB [ERC20]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34838123')}>
                    📝
                  </span>
                </li>

                <li>
                  0.0.34948327 - EIGHT [ERC20]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34948327')}>
                    📝
                  </span>
                </li>
              </ul>
            </div>
            <label className="mb-2" htmlFor="">
              Token id
            </label>
            <div className="d-flex align-items-center">
              <input
                value={searchInputValue}
                onChange={onSearchInputChange}
                type="text"
                className="form-control me-3"
              />
              <Button
                loadingText={' '}
                loading={loadingPBT || loadingTBI || loadingGT}
                onClick={handleSearchButtonClick}
              >
                Search
              </Button>
            </div>
          </div>
        ) : null}
        {/* Helper - to be removed */}

        {hasTokenList ? (
          <div>
            <h3 className="text-title">Token list:</h3>
            <div className="mt-3 rounded border border-info p-3">
              {tokenDataList.map((token: ITokenData, index: number) => (
                <p
                  onClick={() => handleTokenListClick(token)}
                  className={`cursor-pointer rounded list-token-item py-2 px-3 d-flex align-items-center ${
                    currentToken.name === token.name ? 'is-selected' : ''
                  }`}
                  key={index}
                >
                  <img key={index} width={20} src={`/icons/${token.symbol}.png`} alt="" />{' '}
                  <span className="ms-2">
                    {token.symbol} [{token.type}]
                  </span>
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {hasTokenData ? (
          <>
            <p className="mt-4">Token data:</p>
            <div className="mt-2 bg-slate p-3 rounded d-flex align-items-center">
              <p className="flex-1">
                [{currentToken.type}]{currentToken.name} ({currentToken.symbol})
              </p>
              {showDecimalsField ? (
                <div className="flex-1">
                  <input
                    onChange={handleDecimalsInputChange}
                    type="number"
                    value={decimals}
                    className="form-control"
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {hasPools ? (
          <>
            <p className="mt-4">Token in pools:</p>
            <div className="mt-2 bg-slate p-3 rounded">
              {dataPBT.poolsByToken.map((pool: IPairData, index: number) => (
                <p key={index}>
                  {pool.pairName} ({pool.pairSymbol})
                </p>
              ))}
            </div>
          </>
        ) : null}
      </div>
      <div className="modal-footer">
        <button
          onClick={handleCloseClick}
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
        <button
          // disabled={!hasTokenData || !hasPools}
          onClick={handleSaveButton}
          type="button"
          className="btn btn-primary"
        >
          Save changes
        </button>
      </div>
    </>
  );
};

export default ModalSearchContent;
