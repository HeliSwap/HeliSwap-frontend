import React, { useState, useEffect } from 'react';
import { IPairData, TokenType } from '../../interfaces/tokens';

import { useLazyQuery } from '@apollo/client';
import { GET_POOL_BY_TOKEN, GET_TOKEN_INFO } from '../../GraphQL/Queries';

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
  const [currentToken, setCurrentToken] = useState('');

  const [getTokenByAddressOrId, { data: dataTBI, loading: loadingTBI }] =
    useLazyQuery(GET_TOKEN_INFO);

  const [getPoolByToken, { data: dataPBT, loading: loadingPBT }] = useLazyQuery(GET_POOL_BY_TOKEN);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setSearchInputValue(value);
  };

  const handleSearchButtonClick = async () => {
    // TODO Make proper check for token id format
    if (!searchInputValue) return;

    setCurrentToken(prev => searchInputValue);

    const result = await getTokenByAddressOrId({
      variables: { id: searchInputValue },
    });

    // Temp check for not found tokend
    if (!result.data) {
      setTokensData((prev: any) => ({
        ...prev,
        [tokenFieldId]: { hederaId: searchInputValue, type: TokenType.ERC20, symbol: 'ERC20' },
      }));
    }
  };

  const resetModalState = () => {
    setSearchInputValue('');
    setCurrentToken('');
  };

  const handleSaveButton = () => {
    if (hasTokenData && hasPools) {
      setTokensData((prev: any) => ({
        ...prev,
        [tokenFieldId]: { ...dataTBI.getTokenInfo, type: TokenType.ERC20 },
      }));
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
    dataTBI &&
      Object.keys(dataTBI.getTokenInfo).length > 0 &&
      setCurrentToken(dataTBI.getTokenInfo.address);
  }, [dataTBI]);

  useEffect(() => {
    getPoolByToken({
      variables: { token: currentToken },
    });
  }, [currentToken, getPoolByToken]);

  const hasTokenData = dataTBI && Object.keys(dataTBI.getTokenInfo).length > 0;
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
                loading={loadingPBT || loadingTBI}
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
                  {dataTBI.getTokenInfo.name} ({dataTBI.getTokenInfo.symbol})
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
