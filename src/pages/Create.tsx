import React, { useState, useEffect, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { ITokenData, TokenType } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import WalletBalance from '../components/WalletBalance';
import { ICreatePairData } from '../interfaces/comon';
import { IPairData } from '../interfaces/tokens';

import errorMessages from '../content/errors';
import { idToAddress } from '../utils/tokenUtils';
import { formatStringToBigNumberEthersWei } from '../utils/numberUtils';
import { getConnectedWallet } from './Helpers';

interface ITokensData {
  tokenA: ITokenData;
  tokenB: ITokenData;
  [key: string]: ITokenData;
}
interface ITokensPairData {
  tokenA: IPairData[];
  tokenB: IPairData[];
}

const Create = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);

  const [isProvideLoading, setProvideLoading] = useState(false);

  const [tokensData, setTokensData] = useState<ITokensData>({
    tokenA: {} as ITokenData,
    tokenB: {} as ITokenData,
  });

  const [pairsData, setPairsData] = useState<ITokensPairData>({
    tokenA: [],
    tokenB: [],
  });

  const [poolData, setPoolData] = useState<IPairData>();

  const [createPairData, setCreatePairData] = useState<ICreatePairData>({
    tokenAAmount: '0',
    tokenBAmount: '0',
    tokenAId: '',
    tokenBId: '',
    tokenADecimals: 18,
    tokenBDecimals: 18,
  });

  const [approved, setApproved] = useState({
    tokenA: false,
    tokenB: false,
  });

  const [readyToProvide, setReadyToProvide] = useState(false);
  const [tokensInSamePool, setTokensInSamePool] = useState(false);
  const [provideNative, setProvideNative] = useState(false);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    if (tokensInSamePool) {
      const token0Amount = poolData?.token0Amount as string;
      const token1Amount = poolData?.token1Amount as string;
      const token0Decimals = poolData?.token0Decimals;
      const token1Decimals = poolData?.token1Decimals;

      const token0AmountBN = formatStringToBigNumberEthersWei(token0Amount, token0Decimals);
      const token1AmountBN = formatStringToBigNumberEthersWei(token1Amount, token1Decimals);

      const valueBN = formatStringToBigNumberEthersWei(value, token0Decimals);
      const keyToUpdate = name === 'tokenAAmount' ? 'tokenBAmount' : 'tokenAAmount';
      const valueToUpdate = valueBN.mul(token1AmountBN).div(token0AmountBN);

      setCreatePairData(prev => ({
        ...prev,
        [keyToUpdate]: hethers.utils
          .formatUnits(valueToUpdate, poolData?.token1Decimals)
          .toString(),
        [name]: value,
      }));
    } else {
      setCreatePairData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApproveClick = async (key: string) => {
    const { hederaId } = tokensData[key];

    try {
      const receipt = await sdk.approveToken(hashconnectConnectorInstance, userId, hederaId);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        setApproved(prev => ({ ...prev, [key]: true }));
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage('Error on create');
    } finally {
      setProvideLoading(false);
    }
  };

  const handleCreateClick = async () => {
    setProvideLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      //TODO add logic for adding native liquidity
      const receipt = provideNative
        ? await sdk.addNativeLiquidity(hashconnectConnectorInstance, userId, createPairData)
        : await sdk.addLiquidity(hashconnectConnectorInstance, userId, createPairData);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        setTokensData({
          tokenA: {} as ITokenData,
          tokenB: {} as ITokenData,
        });

        setPairsData({
          tokenA: [],
          tokenB: [],
        });

        setCreatePairData({
          tokenAAmount: '0',
          tokenBAmount: '0',
          tokenAId: '',
          tokenBId: '',
          tokenADecimals: 18,
          tokenBDecimals: 18,
        });
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage('Error on create');
    } finally {
      setProvideLoading(false);
    }
  };

  useEffect(() => {
    const getApproved = async (tokenId: string, index: string) => {
      const connectedWallet = getConnectedWallet();
      if (connectedWallet) {
        const tokenAddress = idToAddress(tokenId);
        const userAddress = idToAddress(userId);
        const resultBN = await sdk.checkAllowance(
          tokenAddress,
          userAddress,
          process.env.REACT_APP_ROUTER_ADDRESS as string,
          connectedWallet,
        );

        const resultStr = hethers.utils.formatUnits(resultBN, 18);
        const resultNum = Number(resultStr);

        setApproved(prev => ({ ...prev, [index]: resultNum >= 1000 }));
      } else {
        setApproved(prev => ({ ...prev, [index]: false }));
      }
    };

    const { tokenA, tokenB } = tokensData;
    const newPairData = {
      tokenAId: tokenA.hederaId,
      tokenBId: tokenB.hederaId,
      tokenADecimals: tokenA.decimals,
      tokenBDecimals: tokenB.decimals,
    };

    if (tokenA.type === TokenType.HBAR) {
      setApproved(prev => ({ ...prev, tokenA: true }));
    } else {
      tokenA.hederaId && getApproved(tokenA.hederaId, 'tokenA');
    }

    if (tokenB.type === TokenType.HBAR) {
      setApproved(prev => ({ ...prev, tokenB: true }));
    } else {
      tokenB.hederaId && getApproved(tokenB.hederaId, 'tokenB');
    }

    setCreatePairData(prev => ({ ...prev, ...newPairData }));
  }, [tokensData, sdk, userId]);

  useEffect(() => {
    let inSamePool = false;
    const { tokenA: pairsTokenA, tokenB: pairsTokenB } = pairsData;
    const { tokenA, tokenB } = tokensData;

    const provideNative = tokenA.type === TokenType.HBAR || tokenB.type === TokenType.HBAR;

    // Check for same pool
    // TODO - To be optimized
    pairsTokenA.forEach(poolA => {
      pairsTokenB.forEach(poolB => {
        if (poolA.pairAddress === poolB.pairAddress) {
          inSamePool = true;
          setPoolData(poolA);
        }
      });
    });

    setProvideNative(provideNative);
    setTokensInSamePool(inSamePool);
  }, [pairsData, tokensData]);

  useEffect(() => {
    let isReady = true;

    // TODO - Stupid check, to be improved!!
    if (!provideNative) {
      Object.values(createPairData).forEach(item => {
        if (item === '0' || item === '' || typeof item === 'undefined') {
          isReady = false;
        }
      });
    }

    setReadyToProvide(isReady);
  }, [createPairData, provideNative]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        {error ? (
          <div className="alert alert-danger my-5" role="alert">
            <strong>Something went wrong!</strong>
            <p>{errorMessages[errorMessage]}</p>
          </div>
        ) : null}

        <div className="d-flex justify-content-between">
          <span className="badge bg-primary text-uppercase">Token A</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-7">
            <div className="input-container">
              <input
                value={createPairData.tokenAAmount}
                name="tokenAAmount"
                onChange={handleInputChange}
                type="text"
                className="form-control mt-2"
              />
            </div>
            <p className="text-success mt-3">$0.00</p>
          </div>

          <div className="col-5">
            <div className="container-token-selector d-flex justify-content-between align-items-center">
              {tokensData?.tokenA.symbol ? (
                <span className="me-2">{tokensData?.tokenA.symbol}</span>
              ) : (
                <span>N/A</span>
              )}

              <Button onClick={() => setShowModalA(true)}>Select token</Button>
            </div>
            <Modal show={showModalA}>
              <ModalSearchContent
                modalTitle="Select token"
                tokenFieldId="tokenA"
                setTokensData={setTokensData}
                setPairsData={setPairsData}
                closeModal={() => setShowModalA(false)}
              />
            </Modal>
            {tokensData?.tokenA ? (
              <WalletBalance userId={userId} tokenData={tokensData.tokenA} />
            ) : null}
          </div>
        </div>

        <div className="d-flex justify-content-between mt-5">
          <span className="badge bg-info text-uppercase">Token B</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-7">
            <div className="input-container">
              <input
                value={createPairData.tokenBAmount}
                name="tokenBAmount"
                onChange={handleInputChange}
                type="text"
                className="form-control mt-2"
              />
            </div>
            <p className="text-success mt-3">$0.00</p>
          </div>

          <div className="col-5">
            <div className="container-token-selector d-flex justify-content-between align-items-center">
              {tokensData?.tokenB.symbol ? (
                <span className="me-2">{tokensData?.tokenB.symbol}</span>
              ) : (
                <span>N/A</span>
              )}

              <Button onClick={() => setShowModalB(true)}>Select token</Button>
            </div>
            <Modal show={showModalB}>
              <ModalSearchContent
                modalTitle="Select token"
                tokenFieldId="tokenB"
                setTokensData={setTokensData}
                setPairsData={setPairsData}
                closeModal={() => setShowModalB(false)}
              />
            </Modal>
            {tokensData?.tokenB ? (
              <WalletBalance userId={userId} tokenData={tokensData.tokenB} />
            ) : null}
          </div>
        </div>

        {readyToProvide ? (
          <div className="bg-slate rounded p-4 my-4">
            {tokensInSamePool ? (
              <div>
                <p>Prices and pool share</p>
              </div>
            ) : (
              <div>
                <p>Initial prices</p>
                <div className="mt-3 d-flex justify-content-around rounded border border-success p-2">
                  <div className="text-center">
                    <p>
                      <span className="text-title">
                        {Number(createPairData.tokenBAmount) / Number(createPairData.tokenAAmount)}
                      </span>
                    </p>
                    <p>
                      {tokensData.tokenB.symbol} per {tokensData.tokenA.symbol}
                    </p>
                  </div>
                  <div className="text-center">
                    <p>
                      <span className="text-title">
                        {Number(createPairData.tokenAAmount) / Number(createPairData.tokenBAmount)}
                      </span>
                    </p>
                    <p>
                      {tokensData.tokenA.symbol} per {tokensData.tokenB.symbol}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-5 d-flex justify-content-center">
          {tokensData.tokenA.hederaId && !approved.tokenA ? (
            <Button
              onClick={() => handleApproveClick('tokenA')}
              className="mx-2"
            >{`Approve ${tokensData.tokenA.symbol}`}</Button>
          ) : null}

          {tokensData.tokenB.hederaId && !approved.tokenB ? (
            <Button
              onClick={() => handleApproveClick('tokenB')}
              className="mx-2"
            >{`Approve ${tokensData.tokenB.symbol}`}</Button>
          ) : null}

          {approved.tokenA && approved.tokenB ? (
            tokensInSamePool ? (
              <Button
                loading={isProvideLoading}
                disabled={!readyToProvide}
                onClick={handleCreateClick}
              >
                Provide
              </Button>
            ) : (
              <Button
                loading={isProvideLoading}
                disabled={!readyToProvide}
                onClick={handleCreateClick}
              >
                Create
              </Button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Create;
