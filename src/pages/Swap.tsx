import React, { useState, useEffect, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import {
  ITokenData,
  ISwapTokenData,
  IPairData,
  TokenType,
  ITokensData,
} from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import WalletBalance from '../components/WalletBalance';

import errorMessages from '../content/errors';
import { addressToId, idToAddress, NATIVE_TOKEN } from '../utils/tokenUtils';
import { getConnectedWallet } from './Helpers';
import usePools from '../hooks/usePools';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);

  const [tokensData, setTokensData] = useState<ITokensData>({
    tokenA: NATIVE_TOKEN,
    tokenB: {} as ITokenData,
  });

  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '',
    amountOut: '',
    tokenInDecimals: 0,
    tokenOutDecimals: 0,
  };

  const { pools: poolsData, loading: loadingPools } = usePools({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const [selectedPoolData, setSelectedPoolData] = useState<IPairData>({} as IPairData);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [swapData, setSwapData] = useState(initialSwapData);

  const [approved, setApproved] = useState(true);

  const [tokenInExactAmount, setTokenInExactAmount] = useState(true);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    const tokenData = {
      [name]: value,
    };

    const { amountIn, amountOut } = tokenData;
    const { tokenIdIn, tokenIdOut } = swapData;
    const { token0Amount, token1Amount, token0Decimals, token1Decimals } = selectedPoolData;

    if (Object.keys(selectedPoolData).length === 0) return;

    const tokenInFirstAtPool = addressToId(selectedPoolData.token0) === tokenIdIn;
    const tokenOutFirstAtPool = addressToId(selectedPoolData.token0) === tokenIdOut;

    let resIn, resOut, decIn, decOut;

    if (tokenIdIn && amountIn) {
      resIn = tokenInFirstAtPool ? token0Amount : token1Amount;
      resOut = tokenInFirstAtPool ? token1Amount : token0Amount;
      decIn = tokenInFirstAtPool ? token0Decimals : token1Decimals;
      decOut = tokenInFirstAtPool ? token1Decimals : token0Decimals;

      const swapAmountOut = sdk.getSwapAmountOut(amountIn, resIn, resOut, decIn, decOut);
      setTokenInExactAmount(true);
      setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
    } else if (tokenIdOut && amountOut) {
      resIn = tokenOutFirstAtPool ? token1Amount : token0Amount;
      resOut = tokenOutFirstAtPool ? token0Amount : token1Amount;
      decIn = tokenOutFirstAtPool ? token1Decimals : token0Decimals;
      decOut = tokenOutFirstAtPool ? token0Decimals : token1Decimals;

      const swapAmountIn = sdk.getSwapAmountIn(amountOut, resIn, resOut, decIn, decOut);

      setTokenInExactAmount(false);
      setSwapData(prev => ({ ...prev, ...tokenData, amountIn: swapAmountIn.toString() }));
    } else {
      setSwapData(prev => ({ ...prev, amountIn: '', amountOut: '' }));
    }
  };

  const handleApproveClick = async () => {
    const hederaId = swapData.tokenIdIn;

    try {
      const receipt = await sdk.approveToken(
        hashconnectConnectorInstance,
        userId,
        hederaId,
        swapData.amountIn,
      );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        setApproved(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage('Error on create');
    } finally {
    }
  };

  const handleSwapClick = async () => {
    const { tokenIdIn, tokenIdOut, amountIn, amountOut } = swapData;
    const { token0, token0Decimals, token1Decimals } = selectedPoolData;

    const tokenInSamePool = tokenIdIn === addressToId(token0);

    const decIn = tokenInSamePool ? token0Decimals : token1Decimals;
    const decOut = tokenInSamePool ? token1Decimals : token0Decimals;

    try {
      let receipt;
      if (tokenInExactAmount) {
        receipt = await sdk.swapExactTokensForTokens(
          hashconnectConnectorInstance,
          userId,
          tokenIdIn,
          tokenIdOut,
          amountIn,
          amountOut,
          decIn,
          decOut,
        );
      } else {
        receipt = await sdk.swapTokensForExactTokens(
          hashconnectConnectorInstance,
          userId,
          tokenIdIn,
          tokenIdOut,
          amountIn,
          amountOut,
          decIn,
          decOut,
        );
      }

      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        setSwapData(initialSwapData);
      }
    } catch (err) {
      console.error(`[Error on swap]: ${err}`);
      setError(true);
    } finally {
    }
  };

  useEffect(() => {
    if (swapData.tokenIdIn && swapData.tokenIdOut && poolsData && poolsData.length > 0) {
      const tokenInAddress = idToAddress(swapData.tokenIdIn);
      const tokenOutAddress = idToAddress(swapData.tokenIdOut);

      const selectedPoolData = poolsData.filter((pool: any) => {
        return (
          //Both tokens are in the same pool
          (pool.token0 === tokenInAddress || pool.token1 === tokenInAddress) &&
          (pool.token0 === tokenOutAddress || pool.token1 === tokenOutAddress)
        );
      });

      setSelectedPoolData(selectedPoolData[0]);
    } else {
      setSelectedPoolData({} as IPairData);
    }
  }, [poolsData, swapData]);

  useEffect(() => {
    const getApproved = async (tokenId: string) => {
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

        setApproved(resultNum >= 1000);
      } else {
        setApproved(false);
      }
    };

    if (
      tokensData.tokenA.type !== TokenType.HBAR &&
      swapData &&
      swapData.tokenIdIn !== '' &&
      userId
    ) {
      getApproved(swapData.tokenIdIn);
    }
  }, [swapData, userId, sdk, tokensData]);

  useEffect(() => {
    const { tokenA, tokenB } = tokensData;

    if (
      (tokenA && typeof tokenA.hederaId !== 'undefined') ||
      (tokenB && typeof tokenB.hederaId !== 'undefined')
    ) {
      const newSwapData = {
        tokenIdIn: tokenA.hederaId,
        tokenIdOut: tokenB.hederaId,
        tokenInDecimals: tokenA.decimals,
        tokenOutDecimals: tokenB.decimals,
      };

      setSwapData(prev => ({ ...prev, ...newSwapData }));
    }
  }, [tokensData]);

  const canSwap = swapData.amountIn !== '' && swapData.amountOut !== '';

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        {/* {errorGT ? (
          <div className="alert alert-danger mb-5" role="alert">
            <strong>Something went wrong!</strong> Cannot get pairs...
          </div>
        ) : null} */}
        {error ? (
          <div className="alert alert-danger my-5" role="alert">
            <strong>Something went wrong!</strong>
            <p>{errorMessages[errorMessage]}</p>
          </div>
        ) : null}

        <div className="d-flex justify-content-between mt-5">
          <span className="badge bg-primary text-uppercase">From</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-7">
            <div className="input-container">
              <input
                value={swapData.amountIn}
                name="amountIn"
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
                <div className="d-flex align-items-center">
                  <img
                    className="me-2"
                    width={24}
                    src={`/icons/${tokensData.tokenA.symbol}.png`}
                    alt=""
                  />
                  <span className="me-2">{tokensData.tokenA.symbol}</span>
                </div>
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
                closeModal={() => setShowModalA(false)}
                defaultToken={NATIVE_TOKEN}
              />
            </Modal>
            {userId && tokensData?.tokenA ? (
              <WalletBalance userId={userId} tokenData={tokensData.tokenA} />
            ) : null}
          </div>
        </div>

        <div className="d-flex justify-content-between mt-5">
          <span className="badge bg-info text-uppercase">To</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-7">
            <div className="input-container">
              <input
                value={swapData.amountOut}
                name="amountOut"
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
                <div className="d-flex align-items-center">
                  <img
                    className="me-2"
                    width={24}
                    src={`/icons/${tokensData.tokenB.symbol}.png`}
                    alt=""
                  />
                  <span className="me-2">{tokensData.tokenB.symbol}</span>
                </div>
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
                closeModal={() => setShowModalB(false)}
              />
            </Modal>
            {tokensData?.tokenB ? (
              <WalletBalance userId={userId} tokenData={tokensData.tokenB} />
            ) : null}
          </div>
        </div>

        <div className="mt-5 d-flex justify-content-center">
          {loadingPools ? (
            <Loader />
          ) : canSwap ? (
            approved ? (
              <Button onClick={() => handleSwapClick()}>Swap</Button>
            ) : (
              <Button onClick={() => handleApproveClick()}>Approve</Button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Swap;
