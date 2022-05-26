import React, { useState, useEffect } from 'react';
import { IPairData, ITokenData, TokenType } from '../../interfaces/tokens';

import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_POOL_BY_TOKEN, GET_TOKEN_INFO, GET_TOKENS } from '../../GraphQL/Queries';

import Button from '../../components/Button';
import { idToAddress } from '../../utils/tokenUtils';

interface IModalProps {
  modalTitle?: string;
  closeModal: () => void;
  setTokensData: (prev: any) => void;
  setPairsData: (prev: any) => void;
  tokenFieldId: string;
}

const ModalSearchContent = ({
  closeModal,
  setTokensData,
  setPairsData,
  tokenFieldId,
  modalTitle,
}: IModalProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [currentToken, setCurrentToken] = useState<ITokenData>({} as ITokenData);
  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>();

  const [getTokenByAddressOrId, { data: dataTBI, loading: loadingTBI }] =
    useLazyQuery(GET_TOKEN_INFO);
  const [getPoolByToken, { data: dataPBT, loading: loadingPBT }] = useLazyQuery(GET_POOL_BY_TOKEN);
  const { data: dataGT, loading: loadingGT } = useQuery(GET_TOKENS);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setSearchInputValue(value);
  };

  const handleSearchButtonClick = async () => {
    // TODO Make proper check for token id format
    if (!searchInputValue) return;

    const result = await getTokenByAddressOrId({
      variables: { id: searchInputValue },
    });

    // Temp check for not found tokend
    if (!result.data) {
      setCurrentToken((prev: any) => ({
        hederaId: searchInputValue,
        type: TokenType.ERC20,
        symbol: 'ERC20',
        name: 'Possible ERC20 Token',
        decimals: 18,
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

  const copyAddress = (address: string) => {
    setSearchInputValue(address);
  };

  useEffect(() => {
    if (dataGT) {
      const { getTokensData } = dataGT;

      const nativeToken = {
        hederaId: '',
        name: 'HBAR',
        symbol: 'HBAR',
        address: '',
        decimals: 18,
        totalSupply: '',
        expiryTimestamp: '',
        type: TokenType.HBAR,
      };

      if (getTokensData.length > 0) {
        const foundTokenDataList = getTokensData.map((item: any) => ({
          hederaId: item.hederaId,
          name: item.name,
          symbol: item.symbol,
          address: item.address,
          decimals: item.decimals,
          totalSupply: '',
          expiryTimestamp: '',
          type: item.isHTS ? TokenType.HTS : TokenType.ERC20,
        }));

        setTokenDataList([nativeToken, ...foundTokenDataList]);
      } else {
        setTokenDataList([nativeToken]);
      }
    }
  }, [dataGT]);

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
    getPoolByToken({
      variables: { token: currentToken.address },
    });
  }, [currentToken, getPoolByToken]);

  const hasTokenData = Object.keys(currentToken).length > 0;
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
        <div className="p-4">
          <div>
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
                  0.0.34838032 - USDT [ERC20]{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34838032')}>
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
          {hasTokenData ? (
            <>
              <p className="mt-4">Token data:</p>
              <div className="mt-2 bg-slate p-3 rounded">
                <p>
                  [{currentToken.type}]{currentToken.name} ({currentToken.symbol})
                </p>
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

          {hasTokenList ? (
            <div className="mt-4">
              <h3 className="text-title">Token list:</h3>
              <div className="mt-3 rounded border border-warning p-3">
                {tokenDataList.map((token: ITokenData, index: number) => (
                  <p
                    onClick={() => handleTokenListClick(token)}
                    className="cursor-pointer"
                    key={index}
                  >
                    [{token.type}] {token.symbol}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
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
