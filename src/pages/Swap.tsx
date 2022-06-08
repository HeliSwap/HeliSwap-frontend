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

  // State for modals
  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);

  const initialTokensData: ITokensData = {
    tokenA: NATIVE_TOKEN,
    tokenB: {} as ITokenData,
  };

  // State for token inputs
  const [tokensData, setTokensData] = useState<ITokensData>(initialTokensData);
  const [tokenInIsNative, setTokenInIsNative] = useState(false);
  const [tokenOutIsNative, setTokenOutIsNative] = useState(false);

  // State for pools
  const {
    pools: poolsData,
    loading: loadingPools,
    refetch,
  } = usePools({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '0',
    amountOut: '0',
    tokenInDecimals: 0,
    tokenOutDecimals: 0,
  };

  // State for Swap
  const [swapData, setSwapData] = useState(initialSwapData);

  // State for approved
  const [approved, setApproved] = useState(false);

  // State for common pool data
  const [selectedPoolData, setSelectedPoolData] = useState<IPairData>({} as IPairData);

  // Additional states for Swaps
  const [readyToSwap, setReadyToSwap] = useState(false);
  const [tokenInExactAmount, setTokenInExactAmount] = useState(true);

  // State for general error
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    const tokenData = {
      [name]: value,
    };

    const { amountIn, amountOut } = tokenData;
    const { tokenIdIn, tokenIdOut } = swapData;
    const { token0Amount, token1Amount, token0Decimals, token1Decimals } = selectedPoolData;

    if (Object.keys(selectedPoolData).length === 0) return;

    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS;

    const tokenInFirstAtPool = tokenInIsNative
      ? selectedPoolData.token0 === WHBARAddress
      : addressToId(selectedPoolData.token0) === tokenIdIn;
    const tokenOutFirstAtPool = tokenOutIsNative
      ? selectedPoolData.token0 === WHBARAddress
      : addressToId(selectedPoolData.token0) === tokenIdOut;

    let resIn, resOut, decIn, decOut;

    if ((tokenIdIn || tokenInIsNative) && amountIn !== '0') {
      resIn = tokenInFirstAtPool ? token0Amount : token1Amount;
      resOut = tokenInFirstAtPool ? token1Amount : token0Amount;
      decIn = tokenInFirstAtPool ? token0Decimals : token1Decimals;
      decOut = tokenInFirstAtPool ? token1Decimals : token0Decimals;

      const swapAmountOut = sdk.getSwapAmountOut(amountIn, resIn, resOut, decIn, decOut);
      setTokenInExactAmount(true);
      setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
    } else if ((tokenIdOut || tokenOutIsNative) && amountOut !== '0') {
      resIn = tokenOutFirstAtPool ? token1Amount : token0Amount;
      resOut = tokenOutFirstAtPool ? token0Amount : token1Amount;
      decIn = tokenOutFirstAtPool ? token1Decimals : token0Decimals;
      decOut = tokenOutFirstAtPool ? token0Decimals : token1Decimals;

      const swapAmountIn = sdk.getSwapAmountIn(amountOut, resIn, resOut, decIn, decOut);

      setTokenInExactAmount(false);
      setSwapData(prev => ({ ...prev, ...tokenData, amountIn: swapAmountIn.toString() }));
    } else {
      setSwapData(prev => ({ ...prev, amountIn: '0', amountOut: '0' }));
    }
  };

  const handleApproveClick = async () => {
    const { tokenA } = tokensData;

    try {
      const receipt = await sdk.approveToken(
        hashconnectConnectorInstance,
        userId,
        tokenA.hederaId,
        swapData.amountIn,
        tokenA.decimals,
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

    setError(false);
    setErrorMessage('');

    try {
      let receipt;
      if (tokenInExactAmount) {
        if (tokenInIsNative) {
          receipt = await sdk.swapExactHBARForTokens(
            hashconnectConnectorInstance,
            userId,
            tokenIdOut,
            amountIn,
            amountOut,
            decOut,
          );
        } else if (tokenOutIsNative) {
          receipt = await sdk.swapExactTokensForHBAR(
            hashconnectConnectorInstance,
            userId,
            tokenIdIn,
            amountIn,
            amountOut,
            decIn,
            decOut,
          );
        } else {
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
        }
      } else {
        if (tokenInIsNative) {
          receipt = await sdk.swapHBARForExactTokens(
            hashconnectConnectorInstance,
            userId,
            tokenIdOut,
            amountIn,
            amountOut,
            decOut,
          );
        } else if (tokenOutIsNative) {
          receipt = await sdk.swapTokensForExactHBAR(
            hashconnectConnectorInstance,
            userId,
            tokenIdIn,
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
      }

      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        setSwapData(initialSwapData);
        setSelectedPoolData({} as IPairData);
        setTokensData(initialTokensData);
        setApproved(false);
        refetch();
      }
    } catch (err) {
      console.error(`[Error on swap]: ${err}`);
      setError(true);
    } finally {
    }
  };

  useEffect(() => {
    refetch();
    const { tokenA, tokenB } = tokensData;

    const tokenInIsNative = tokenA.type === TokenType.HBAR;
    const tokenOutIsNative = tokenB.type === TokenType.HBAR;
    setTokenInIsNative(tokenInIsNative);
    setTokenOutIsNative(tokenOutIsNative);

    if (poolsData && poolsData.length > 0) {
      const provideNative = tokenInIsNative || tokenOutIsNative;
      const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS as string;

      const selectedPoolData = poolsData.filter((pool: any) => {
        let poolMatchedBothTokens = false;

        const poolContainsToken = (tokenAddres: string) => {
          return pool.token0 === tokenAddres || pool.token1 === tokenAddres;
        };

        if (provideNative) {
          poolMatchedBothTokens =
            poolContainsToken(WHBARAddress) &&
            (poolContainsToken(tokenA.address) || poolContainsToken(tokenB.address));
        } else {
          //Both tokens are in the same pool
          poolMatchedBothTokens =
            poolContainsToken(tokenA.address) && poolContainsToken(tokenB.address);
        }
        return poolMatchedBothTokens;
      });

      setSelectedPoolData(selectedPoolData[0] || {});
    } else {
      setSelectedPoolData({} as IPairData);
    }
  }, [poolsData, tokensData, refetch]);

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

        const resultStr = hethers.utils.formatUnits(resultBN, swapData.tokenInDecimals);
        const resultNum = Number(resultStr);

        setApproved(resultNum >= Number(swapData.amountIn));
      } else {
        setApproved(false);
      }
    };

    setApproved(tokensData.tokenA.type === TokenType.HBAR);

    if (tokensData.tokenA.type === TokenType.ERC20 && swapData && userId) {
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

  useEffect(() => {
    let ready = true;

    // First token needs to be approved
    if (!approved) {
      ready = false;
    }

    // Token amounts need to be gt 0
    if (swapData.amountIn === '0' || swapData.amountOut === '0') {
      ready = false;
    }

    setReadyToSwap(ready);
  }, [swapData, approved]);

  const readyToApprove = Number(swapData.amountIn) > 0 && Number(swapData.amountOut);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
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
          ) : readyToApprove ? (
            approved ? (
              <Button disabled={!readyToSwap} onClick={() => handleSwapClick()}>
                Swap
              </Button>
            ) : (
              <Button
                disabled={Number(swapData.amountIn) <= 0}
                onClick={() => handleApproveClick()}
              >
                Approve
              </Button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Swap;
