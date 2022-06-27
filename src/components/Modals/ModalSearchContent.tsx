import React, { useState, useEffect } from 'react';
import { IPairData, ITokenData, TokenType } from '../../interfaces/tokens';

import { useLazyQuery } from '@apollo/client';
import { GET_POOL_BY_TOKEN, GET_TOKEN_INFO } from '../../GraphQL/Queries';

import useTokens from '../../hooks/useTokens';

import { idToAddress } from '../../utils/tokenUtils';
import IconToken from '../IconToken';

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
  const [currentToken, setCurrentToken] = useState<ITokenData>(defaultToken!);

  const [decimals, setDecimals] = useState(18);
  const [showDecimalsField, setShowDecimalsField] = useState(false);

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
    setTokensData((prev: any) => ({
      ...prev,
      [tokenFieldId]: token,
    }));

    resetModalState();
    closeModal();
  };

  const resetModalState = () => {
    setSearchInputValue('');
    setCurrentToken({} as ITokenData);
  };

  const handleCloseClick = () => {
    resetModalState();
    closeModal();
  };

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
  const hasTokenList = tokenDataList && tokenDataList.length > 0;

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

        {hasTokenList ? (
          <div className="mt-7">
            <h3 className="text-small">Token name</h3>
            <div className="mt-5">
              {tokenDataList.map((token: ITokenData, index: number) => (
                <div
                  onClick={() => handleTokenListClick(token)}
                  className={`cursor-pointer list-token-item d-flex align-items-center ${
                    currentToken.name === token.name ? 'is-selected' : ''
                  }`}
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
