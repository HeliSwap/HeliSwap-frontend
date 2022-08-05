import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

import {
  ITokenData,
  ISwapTokenData,
  TokenType,
  ITokensData,
  IfaceInitialBalanceData,
  IPoolData,
} from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import WalletBalance from '../components/WalletBalance';
import InputTokenSelector from '../components/InputTokenSelector';
import PageHeader from '../components/PageHeader';
import ConfirmTransactionModalContent from '../components/Modals/ConfirmTransactionModalContent';
import InputToken from '../components/InputToken';
import ButtonSelector from '../components/ButtonSelector';
import Icon from '../components/Icon';
import Confirmation from '../components/Confirmation';

import errorMessages from '../content/errors';
import {
  checkAllowanceHTS,
  getTokenBalance,
  getUserAssociatedTokens,
  NATIVE_TOKEN,
} from '../utils/tokenUtils';
import { getTransactionSettings } from '../utils/transactionUtils';
import {
  getPossibleTradesExactIn,
  getPossibleTradesExactOut,
  tradeComparator,
} from '../utils/tradeUtils';
import {
  formatStringETHtoPriceFormatted,
  formatStringWeiToStringEther,
  getAmountWithSlippage,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';

import { MAX_UINT_ERC20, MAX_UINT_HTS, REFRESH_TIME } from '../constants';

import useTokensByListIds from '../hooks/useTokensByListIds';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import usePoolsByToken from '../hooks/usePoolsByToken';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted } = contextValue;
  const {
    userId,
    hashconnectConnectorInstance,
    connected,
    setShowConnectModal,
    extensionFound,
    isHashpackLoading,
  } = connection;

  const { token0, token1 } = useParams();

  // State for modals
  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);
  const [showModalConfirmSwap, setShowModalConfirmSwap] = useState(false);

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
  const [insufficientLiquidity, setInsufficientLiquidity] = useState(false);

  //State for tokens whitelist
  const [tokensWhitelistedIds, setTokensWhitelistedIds] = useState<string[]>([]);

  const [mergedPoolsData, setMergedPoolsData] = useState<IPoolData[]>([] as IPoolData[]);

  const {
    poolsByTokenList: whitelistedPoolsData,
    loadingPoolsByTokenList: loadingPools,
    refetchPoolsByTokenList: refetch,
  } = usePoolsByTokensList(
    {
      fetchPolicy: 'network-only',
      pollInterval: REFRESH_TIME,
    },
    false,
    tokensWhitelistedIds,
  );

  const { filteredPools: filteredPoolsDataTokenA } = usePoolsByToken(
    {
      fetchPolicy: 'network-only',
      pollInterval: REFRESH_TIME,
    },
    tokensData.tokenA.address || (process.env.REACT_APP_WHBAR_ADDRESS as string),
    false,
  );

  const { filteredPools: filteredPoolsDataTokenB } = usePoolsByToken(
    {
      fetchPolicy: 'network-only',
      pollInterval: REFRESH_TIME,
    },
    tokensData.tokenB.address || (process.env.REACT_APP_WHBAR_ADDRESS as string),
    true,
  );

  const { loading: loadingTDL, tokens: tokenDataList } = useTokensByListIds(tokensWhitelistedIds, {
    fetchPolicy: 'network-only',
    pollInterval: REFRESH_TIME,
  });

  const initialSwapData: ISwapTokenData = {
    amountIn: '',
    amountOut: '',
  };

  // State for Swap
  const [swapData, setSwapData] = useState(initialSwapData);
  const tokenInValue = swapData.amountIn;
  const tokenOutValue = swapData.amountOut;

  // State for approved
  const [approved, setApproved] = useState(false);
  const [needApproval, setNeedApproval] = useState(true);
  const [readyToApprove, setReadyToApprove] = useState(false);

  // State for token balances
  const initialBallanceData = useMemo(
    () => ({
      tokenA: undefined,
      tokenB: undefined,
    }),
    [],
  );

  const [tokenBalances, setTokenBalances] = useState<IfaceInitialBalanceData>(initialBallanceData);

  // Additional states for Swaps
  const [readyToSwap, setReadyToSwap] = useState(false);
  const [tokenInExactAmount, setTokenInExactAmount] = useState(true);
  const [bestPath, setBestPath] = useState<string[]>([]);
  const [ratioBasedOnTokenOut, setRatioBasedOnTokenOut] = useState(true);

  // State for general error
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingAssociate, setLoadingAssociate] = useState(false);

  // State for preset tokens from choosen pool
  const [tokensDerivedFromPool, setTokensDerivedFromPool] = useState(false);

  const getInsufficientTokenIn = useCallback(() => {
    const { tokenA: tokenABalance } = tokenBalances;
    const { amountIn } = swapData;

    return tokenABalance && amountIn && new BigNumber(amountIn).gt(new BigNumber(tokenABalance));
  }, [swapData, tokenBalances]);

  const handleInputChange = useCallback(
    (value: string, name: string, inputTokensData: ITokensData = tokensData) => {
      setInsufficientLiquidity(false);
      const { tokenA, tokenB } = inputTokensData;

      const tokenData = {
        [name]: value,
      };

      const invalidTokenData = () => {
        const tokenANotSelected = Object.keys(tokenA).length === 0;
        const tokenBNotSelected = Object.keys(tokenB).length === 0;
        const sameTokenSelected = tokenA.address === tokenB.address;
        return tokenANotSelected || tokenBNotSelected || sameTokenSelected;
      };

      const invalidInputTokensData = () => {
        return !value || isNaN(Number(value));
      };

      if (invalidInputTokensData()) {
        setSwapData(prev => ({ ...prev, amountIn: '', amountOut: '' }));
        return;
      }

      if (invalidTokenData()) {
        setSwapData(prev => ({
          ...prev,
          [name]: value,
          [name === 'amountIn' ? 'amountOut' : 'amountIn']: '',
        }));
        setTokenInExactAmount(name === 'amountIn');
        setInsufficientLiquidity(true);
        return;
      }

      const { amountIn, amountOut } = tokenData;

      const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS || '';
      const tokenInIsNative = tokenA.type === TokenType.HBAR;
      const tokenOutIsNative = tokenB.type === TokenType.HBAR;
      const tokenInAddress = tokenInIsNative ? WHBARAddress : tokenA.address;
      const tokenOutAddress = tokenOutIsNative ? WHBARAddress : tokenB.address;

      if (willWrapTokens || willUnwrapTokens) {
        if (name === 'amountIn') {
          const swapAmountOut = amountIn;

          setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
        } else if (name === 'amountOut') {
          const swapAmountIn = amountOut;

          setSwapData(prev => ({ ...prev, ...tokenData, amountIn: swapAmountIn.toString() }));
        } else {
          setSwapData(prev => ({ ...prev, amountIn: '', amountOut: '' }));
        }
      } else {
        if (name === 'amountIn') {
          const trades = getPossibleTradesExactIn(
            mergedPoolsData || [],
            amountIn,
            tokenInAddress,
            tokenOutAddress,
            true,
          );

          const sortedTrades = trades.sort(tradeComparator);

          if (sortedTrades.length === 0) {
            setSwapData(prev => ({ ...prev, ...tokenData, amountOut: '' }));
            setTokenInExactAmount(true);
            setInsufficientLiquidity(true);
            return;
          }
          const bestTrade = sortedTrades[0];

          setBestPath(bestTrade.path);
          setTokenInExactAmount(true);
          setSwapData(prev => ({ ...prev, ...tokenData, amountOut: bestTrade.amountOut }));
        } else if (name === 'amountOut') {
          const trades = getPossibleTradesExactOut(
            mergedPoolsData || [],
            amountOut,
            tokenInAddress,
            tokenOutAddress,
            true,
          );

          const sortedTrades = trades.sort(tradeComparator);

          if (sortedTrades.length === 0) {
            setSwapData(prev => ({ ...prev, ...tokenData, amountIn: '' }));
            setTokenInExactAmount(false);
            setInsufficientLiquidity(true);
            return;
          }

          const bestTrade = sortedTrades[0];

          setBestPath(bestTrade.path);
          setTokenInExactAmount(false);
          setSwapData(prev => ({ ...prev, ...tokenData, amountIn: bestTrade.amountIn }));
        }
      }
    },
    [mergedPoolsData, tokensData, willUnwrapTokens, willWrapTokens],
  );

  const handleAssociateClick = async (token: ITokenData) => {
    setLoadingAssociate(true);

    try {
      const receipt = await sdk.associateToken(
        hashconnectConnectorInstance,
        userId,
        token.hederaId,
      );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        const tokens = await getUserAssociatedTokens(userId);
        setUserAssociatedTokens(tokens);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage('Error on associate');
    } finally {
      setLoadingAssociate(false);
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
        tokenA.type === TokenType.HTS,
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

  const handleSwapClick = () => {
    setShowModalConfirmSwap(true);
  };

  const handleSwapConfirm = async () => {
    const { amountIn, amountOut } = swapData;
    const {
      tokenA: { decimals: decimalsA },
      tokenB: { decimals: decimalsB },
    } = tokensData;

    setError(false);
    setErrorMessage('');
    setLoadingSwap(true);

    const { swapSlippage, transactionExpiration } = getTransactionSettings();

    try {
      let receipt;

      if (willWrapTokens) {
        receipt = await sdk.wrapHBAR(hashconnectConnectorInstance, userId, amountIn);
      } else if (willUnwrapTokens) {
        receipt = await sdk.unwrapHBAR(hashconnectConnectorInstance, userId, amountIn);
      } else {
        receipt = await sdk.swap(
          hashconnectConnectorInstance,
          userId,
          amountIn,
          amountOut,
          decimalsA,
          decimalsB,
          swapSlippage,
          transactionExpiration,
          bestPath,
          tokenInIsNative,
          tokenOutIsNative,
          tokenInExactAmount,
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
        setTokensData(initialTokensData);
        setApproved(false);
        refetch();
      }
    } catch (err) {
      console.error(`[Error on swap]: ${err}`);
      setError(true);
    } finally {
      setLoadingSwap(false);
      setShowModalConfirmSwap(false);
    }
  };

  const handleSwitchTokens = () => {
    const newTokensData = {
      tokenA: tokensData.tokenB,
      tokenB: tokensData.tokenA,
    };
    setNeedApproval(true);
    setApproved(false);
    setTokensData(newTokensData);
    const newInputValueKey = tokenInExactAmount ? 'amountOut' : 'amountIn';
    const oldInputValueKey = tokenInExactAmount ? 'amountIn' : 'amountOut';

    handleInputChange(swapData[oldInputValueKey], newInputValueKey, newTokensData);
  };

  // Check for cached input values - used for auto pooling
  useEffect(() => {
    const newInputName = tokenInExactAmount ? 'amountIn' : 'amountOut';
    const newInputValue = tokenInExactAmount ? tokenInValue : tokenOutValue;
    handleInputChange(newInputValue, newInputName);
  }, [mergedPoolsData, handleInputChange, tokenInExactAmount, tokenInValue, tokenOutValue]);

  // Check for approvals
  useEffect(() => {
    const getAllowanceHTS = async (userId: string) => {
      const { amountIn: amountToSpend } = swapData;

      const {
        tokenA: { type, decimals, hederaId: tokenIdIn },
      } = tokensData;

      const tokenAData: ITokenData = {
        hederaId: tokenIdIn,
        name: '',
        symbol: '',
        decimals,
        address: '',
        type,
      };

      const canSpend = await checkAllowanceHTS(userId, tokenAData, amountToSpend);
      setApproved(canSpend);
    };

    if (tokensData.tokenA.type === TokenType.HBAR) {
      setNeedApproval(false);
    }

    const hasTokenAData = tokensData.tokenA.hederaId && swapData.amountIn;

    if (tokensData.tokenA.type === TokenType.HTS && hasTokenAData && userId) {
      getAllowanceHTS(userId);
    }
  }, [swapData, userId, tokensData]);

  // Check for associations
  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);

  // Check for balances and wrap/unwrap
  useEffect(() => {
    const getTokenBalances = async () => {
      if (userId) {
        const tokenABalance = await getTokenBalance(userId, tokenA);
        const tokenBBalance = await getTokenBalance(userId, tokenB);
        setTokenBalances({
          tokenA: tokenABalance,
          tokenB: tokenBBalance,
        });
      } else {
        setTokenBalances(initialBallanceData);
      }
    };

    const { tokenA, tokenB } = tokensData;

    getTokenBalances();

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
  }, [tokensData, userId, initialBallanceData]);

  // Final checks before swap
  useEffect(() => {
    let ready = true;

    // First token needs to be approved
    if (needApproval && !approved) {
      ready = false;
    }

    // Token amounts need to be gt 0
    if (!swapData.amountIn || !swapData.amountOut || getInsufficientTokenIn()) {
      ready = false;
    }

    const readyToApprove =
      Object.keys(tokensData.tokenA).length !== 0 &&
      !isNaN(Number(swapData.amountIn)) &&
      Number(swapData.amountIn) > 0 &&
      !insufficientLiquidity;
    setReadyToApprove(readyToApprove);

    setReadyToSwap(ready);
  }, [swapData, approved, getInsufficientTokenIn, tokensData, insufficientLiquidity, needApproval]);

  // Check for prepopulated tokens in url
  useEffect(() => {
    try {
      if (
        !tokensDerivedFromPool &&
        token0 &&
        token1 &&
        mergedPoolsData.length !== 0 &&
        tokenDataList
      ) {
        // Check if one of tokens is WHBAR - to be switched for HBAR
        const isTokenAWrappedHBAR = token0 === (process.env.REACT_APP_WHBAR_ADDRESS as string);
        const isTokenBWrappedHBAR = token1 === (process.env.REACT_APP_WHBAR_ADDRESS as string);

        const tokenA = isTokenAWrappedHBAR
          ? NATIVE_TOKEN
          : tokenDataList.find((token: ITokenData) => token.address === token0) ||
            ({} as ITokenData);
        const tokenB = isTokenBWrappedHBAR
          ? NATIVE_TOKEN
          : tokenDataList.find((token: ITokenData) => token.address === token1) ||
            ({} as ITokenData);

        if (tokenA.type !== TokenType.HBAR) {
          setNeedApproval(true);
        }
        setTokensData({ tokenA, tokenB });

        //Fix for wrong ERC20 tokenA balance when prepopulate tokens data
        setTimeout(async () => {
          if (userId) {
            const tokenABalance = await getTokenBalance(userId, tokenA);
            const tokenBBalance = await getTokenBalance(userId, tokenB);
            setTokenBalances({
              tokenA: tokenABalance,
              tokenB: tokenBBalance,
            });
          }
        }, 500);

        //We want to set the tokens from the pool selected just once
        setTokensDerivedFromPool(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mergedPoolsData, tokenDataList, token0, token1, tokensDerivedFromPool, userId]);

  useEffect(() => {
    if (tokensWhitelisted && tokensWhitelisted.length !== 0) {
      const tokensWhitelistedIds = tokensWhitelisted.map(item => item.address);
      setTokensWhitelistedIds(tokensWhitelistedIds);
    }
  }, [tokensWhitelisted]);

  useEffect(() => {
    const mergedPoolsData = _.unionBy(
      whitelistedPoolsData,
      filteredPoolsDataTokenA,
      filteredPoolsDataTokenB,
      'id',
    );
    setMergedPoolsData(mergedPoolsData);
  }, [whitelistedPoolsData, filteredPoolsDataTokenA, filteredPoolsDataTokenB]);

  //Render methods
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
          isInvalid={getInsufficientTokenIn() as boolean}
          inputTokenComponent={
            <InputToken
              value={swapData.amountIn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value, name } = e.target;
                const strippedValue = stripStringToFixedDecimals(value, tokensData.tokenA.decimals);
                handleInputChange(strippedValue, name);
              }}
              name="amountIn"
            />
          }
          buttonSelectorComponent={
            <ButtonSelector
              onClick={() => setShowModalA(true)}
              selectedToken={tokensData?.tokenA.symbol}
              selectorText="Select a token"
            />
          }
          walletBalanceComponent={
            Object.keys(tokensData.tokenA).length > 0 ? (
              <WalletBalance
                insufficientBallance={getInsufficientTokenIn() as boolean}
                walletBalance={tokenBalances.tokenA}
                onMaxButtonClick={(maxValue: string) => {
                  handleInputChange(maxValue, 'amountIn');
                }}
              />
            ) : null
          }
        />
        <Modal show={showModalA} closeModal={() => setShowModalA(false)}>
          <ModalSearchContent
            modalTitle="Select a token"
            tokenFieldId="tokenA"
            setTokensData={newTokensData => {
              setNeedApproval(true);
              setApproved(false);
              const { tokenA } = newTokensData();
              if (tokenA && typeof tokenA.hederaId !== 'undefined') {
                const newSwapData = {
                  tokenIdIn: tokenA.hederaId,
                  tokenInDecimals: tokenA.decimals,
                  amountIn: '',
                  amountOut: '',
                };

                setSwapData(prev => ({ ...prev, ...newSwapData }));
              }
              setTokensData(newTokensData);
            }}
            closeModal={() => setShowModalA(false)}
            canImport={false}
            tokenDataList={tokenDataList || []}
            loadingTDL={loadingTDL}
          />
        </Modal>

        <div onClick={handleSwitchTokens} className="text-center my-4">
          <Icon className="cursor-pointer" name="swap" color="gradient" />
        </div>

        <InputTokenSelector
          inputTokenComponent={
            <InputToken
              value={swapData.amountOut}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value, name } = e.target;
                const strippedValue = stripStringToFixedDecimals(value, tokensData.tokenB.decimals);
                handleInputChange(strippedValue, name);
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
          walletBalanceComponent={
            Object.keys(tokensData.tokenB).length > 0 ? (
              <WalletBalance walletBalance={tokenBalances.tokenB} />
            ) : null
          }
        />
        <Modal show={showModalB} closeModal={() => setShowModalB(false)}>
          <ModalSearchContent
            modalTitle="Select token"
            tokenFieldId="tokenB"
            setTokensData={newTokensData => {
              const { tokenB } = newTokensData();
              if (tokenB && typeof tokenB.hederaId !== 'undefined') {
                const newSwapData = {
                  tokenIdOut: tokenB.hederaId,
                  tokenOutDecimals: tokenB.decimals,
                  amountIn: '',
                  amountOut: '',
                };

                setSwapData(prev => ({ ...prev, ...newSwapData }));
              }
              setTokensData(newTokensData);
            }}
            closeModal={() => setShowModalB(false)}
            canImport={false}
            tokenDataList={tokenDataList || []}
            loadingTDL={loadingTDL}
          />
        </Modal>
        {getActionButtons()}
      </div>
    );
  };

  const getSwapButtonLabel = () => {
    const { tokenA, tokenB } = tokensData;
    if (Object.keys(tokenB).length === 0 || Object.keys(tokenA).length === 0)
      return 'Select a token';
    if (getInsufficientTokenIn()) return `Insufficient ${tokenA.symbol} balance`;
    if (insufficientLiquidity) return 'Insufficient liquidity for this trade.';
    return willWrapTokens ? 'wrap' : willUnwrapTokens ? 'unwrap' : 'swap';
  };

  const getTokenIsAssociated = (token: ITokenData) => {
    const notHTS =
      Object.keys(token).length === 0 ||
      token.type === TokenType.HBAR ||
      token.type === TokenType.ERC20;
    return notHTS || userAssociatedTokens?.includes(token.hederaId);
  };

  const getSwapButtonDisabledState = () => {
    const { tokenA, tokenB } = tokensData;
    return !readyToSwap || !getTokenIsAssociated(tokenA) || !getTokenIsAssociated(tokenB);
  };

  const getActionButtons = () => {
    const confirmationText = `Swapping ${swapData.amountIn} ${tokensData.tokenA.symbol} for ${swapData.amountOut} ${tokensData.tokenB.symbol}`;

    return extensionFound ? (
      connected && !isHashpackLoading ? (
        <>
          {loadingPools ? (
            <div className="d-flex justify-content-center mt-4">
              <Loader />
            </div>
          ) : (
            <>
              {!getTokenIsAssociated(tokensData.tokenA) ? (
                <div className="d-grid mt-4">
                  <Button
                    loading={loadingAssociate}
                    onClick={() => handleAssociateClick(tokensData.tokenA)}
                  >
                    {`Associate ${tokensData.tokenA.symbol}`}
                  </Button>
                </div>
              ) : null}

              {!getTokenIsAssociated(tokensData.tokenB) ? (
                <div className="d-grid mt-4">
                  <Button
                    loading={loadingAssociate}
                    onClick={() => handleAssociateClick(tokensData.tokenB)}
                  >
                    {`Associate ${tokensData.tokenB.symbol}`}
                  </Button>
                </div>
              ) : null}

              {readyToApprove &&
              needApproval &&
              !approved &&
              getTokenIsAssociated(tokensData.tokenA) ? (
                <div className="d-grid mt-4">
                  <Button
                    loading={loadingApprove}
                    disabled={Number(swapData.amountIn) <= 0}
                    onClick={() => handleApproveClick()}
                    className="d-flex justify-content-center align-items-center"
                  >
                    <span>{`Approve ${tokensData.tokenA.symbol}`}</span>
                    <Tippy
                      content={`You must give the HeliSwap smart contracts permission to use your ${tokensData.tokenA.symbol}.`}
                    >
                      <span className="ms-2">
                        <Icon name="hint" />
                      </span>
                    </Tippy>
                  </Button>
                </div>
              ) : null}

              <div className="d-grid mt-4">
                <Button
                  loading={loadingSwap}
                  disabled={getSwapButtonDisabledState()}
                  onClick={() => handleSwapClick()}
                >
                  {getSwapButtonLabel()}
                </Button>
              </div>
            </>
          )}

          {showModalConfirmSwap ? (
            <Modal show={showModalConfirmSwap} closeModal={() => setShowModalConfirmSwap(false)}>
              <ConfirmTransactionModalContent
                modalTitle="Confirm swap"
                closeModal={() => setShowModalConfirmSwap(false)}
                confirmTansaction={handleSwapConfirm}
                confirmButtonLabel="Confirm swap"
                isLoading={loadingSwap}
              >
                {loadingSwap ? (
                  <Confirmation confirmationText={confirmationText} />
                ) : (
                  <>
                    <InputTokenSelector
                      readonly={true}
                      inputTokenComponent={<InputToken value={swapData.amountIn} disabled={true} />}
                      buttonSelectorComponent={
                        <ButtonSelector
                          selectedToken={tokensData?.tokenA.symbol}
                          selectorText="Select token"
                          disabled={true}
                        />
                      }
                    />
                    <InputTokenSelector
                      readonly={true}
                      className="mt-5"
                      inputTokenComponent={
                        <InputToken value={swapData.amountOut} disabled={true} />
                      }
                      buttonSelectorComponent={
                        <ButtonSelector
                          selectedToken={tokensData?.tokenB.symbol}
                          selectorText="Select token"
                          disabled={true}
                        />
                      }
                    />
                    {getTokensRatio()}
                    {getAdvancedSwapInfo()}
                  </>
                )}
              </ConfirmTransactionModalContent>
            </Modal>
          ) : null}
        </>
      ) : (
        <div className="d-grid mt-4">
          <Button disabled={isHashpackLoading} onClick={() => setShowConnectModal(true)}>
            Connect wallet
          </Button>
        </div>
      )
    ) : null;
  };

  const getTokensRatio = () => {
    const ratio = ratioBasedOnTokenOut
      ? Number(swapData.amountIn) / Number(swapData.amountOut)
      : Number(swapData.amountOut) / Number(swapData.amountIn);
    const baseTokenName = ratioBasedOnTokenOut
      ? tokensData.tokenB.symbol
      : tokensData.tokenA.symbol;
    const secondTokenName = ratioBasedOnTokenOut
      ? tokensData.tokenA.symbol
      : tokensData.tokenB.symbol;

    return (
      <div
        className="text-small mt-4 cursor-pointer"
        onClick={() => setRatioBasedOnTokenOut(!ratioBasedOnTokenOut)}
      >{`1 ${baseTokenName} = ${formatStringETHtoPriceFormatted(
        ratio.toString(),
      )} ${secondTokenName}`}</div>
    );
  };

  const getAdvancedSwapInfo = () => {
    const { amountIn, amountOut } = swapData;
    const { tokenA, tokenB } = tokensData;
    const slippage = getTransactionSettings().swapSlippage;

    const amountAfterSlippageMessage = tokenInExactAmount
      ? 'Minimum received after slippage'
      : 'Maximum sent after slippage';

    const secondTokenDecimals = tokenInExactAmount
      ? tokensData.tokenB.decimals
      : tokensData.tokenA.decimals;

    const amountAfterSlippage = tokenInExactAmount
      ? getAmountWithSlippage(amountOut, tokenB.decimals, slippage, true)
      : getAmountWithSlippage(amountIn, tokenA.decimals, slippage, false);

    const amountAfterSlippageStr = formatStringWeiToStringEther(
      amountAfterSlippage.toString(),
      secondTokenDecimals,
    );

    const secondTokenName = tokenInExactAmount
      ? tokensData.tokenB.symbol
      : tokensData.tokenA.symbol;

    const estimationMessage = tokenInExactAmount
      ? `Output is estimated. You will receive at least ${amountAfterSlippageStr} ${secondTokenName} or the transaction will revert.`
      : `Input is estimated. You will sell at most ${amountAfterSlippageStr} ${secondTokenName} or the transaction will revert.`;

    return (
      <div>
        <div className="mt-4 rounded border border-secondary">
          <div className="d-flex justify-content-between m-4">
            <span className="text-small">Expected Output:</span>
            <span className="text-small text-numeric text-bold">{`${formatStringETHtoPriceFormatted(
              swapData.amountOut,
            )} ${tokensData.tokenB.symbol}`}</span>
          </div>
          {/* <div className="d-flex justify-content-between m-4">
            <span className="text-small">Price Impact:</span>
            <span className="text-small">TODO</span>
          </div> */}

          <hr className="my-3 mx-4" />

          <div className="d-flex justify-content-between m-4 text-secondary">
            <span className="text-small">
              {amountAfterSlippageMessage} ({getTransactionSettings().swapSlippage}%)
            </span>

            <span className="text-small text-numeric text-bold">{`${formatStringETHtoPriceFormatted(
              amountAfterSlippageStr,
            )} ${secondTokenName}`}</span>
          </div>
        </div>
        <p className="text-micro text-secondary mt-5">{estimationMessage}</p>
      </div>
    );
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-action">
        <PageHeader slippage="swap" title="Swap" />
        {getErrorMessage()}
        {getSwapSection()}
      </div>
    </div>
  );
};

export default Swap;
