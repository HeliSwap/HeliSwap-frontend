import React, { useState, useEffect } from 'react';
import { getTokenInfo, idToAddress } from '../../utils/tokenUtils';
import { ITokenData, IPairData } from '../../interfaces/tokens';

import { useLazyQuery } from '@apollo/client';
import { GET_POOL_BY_TOKEN } from '../../GraphQL/Queries';

import Button from '../../components/Button';

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
  const [findTokenLoading, setFindTokenLoading] = useState(false);
  const [foundTokenData, setFoundTokenData] = useState<ITokenData>({} as ITokenData);

  const [currentToken, setCurrentToken] = useState('');
  const [getPoolByToken, { data: dataPBT }] = useLazyQuery(GET_POOL_BY_TOKEN, {
    variables: { token: currentToken },
  });

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setSearchInputValue(value);
  };

  const handleSearchButtonClick = async () => {
    setFoundTokenData({} as ITokenData);

    // TODO Make proper check for token id format
    if (!searchInputValue) return;

    setFindTokenLoading(true);
    getPoolByToken();

    try {
      const result = await getTokenInfo(searchInputValue);
      const hasResults = Object.keys(result).length > 0;

      if (hasResults) {
        setFoundTokenData(result);
      } else {
        console.error('[Error on token search] Token id not found');

        // Let's assume that token is ECR20
        const resultObject = {
          decimals: 0,
          expiryTimestamp: '',
          name: 'Some ERC20 token',
          symbol: 'ERC20',
          tokenId: searchInputValue,
          totalSupply: '0',
        };

        setFoundTokenData(resultObject);
      }
    } catch (err) {
      console.error('[Error on token search request]', err);
    } finally {
      setFindTokenLoading(false);
    }
  };

  const resetModalState = () => {
    setSearchInputValue('');
    setFoundTokenData({} as ITokenData);
    setCurrentToken('');
  };

  const handleSaveButton = () => {
    setTokensData((prev: any) => ({ ...prev, [tokenFieldId]: foundTokenData }));
    setPairsData((prev: any) => ({ ...prev, [tokenFieldId]: dataPBT.poolsByToken }));

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
    Object.keys(foundTokenData).length > 0 && setCurrentToken(idToAddress(foundTokenData.tokenId));
  }, [foundTokenData]);

  const hasTokenData = Object.keys(foundTokenData).length > 0;
  const hasPools = dataPBT && dataPBT.poolsByToken.length > 0;

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
                  0.0.447200 - HEX{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.447200')}>
                    📝
                  </span>
                </li>
                <li>
                  0.0.34741585 - USDT{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34741585')}>
                    📝
                  </span>
                </li>
                <li>
                  0.0.34741650 - WETH{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34741650')}>
                    📝
                  </span>
                </li>
                <li>
                  0.0.34741685 - WBTC{' '}
                  <span className="cursor-pointer" onClick={() => copyAddress('0.0.34741685')}>
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
                loading={findTokenLoading}
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
                  {foundTokenData.name} ({foundTokenData.symbol})
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
          disabled={!hasTokenData}
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
