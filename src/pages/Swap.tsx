import React, { useState, useEffect, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { ITokenData, ISwapTokenData, TokenType, ITokensData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import WalletBalance from '../components/WalletBalance';
import InputTokenSelector from '../components/InputTokenSelector';
import TransactionSettingsModalContent from '../components/Modals/TransactionSettingsModalContent';

import errorMessages from '../content/errors';
import {
  checkAllowanceHTS,
  getTokenBalance,
  getUserAssociatedTokens,
  idToAddress,
  NATIVE_TOKEN,
} from '../utils/tokenUtils';
import {
  getTransactionSettings,
  INITIAL_SWAP_SLIPPAGE_TOLERANCE,
  handleSaveTransactionSettings,
} from '../utils/transactionUtils';
import {
  getPossibleTradesExactIn,
  getPossibleTradesExactOut,
  tradeComparator,
} from '../utils/tradeUtils';
import { getConnectedWallet } from './Helpers';
import usePools from '../hooks/usePools';
import { MAX_UINT_ERC20, MAX_UINT_HTS } from '../constants';
import InputToken from '../components/InputToken';
import ButtonSelector from '../components/ButtonSelector';

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
  const [willWrapTokens, setWillWrapTokens] = useState(false);
  const [willUnwrapTokens, setWillUnwrapTokens] = useState(false);
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

  // State for token balances
  const initialBallanceData = {
    tokenA: '0.00',
    tokenB: '0.00',
  };
  const [tokenBalances, setTokenBalances] = useState(initialBallanceData);

  // Additional states for Swaps
  const [readyToApprove, setReadyToApprove] = useState(false);
  const [readyToAssociate, setReadyToAssociate] = useState(false);
  const [readyToSwap, setReadyToSwap] = useState(false);
  const [tokenInExactAmount, setTokenInExactAmount] = useState(true);
  const [bestPath, setBestPath] = useState<string[]>([]);

  // State for general error
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successSwap, setSuccessSwap] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);

  const handleInputChange = async (value: string, name: string) => {
    const { tokenA, tokenB } = tokensData;

    const tokenData = {
      [name]: value,
    };

    const invalidInputTokensData =
      !value ||
      isNaN(Number(value)) ||
      Object.keys(tokenA).length === 0 ||
      Object.keys(tokenB).length === 0;

    if (invalidInputTokensData) {
      setSwapData(prev => ({ ...prev, amountIn: '0', amountOut: '0' }));

      return;
    }

    const { amountIn, amountOut } = tokenData;

    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS || '';
    const tokenInAddress = tokenInIsNative ? WHBARAddress : tokenA.address;
    const tokenOutAddress = tokenOutIsNative ? WHBARAddress : tokenB.address;

    if (willWrapTokens || willUnwrapTokens) {
      if (name === 'amountIn' && amountIn !== '0') {
        const swapAmountOut = amountIn;

        setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
      } else if (name === 'amountOut' && amountOut !== '0') {
        const swapAmountIn = amountOut;

        setSwapData(prev => ({ ...prev, ...tokenData, amountIn: swapAmountIn.toString() }));
      } else {
        setSwapData(prev => ({ ...prev, amountIn: '0', amountOut: '0' }));
      }
    } else {
      if (name === 'amountIn' && amountIn !== '0') {
        const trades = getPossibleTradesExactIn(
          poolsData || [],
          amountIn,
          tokenInAddress,
          tokenOutAddress,
        );

        const sortedTrades = trades.sort(tradeComparator);

        if (sortedTrades.length === 0) return;

        const bestTrade = sortedTrades[0];

        setBestPath(bestTrade.path);
        setTokenInExactAmount(true);
        setSwapData(prev => ({ ...prev, ...tokenData, amountOut: bestTrade.amountOut }));
      } else if (name === 'amountOut' && amountOut !== '0') {
        const trades = getPossibleTradesExactOut(
          poolsData || [],
          amountOut,
          tokenInAddress,
          tokenOutAddress,
        );

        const sortedTrades = trades.sort(tradeComparator);

        if (sortedTrades.length === 0) return;

        const bestTrade = sortedTrades[0];

        setBestPath(bestTrade.path);
        setTokenInExactAmount(false);
        setSwapData(prev => ({ ...prev, ...tokenData, amountIn: bestTrade.amountIn }));
      }
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
    const { amountIn, amountOut, tokenInDecimals, tokenOutDecimals } = swapData;

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
          if (willWrapTokens) {
            receipt = await sdk.wrapHBAR(hashconnectConnectorInstance, userId, amountIn);
          } else {
            receipt = await sdk.swapExactHBARForTokens(
              hashconnectConnectorInstance,
              userId,
              amountIn,
              amountOut,
              tokenOutDecimals,
              swapSlippage,
              transactionExpiration,
              bestPath,
            );
          }
        } else if (tokenOutIsNative) {
          if (willUnwrapTokens) {
            receipt = await sdk.unwrapHBAR(hashconnectConnectorInstance, userId, amountIn);
          } else {
            receipt = await sdk.swapExactTokensForHBAR(
              hashconnectConnectorInstance,
              userId,
              amountIn,
              amountOut,
              tokenInDecimals,
              tokenOutDecimals,
              swapSlippage,
              transactionExpiration,
              bestPath,
            );
          }
        } else {
          receipt = await sdk.swapExactTokensForTokens(
            hashconnectConnectorInstance,
            userId,
            amountIn,
            amountOut,
            tokenInDecimals,
            tokenOutDecimals,
            swapSlippage,
            transactionExpiration,
            bestPath,
          );
        }
      } else {
        if (tokenInIsNative) {
          receipt = await sdk.swapHBARForExactTokens(
            hashconnectConnectorInstance,
            userId,
            amountIn,
            amountOut,
            tokenOutDecimals,
            swapSlippage,
            transactionExpiration,
            bestPath,
          );
        } else if (tokenOutIsNative) {
          receipt = await sdk.swapTokensForExactHBAR(
            hashconnectConnectorInstance,
            userId,
            amountIn,
            amountOut,
            tokenInDecimals,
            tokenOutDecimals,
            swapSlippage,
            transactionExpiration,
            bestPath,
          );
        } else {
          receipt = await sdk.swapTokensForExactTokens(
            hashconnectConnectorInstance,
            userId,
            amountIn,
            amountOut,
            tokenInDecimals,
            tokenOutDecimals,
            swapSlippage,
            transactionExpiration,
            bestPath,
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
    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS as string;

    const tokenInIsNative = tokenA.type === TokenType.HBAR;
    const tokenOutIsNative = tokenB.type === TokenType.HBAR;

    const tokenInWrappedHBAR = tokenA.address === WHBARAddress;
    const tokenOutWrappedHBAR = tokenB.address === WHBARAddress;

    setTokenInIsNative(tokenInIsNative);
    setTokenOutIsNative(tokenOutIsNative);
    const willWrap = tokenInIsNative && tokenOutWrappedHBAR;
    const willUnwrap = tokenOutIsNative && tokenInWrappedHBAR;

    setWillWrapTokens(willWrap);
    setWillUnwrapTokens(willUnwrap);
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
    const getTokenBalances = async () => {
      const tokenABalance = await getTokenBalance(userId, tokenA);
      const tokenBBalance = await getTokenBalance(userId, tokenB);
      setTokenBalances({
        tokenA: tokenABalance,
        tokenB: tokenBBalance,
      });
    };
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

    if (userId) getTokenBalances();
  }, [tokensData, userId]);

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

    const readyToAssociate =
      !isNaN(Number(swapData.amountOut)) &&
      Number(swapData.amountOut) > 0 &&
      swapData.tokenIdOut !== initialSwapData.tokenIdOut;
    setReadyToAssociate(readyToAssociate);

    const readyToApprove = !isNaN(Number(swapData.amountIn)) && Number(swapData.amountIn) > 0;
    setReadyToApprove(readyToApprove);

    setReadyToSwap(ready);
  }, [swapData, approved]);

  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);

  //Render methods
  const getSettings = () => {
    return (
      <>
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
      </>
    );
  };

  const getErrorMessage = () => {
    return error ? (
      <div className="alert alert-danger my-5" role="alert">
        <strong>Something went wrong!</strong>
        <p>{errorMessages[errorMessage]}</p>
      </div>
    ) : null;
  };

  const getSwapSection = () => {
    return (
      <div className="container-dark">
        <InputTokenSelector
          inputTokenComponent={
            <InputToken
              value={swapData.amountIn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value, name } = e.target;
                handleInputChange(value, name);
              }}
              name="amountIn"
            />
          }
          buttonSelectorComponent={
            <ButtonSelector
              onClick={() => setShowModalA(true)}
              selectedToken={tokensData?.tokenA.symbol}
              selectorText="Select token"
            />
          }
          walletBalanceComponent={
            <WalletBalance
              walletBalance={tokenBalances.tokenA}
              onMaxButtonClick={(maxValue: string) => {
                handleInputChange(maxValue, 'amountIn');
              }}
            />
          }
        />

        <Modal show={showModalA}>
          <ModalSearchContent
            modalTitle="Select token"
            tokenFieldId="tokenA"
            setTokensData={setTokensData}
            closeModal={() => setShowModalA(false)}
            defaultToken={NATIVE_TOKEN}
          />
        </Modal>

        <InputTokenSelector
          className="mt-5"
          inputTokenComponent={
            <InputToken
              value={swapData.amountOut}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value, name } = e.target;
                handleInputChange(value, name);
              }}
              name="amountOut"
            />
          }
          buttonSelectorComponent={
            <ButtonSelector
              onClick={() => setShowModalB(true)}
              selectedToken={tokensData?.tokenB.symbol}
              selectorText="Select token"
            />
          }
          walletBalanceComponent={<WalletBalance walletBalance={tokenBalances.tokenB} />}
        />

        <Modal show={showModalB}>
          <ModalSearchContent
            modalTitle="Select token"
            tokenFieldId="tokenB"
            setTokensData={setTokensData}
            closeModal={() => setShowModalB(false)}
          />
        </Modal>
      </div>
    );
  };

  const getActionButtons = () => {
    const swapButtonLabel = willWrapTokens ? 'wrap' : willUnwrapTokens ? 'unwrap' : 'swap';
    return (
      <div className="d-grid mt-4">
        {loadingPools ? (
          <Loader />
        ) : readyToApprove ? (
          approved ? (
            <Button
              loading={loadingSwap}
              disabled={!readyToSwap || !associated}
              onClick={() => handleSwapClick()}
            >
              {swapButtonLabel}
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
    );
  };

  const getSuccessMessage = () => {
    return successSwap ? (
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
    ) : null;
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        {getSettings()}
        {getErrorMessage()}
        {getSwapSection()}
        {getActionButtons()}
        {getSuccessMessage()}
      </div>
    </div>
  );
};

export default Swap;
