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
import TransactionSettingsModalContent from '../components/Modals/TransactionSettingsModalContent';

import errorMessages from '../content/errors';
import {
  addressToId,
  checkAllowanceHTS,
  getUserAssociatedTokens,
  idToAddress,
  NATIVE_TOKEN,
} from '../utils/tokenUtils';
import {
  getTransactionSettings,
  INITIAL_SWAP_SLIPPAGE_TOLERANCE,
  handleSaveTransactionSettings,
} from '../utils/transactionUtils';
import { getConnectedWallet } from './Helpers';
import usePools from '../hooks/usePools';
import { MAX_UINT_ERC20, MAX_UINT_HTS } from '../constants';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  // State for modals
  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);
  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);

  const initialTokensData: ITokensData = {
    tokenA: NATIVE_TOKEN,
    tokenB: {} as ITokenData,
  };

  // State for token inputs
  const [tokensData, setTokensData] = useState<ITokensData>(initialTokensData);
  const [tokenInIsNative, setTokenInIsNative] = useState(false);
  const [tokenOutIsNative, setTokenOutIsNative] = useState(false);
  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);

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

  // State for associated
  const [associated, setAssociated] = useState(false);

  // State for common pool data
  const [selectedPoolData, setSelectedPoolData] = useState<IPairData>({} as IPairData);

  // Additional states for Swaps
  const [readyToSwap, setReadyToSwap] = useState(false);
  const [tokenInExactAmount, setTokenInExactAmount] = useState(true);

  // State for general error
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successSwap, setSuccessSwap] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);

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

    if (name === 'amountIn' && amountIn !== '0') {
      resIn = tokenInFirstAtPool ? token0Amount : token1Amount;
      resOut = tokenInFirstAtPool ? token1Amount : token0Amount;
      decIn = tokenInFirstAtPool ? token0Decimals : token1Decimals;
      decOut = tokenInFirstAtPool ? token1Decimals : token0Decimals;

      const swapAmountOut = sdk.getSwapAmountOut(amountIn, resIn, resOut, decIn, decOut);
      setTokenInExactAmount(true);
      setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
    } else if (name === 'amountOut' && amountOut !== '0') {
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

  const handleAssociateClick = async () => {
    const { tokenB } = tokensData;

    try {
      const receipt = await sdk.associateToken(
        hashconnectConnectorInstance,
        userId,
        tokenB.hederaId,
      );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        setAssociated(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage('Error on associate');
    } finally {
    }
  };

  const handleApproveClick = async () => {
    const { tokenA } = tokensData;

    const amount =
      tokenA.type === TokenType.ERC20 ? MAX_UINT_ERC20.toString() : MAX_UINT_HTS.toString();

    setLoadingApprove(true);

    try {
      const receipt = await sdk.approveToken(
        hashconnectConnectorInstance,
        amount,
        userId,
        tokenA.hederaId,
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
      setLoadingApprove(false);
    }
  };

  const handleSwapClick = async () => {
    const { tokenIdIn, tokenIdOut, amountIn, amountOut } = swapData;
    const { token0, token0Decimals, token1Decimals } = selectedPoolData;

    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS;
    const tokenInFirstAtPool = tokenInIsNative
      ? token0 === WHBARAddress
      : addressToId(token0) === tokenIdIn;

    const decIn = tokenInFirstAtPool ? token0Decimals : token1Decimals;
    const decOut = tokenInFirstAtPool ? token1Decimals : token0Decimals;

    setError(false);
    setErrorMessage('');
    setSuccessSwap(false);
    setSuccessMessage('');
    setLoadingSwap(true);

    const { swapSlippage, transactionExpiration } = getTransactionSettings();

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
            swapSlippage,
            transactionExpiration,
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
            swapSlippage,
            transactionExpiration,
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
            swapSlippage,
            transactionExpiration,
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
            swapSlippage,
            transactionExpiration,
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
            swapSlippage,
            transactionExpiration,
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
            swapSlippage,
            transactionExpiration,
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
        const successMessage = `Swap exactly ${swapData.amountIn} ${tokensData.tokenA.symbol} for ${swapData.amountOut} ${tokensData.tokenB.symbol}`;

        setSwapData(initialSwapData);
        setSelectedPoolData({} as IPairData);
        setTokensData(initialTokensData);
        setApproved(false);
        setAssociated(false);
        setSuccessSwap(true);
        setSuccessMessage(successMessage);
        refetch();
      }
    } catch (err) {
      console.error(`[Error on swap]: ${err}`);
      setError(true);
    } finally {
      setLoadingSwap(false);
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
    const getAllowanceERC20 = async (swapData: ISwapTokenData) => {
      const connectedWallet = getConnectedWallet();

      if (connectedWallet) {
        const tokenAddress = idToAddress(swapData.tokenIdIn);
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

    const getAllowanceHTS = async (userId: string) => {
      const amountToSpend = swapData.amountIn;
      const tokenAData: ITokenData = {
        hederaId: swapData.tokenIdIn,
        name: '',
        symbol: '',
        decimals: swapData.tokenInDecimals,
        address: '',
        type: tokensData.tokenA.type,
      };

      const canSpend = await checkAllowanceHTS(userId, tokenAData, amountToSpend);

      setApproved(canSpend);
    };

    const checkTokenAssociation = () => {
      const foundToken = userAssociatedTokens?.includes(tokensData.tokenB.hederaId);
      setAssociated(foundToken);
    };

    setApproved(tokensData.tokenA.type === TokenType.HBAR);
    setAssociated(
      tokensData.tokenB.type === TokenType.HBAR || tokensData.tokenB.type === TokenType.ERC20,
    );

    const hasTokenAData = swapData.tokenIdIn && swapData.amountIn !== '0';
    const hasTokenBData = swapData.tokenIdOut && swapData.amountOut !== '0';

    if (tokensData.tokenA.type === TokenType.ERC20 && hasTokenAData && userId) {
      getAllowanceERC20(swapData);
    }

    if (tokensData.tokenA.type === TokenType.HTS && hasTokenAData && userId) {
      getAllowanceHTS(userId);
    }

    if (
      tokensData.tokenB.type === TokenType.HTS &&
      hasTokenBData &&
      userId &&
      userAssociatedTokens
    ) {
      checkTokenAssociation();
    }
  }, [swapData, userId, sdk, tokensData, userAssociatedTokens]);

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

  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);

  const readyToApprove = Number(swapData.amountIn) > 0 && Number(swapData.amountOut);
  const readyToAssociate = Number(swapData.amountOut) > 0 && swapData.tokenIdOut;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        <div className="d-flex justify-content-end">
          <span className="cursor-pointer" onClick={() => setShowModalTransactionSettings(true)}>
            <img className="me-2" width={24} src={`/icons/settings.png`} alt="" />
          </span>
        </div>

        {showModalTransactionSettings ? (
          <Modal show={showModalTransactionSettings}>
            <TransactionSettingsModalContent
              modalTitle="Transaction settings"
              closeModal={() => setShowModalTransactionSettings(false)}
              slippage={getTransactionSettings().swapSlippage}
              expiration={getTransactionSettings().transactionExpiration}
              saveChanges={handleSaveTransactionSettings}
              defaultSlippageValue={INITIAL_SWAP_SLIPPAGE_TOLERANCE}
            />
          </Modal>
        ) : null}

        {error ? (
          <div className="alert alert-danger my-5" role="alert">
            <strong>Something went wrong!</strong>
            <p>{errorMessages[errorMessage]}</p>
          </div>
        ) : null}

        <div className="d-flex justify-content-between mt-3">
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

        {successSwap ? (
          <div className="alert alert-success alert-dismissible my-5" role="alert">
            <strong>Success swap!</strong>
            <p>{successMessage}</p>
            <button
              onClick={() => setSuccessSwap(false)}
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        ) : null}

        <div className="mt-5 d-flex justify-content-center">
          {loadingPools ? (
            <Loader />
          ) : readyToApprove ? (
            approved ? (
              <Button
                loading={loadingSwap}
                disabled={!readyToSwap || !associated}
                onClick={() => handleSwapClick()}
              >
                Swap
              </Button>
            ) : (
              <Button
                loading={loadingApprove}
                disabled={Number(swapData.amountIn) <= 0}
                onClick={() => handleApproveClick()}
              >
                Approve
              </Button>
            )
          ) : null}

          {readyToAssociate && !associated ? (
            <Button
              className="mx-2"
              loading={loadingSwap}
              disabled={!readyToAssociate}
              onClick={() => handleAssociateClick()}
            >
              Associate token
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Swap;
