import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import toast from 'react-hot-toast';
import Tippy from '@tippyjs/react';

import BigNumber from 'bignumber.js';
import _ from 'lodash';

import { GlobalContext } from '../providers/Global';

import {
  ITokenData,
  TokenType,
  ITokensData,
  IfaceInitialBalanceData,
  IPoolData,
} from '../interfaces/tokens';

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
import IconToken from '../components/IconToken';
import ToasterWrapper from '../components/ToasterWrapper';

import {
  checkAllowanceERC20,
  checkAllowanceHTS,
  getAmountToApprove,
  getTokenBalance,
  getUserAssociatedTokens,
  hasFeesOrKeys,
  invalidInputTokensData,
  NATIVE_TOKEN,
} from '../utils/tokenUtils';
import { getTransactionSettings } from '../utils/transactionUtils';
import {
  getPossibleTradesExactIn,
  getPossibleTradesExactOut,
  getTradePriceImpact,
  tradeComparator,
} from '../utils/tradeUtils';
import {
  formatStringETHtoPriceFormatted,
  formatStringWeiToStringEther,
  getAmountWithSlippage,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';

import useTokensByListIds from '../hooks/useTokensByListIds';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import usePoolsByToken from '../hooks/usePoolsByToken';
import useTokensByFilter from '../hooks/useTokensByFilter';

import getErrorMessage from '../content/errors';
import { generalFeesAndKeysWarning } from '../content/messages';

import {
  ASYNC_SEARCH_THRESHOLD,
  initialTokensDataSwap,
  initialSwapData,
  useQueryOptionsProvideSwapRemove,
  useQueryOptions,
} from '../constants';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted } = contextValue;
  const {
    userId,
    hashconnectConnectorInstance,
    connected,
    setShowConnectModal,
    isHashpackLoading,
  } = connection;

  const { token0, token1 } = useParams();

  // State for modals
  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);
  const [showModalConfirmSwap, setShowModalConfirmSwap] = useState(false);

  // State for token inputs
  const [tokensData, setTokensData] = useState<ITokensData>(initialTokensDataSwap);
  const [tokenInIsNative, setTokenInIsNative] = useState(false);
  const [tokenOutIsNative, setTokenOutIsNative] = useState(false);
  const [willWrapTokens, setWillWrapTokens] = useState(false);
  const [willUnwrapTokens, setWillUnwrapTokens] = useState(false);
  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [insufficientLiquidity, setInsufficientLiquidity] = useState(false);
  const [insufficientInAmount, setInsufficientInAmount] = useState(false);

  //State for tokens whitelist
  const [tokensWhitelistedIds, setTokensWhitelistedIds] = useState<string[]>([]);
  const [mergedPoolsData, setMergedPoolsData] = useState<IPoolData[]>([] as IPoolData[]);
  const [mergedTokensData, setMergedTokensData] = useState<ITokenData[]>([] as ITokenData[]);

  const [selectedTokensIds, setSelectedTokensIds] = useState<string[]>([]);

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
  const [swapPriceImpact, setSwapPriceImpact] = useState<number>(0);

  // State for loading
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingCheckApprove, setLoadingCheckApprove] = useState(true);
  const [loadingAssociate, setLoadingAssociate] = useState(false);

  // State for preset tokens from choosen pool
  const [tokensDerivedFromPool, setTokensDerivedFromPool] = useState(false);

  //Get whitelisted pools
  const {
    poolsByTokenList: whitelistedPoolsData,
    loadingPoolsByTokenList: loadingPools,
    refetchPoolsByTokenList: refetch,
  } = usePoolsByTokensList(useQueryOptionsProvideSwapRemove, false, tokensWhitelistedIds);

  //Get pools by token A
  const { filteredPools: filteredPoolsDataTokenA } = usePoolsByToken(
    useQueryOptionsProvideSwapRemove,
    tokensData.tokenA.address || (process.env.REACT_APP_WHBAR_ADDRESS as string),
    false,
  );

  //Get pools by token B
  const { filteredPools: filteredPoolsDataTokenB } = usePoolsByToken(
    useQueryOptionsProvideSwapRemove,
    tokensData.tokenB.address || (process.env.REACT_APP_WHBAR_ADDRESS as string),
    true,
  );

  //Get whitelisted tokens
  const { loading: loadingTDL, tokens: tokenDataList } = useTokensByListIds(
    tokensWhitelistedIds,
    useQueryOptions,
  );

  const { tokens: selectedTokens } = useTokensByListIds(selectedTokensIds, useQueryOptions);

  const { filteredTokens, loadFilteredTokens } = useTokensByFilter(useQueryOptions);

  // Memoizing functions
  const tokenAFilteredData = useMemo(() => {
    return mergedTokensData.filter(
      (token: ITokenData) => token.address !== tokensData.tokenB?.address,
    );
  }, [mergedTokensData, tokensData.tokenB?.address]);

  const tokenBFilteredData = useMemo(() => {
    return mergedTokensData.filter(
      (token: ITokenData) => token.address !== tokensData.tokenA?.address,
    );
  }, [mergedTokensData, tokensData.tokenA?.address]);

  const searchTokensFunc = useMemo(
    () => (value: string) => {
      if (value.length > ASYNC_SEARCH_THRESHOLD)
        loadFilteredTokens({ variables: { keyword: value } });
    },
    [loadFilteredTokens],
  );

  const getInsufficientTokenIn = useCallback(() => {
    const { tokenA: tokenABalance } = tokenBalances;
    const { amountIn } = swapData;

    return tokenABalance && amountIn && new BigNumber(amountIn).gt(new BigNumber(tokenABalance));
  }, [swapData, tokenBalances]);

  const swapPath = useMemo(() => {
    const renderBestPath = (currentAddress: string, index: number) => {
      let currentTokenSymbol =
        mergedTokensData.find((token: ITokenData) => token.address === currentAddress)?.symbol ||
        '';

      if (!currentTokenSymbol) {
        for (let index = 0; index < mergedPoolsData.length; index++) {
          const currentPool = mergedPoolsData[index];
          const { token0, token1, token0Symbol, token1Symbol } = currentPool;

          if (token0 === currentAddress || token1 === currentAddress) {
            currentTokenSymbol = token0 === currentAddress ? token0Symbol : token1Symbol;
          }

          if (currentTokenSymbol) break;
        }
      }

      if (
        currentAddress === process.env.REACT_APP_WHBAR_ADDRESS &&
        ((tokenInIsNative && index === 0) || (tokenOutIsNative && index === bestPath.length - 1))
      ) {
        currentTokenSymbol = NATIVE_TOKEN.symbol;
      }

      return (
        <div className="d-flex align-items-center" key={index}>
          {index !== 0 ? <span className="mx-3">{'>'}</span> : null}
          <Tippy content={currentTokenSymbol}>
            <span>
              <IconToken symbol={currentTokenSymbol} />
            </span>
          </Tippy>
          {bestPath.length <= 3 ? (
            <div className="d-flex flex-column ms-3">
              <span className="text-main text-bold">{currentTokenSymbol}</span>
            </div>
          ) : null}
        </div>
      );
    };

    return bestPath.length !== 0 ? (
      <div className="rounded border border-secondary p-4 mt-4">
        <div className="d-flex justify-content-center">{bestPath.map(renderBestPath)}</div>

        <hr className="my-4" />

        <div className="mt-4 d-flex justify-content-between">
          <span className="text-small">Price Impact:</span>
          <span className="text-small text-numeric text-bold">{swapPriceImpact.toFixed(2)}%</span>
        </div>
      </div>
    ) : null;
  }, [
    bestPath,
    mergedTokensData,
    tokenInIsNative,
    tokenOutIsNative,
    mergedPoolsData,
    swapPriceImpact,
  ]);

  // Handlers
  const handleInputChange = useCallback(
    (rawValue: string, name: string, inputTokensData: ITokensData = tokensData) => {
      setInsufficientLiquidity(false);
      setInsufficientInAmount(false);
      const { tokenA, tokenB } = inputTokensData;

      const value = stripStringToFixedDecimals(
        rawValue,
        name === 'amountIn' ? tokenA.decimals : tokenB.decimals,
      );

      const tokenData = {
        [name]: value,
      };

      const invalidTokenData = () => {
        const tokenANotSelected = Object.keys(tokenA).length === 0;
        const tokenBNotSelected = Object.keys(tokenB).length === 0;
        const sameTokenSelected = tokenA.address === tokenB.address;
        return tokenANotSelected || tokenBNotSelected || sameTokenSelected;
      };

      if (invalidInputTokensData(value)) {
        setBestPath([]);
        setSwapPriceImpact(0);
        setSwapData(prev => ({ ...prev, amountIn: '', amountOut: '' }));
        return;
      }

      if (invalidTokenData()) {
        setBestPath([]);
        setSwapPriceImpact(0);

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
          setBestPath([]);
          setSwapPriceImpact(0);
          setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
        } else if (name === 'amountOut') {
          const swapAmountIn = amountOut;

          setSwapData(prev => ({ ...prev, ...tokenData, amountIn: swapAmountIn.toString() }));
        } else {
          setSwapData(prev => ({ ...prev, amountIn: '', amountOut: '' }));
        }
      } else {
        if (name === 'amountIn' && parseFloat(amountIn) !== 0) {
          const trades = getPossibleTradesExactIn(
            mergedPoolsData || [],
            amountIn,
            tokenInAddress,
            tokenOutAddress,
            true,
          );

          const sortedTrades = trades.sort(tradeComparator);

          if (sortedTrades.length === 0) {
            setBestPath([]);
            setSwapPriceImpact(0);
            setSwapData(prev => ({ ...prev, ...tokenData, amountOut: '' }));
            setTokenInExactAmount(true);
            setInsufficientLiquidity(true);
            return;
          }
          const bestTrade = sortedTrades[0];

          if (parseFloat(bestTrade.amountOut) === 0) {
            setBestPath([]);
            setSwapPriceImpact(0);
            setSwapData(prev => ({ ...prev, ...tokenData, amountOut: '' }));
            setTokenInExactAmount(true);
            setInsufficientInAmount(true);
            return;
          }

          setBestPath(bestTrade.path);
          setSwapPriceImpact(getTradePriceImpact(bestTrade));
          setTokenInExactAmount(true);
          setSwapData(prev => ({ ...prev, ...tokenData, amountOut: bestTrade.amountOut }));
        } else if (name === 'amountIn' && parseFloat(amountIn) === 0) {
          setSwapData(prev => ({ ...prev, ...tokenData, amountOut: '' }));
          setBestPath([]);
        } else if (name === 'amountOut' && parseFloat(amountOut) !== 0) {
          const trades = getPossibleTradesExactOut(
            mergedPoolsData || [],
            amountOut,
            tokenInAddress,
            tokenOutAddress,
            true,
          );

          const sortedTrades = trades.sort(tradeComparator);

          if (sortedTrades.length === 0) {
            setBestPath([]);
            setSwapData(prev => ({ ...prev, ...tokenData, amountIn: '' }));
            setTokenInExactAmount(false);
            setInsufficientLiquidity(true);
            return;
          }

          const bestTrade = sortedTrades[0];
          getTradePriceImpact(bestTrade);

          setBestPath(bestTrade.path);
          setSwapPriceImpact(getTradePriceImpact(bestTrade));
          setTokenInExactAmount(false);
          setSwapData(prev => ({ ...prev, ...tokenData, amountIn: bestTrade.amountIn }));
        } else if (name === 'amountOut' && parseFloat(amountOut) === 0) {
          setSwapData(prev => ({ ...prev, ...tokenData, amountIn: '' }));
          setBestPath([]);
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
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        const tokens = await getUserAssociatedTokens(userId);
        setUserAssociatedTokens(tokens);

        const newBalance = await getTokenBalance(userId, token);
        const tokenToSet = token.address === tokensData.tokenA.address ? 'tokenA' : 'tokenB';

        setTokenBalances({
          ...tokenBalances,
          [tokenToSet]: newBalance,
        });
      }
    } catch (err) {
      console.error(err);
      toast('Error on associate');
    } finally {
      setLoadingAssociate(false);
    }
  };

  const handleApproveClick = async () => {
    const { tokenA } = tokensData;
    const { hederaId, type } = tokenA;
    const amount = await getAmountToApprove(hederaId, type === TokenType.HTS);

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
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        setApproved(true);
        toast.success('Success! Token was approved.');
      }
    } catch (err) {
      console.error(err);
      toast('Error on approve');
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
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        setSwapData(initialSwapData);
        setApproved(false);
        refetch();
        toast.success('Success! Tokens were swapped.');

        const newBalanceTokenA = await getTokenBalance(userId, tokensData.tokenA);
        const newBalanceTokenB = await getTokenBalance(userId, tokensData.tokenB);

        setTokenBalances({
          tokenA: newBalanceTokenA,
          tokenB: newBalanceTokenB,
        });
      }
    } catch (err) {
      console.error(`[Error on swap]: ${err}`);
      toast.error('Swap transaction resulted in an error.');
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
      setLoadingCheckApprove(false);
    };

    const getAllowanceERC20 = async (userId: string) => {
      const spenderAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
      try {
        const canSpend = await checkAllowanceERC20(
          address,
          userId,
          spenderAddress,
          swapData.amountIn,
        );
        setApproved(canSpend);
      } catch (e) {
        setApproved(false);
      } finally {
        setLoadingCheckApprove(false);
      }
    };

    const {
      tokenA: { type, hederaId, address },
    } = tokensData;

    const hasTokenAData = hederaId && swapData.amountIn;

    if (type === TokenType.HBAR) {
      setNeedApproval(false);
    } else if (hasTokenAData && userId) {
      if (type === TokenType.HTS) {
        getAllowanceHTS(userId);
      } else if (type === TokenType.ERC20) {
        getAllowanceERC20(userId);
      }
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
      !insufficientLiquidity &&
      !insufficientInAmount;
    setReadyToApprove(readyToApprove);

    setReadyToSwap(ready);
  }, [
    swapData,
    approved,
    getInsufficientTokenIn,
    tokensData,
    insufficientLiquidity,
    needApproval,
    insufficientInAmount,
  ]);

  // Check for prepopulated tokens in url
  useEffect(() => {
    try {
      if (
        !tokensDerivedFromPool &&
        token0 &&
        token1 &&
        mergedPoolsData.length !== 0 &&
        mergedTokensData
      ) {
        const token0Found = mergedTokensData.some((token: ITokenData) => token.address === token0);
        const token1Found = mergedTokensData.some((token: ITokenData) => token.address === token1);

        if (!token0Found || !token1Found) {
          //Load data for the tokens chosen
          setSelectedTokensIds([token0, token1]);
          return;
        }
        // Check if one of tokens is WHBAR - to be switched for HBAR
        const isTokenAWrappedHBAR = token0 === (process.env.REACT_APP_WHBAR_ADDRESS as string);
        const isTokenBWrappedHBAR = token1 === (process.env.REACT_APP_WHBAR_ADDRESS as string);

        const tokenA = isTokenAWrappedHBAR
          ? NATIVE_TOKEN
          : mergedTokensData.find((token: ITokenData) => token.address === token0) ||
            ({} as ITokenData);
        const tokenB = isTokenBWrappedHBAR
          ? NATIVE_TOKEN
          : mergedTokensData.find((token: ITokenData) => token.address === token1) ||
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
  }, [mergedPoolsData, mergedTokensData, token0, token1, tokensDerivedFromPool, userId]);

  // Update whitelisted tokens ids when whitelisted tokens list changes
  useEffect(() => {
    if (tokensWhitelisted && tokensWhitelisted.length !== 0) {
      const tokensWhitelistedIds = tokensWhitelisted.map(item => item.address);
      setTokensWhitelistedIds(tokensWhitelistedIds);
    }
  }, [tokensWhitelisted]);

  //Merge pools comming from BE
  useEffect(() => {
    const mergedPoolsData = _.unionBy(
      whitelistedPoolsData,
      filteredPoolsDataTokenA,
      filteredPoolsDataTokenB,
      'id',
    );
    setMergedPoolsData(mergedPoolsData);
  }, [whitelistedPoolsData, filteredPoolsDataTokenA, filteredPoolsDataTokenB]);

  //Merge tokens comming from BE
  useEffect(() => {
    const mergedTokensData = _.unionBy(tokenDataList, selectedTokens, filteredTokens, 'address');
    setMergedTokensData(mergedTokensData);
  }, [tokenDataList, selectedTokens, filteredTokens]);

  // Helper methods
  const getSwapButtonLabel = () => {
    const { tokenA, tokenB } = tokensData;
    if (Object.keys(tokenB).length === 0 || Object.keys(tokenA).length === 0)
      return 'Select a token';
    if (getInsufficientTokenIn()) return `Insufficient ${tokenA.symbol} balance`;
    if (insufficientLiquidity) return 'Insufficient liquidity for this trade.';
    if (insufficientInAmount) return `Insufficient ${tokenA.symbol} provided`;
    return willWrapTokens ? 'wrap' : willUnwrapTokens ? 'unwrap' : 'swap';
  };

  const getTokenIsAssociated = (token: ITokenData) => {
    const notHTS =
      Object.keys(token).length === 0 ||
      token.type === TokenType.HBAR ||
      token.type === TokenType.ERC20;
    return notHTS || userAssociatedTokens?.includes(token.hederaId);
  };

  //Render methods
  const renderSwapSection = () => {
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
            connected && !isHashpackLoading && Object.keys(tokensData.tokenA).length > 0 ? (
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
        {showModalA ? (
          <Modal show={showModalA} closeModal={() => setShowModalA(false)}>
            <ModalSearchContent
              modalTitle="Select a token"
              tokenFieldId="tokenA"
              setTokensData={newTokensData => {
                setNeedApproval(true);
                setApproved(false);
                setTokensData(newTokensData);
              }}
              closeModal={() => setShowModalA(false)}
              canImport={false}
              tokenDataList={tokenAFilteredData}
              loadingTDL={loadingTDL}
              searchFunc={searchTokensFunc}
              itemToExlude={tokensData.tokenB}
            />
          </Modal>
        ) : null}

        <div className="d-flex justify-content-center my-4">
          <span className="d-block p-1" onClick={handleSwitchTokens}>
            <Icon className="cursor-pointer" name="swap" color="gradient" />
          </span>
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
            connected && !isHashpackLoading && Object.keys(tokensData.tokenB).length > 0 ? (
              <WalletBalance walletBalance={tokenBalances.tokenB} />
            ) : null
          }
        />
        {showModalB ? (
          <Modal show={showModalB} closeModal={() => setShowModalB(false)}>
            <ModalSearchContent
              modalTitle="Select token"
              tokenFieldId="tokenB"
              setTokensData={newTokensData => {
                setTokensData(newTokensData);
              }}
              closeModal={() => setShowModalB(false)}
              canImport={false}
              tokenDataList={tokenBFilteredData}
              loadingTDL={loadingTDL}
              searchFunc={searchTokensFunc}
              itemToExlude={tokensData.tokenA}
            />
          </Modal>
        ) : null}
        {swapPath}
        {renderActionButtons()}
      </div>
    );
  };

  const renderSwapButtonDisabledState = () => {
    const { tokenA, tokenB } = tokensData;
    return !readyToSwap || !getTokenIsAssociated(tokenA) || !getTokenIsAssociated(tokenB);
  };

  const renderActionButtons = () => {
    const confirmationText = `Swapping ${swapData.amountIn} ${tokensData.tokenA.symbol} for ${swapData.amountOut} ${tokensData.tokenB.symbol}`;

    return connected && !isHashpackLoading ? (
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
                  loading={loadingApprove || loadingCheckApprove}
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
                disabled={renderSwapButtonDisabledState()}
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
              confirmButtonLabel="Confirm"
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
                    inputTokenComponent={<InputToken value={swapData.amountOut} disabled={true} />}
                    buttonSelectorComponent={
                      <ButtonSelector
                        selectedToken={tokensData?.tokenB.symbol}
                        selectorText="Select token"
                        disabled={true}
                      />
                    }
                  />
                  {renderTokensRatio()}
                  {renderAdvancedSwapInfo()}
                  {renderWarningMessage()}
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
    );
  };

  const renderTokensRatio = () => {
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

  const renderWarningMessage = () => {
    if (hasFeesOrKeys(tokensData.tokenA) || hasFeesOrKeys(tokensData.tokenB)) {
      return (
        <div className="alert alert-info my-5 d-flex align-items-center" role="alert">
          <Icon className="alert-icon" name="info" color="info" />{' '}
          <p className="ms-3 alert-message">{generalFeesAndKeysWarning}</p>
        </div>
      );
    }
  };

  const renderAdvancedSwapInfo = () => {
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
          {swapPriceImpact !== 0 && !willWrapTokens && !willUnwrapTokens ? (
            <div className="d-flex justify-content-between m-4">
              <span className="text-small">Price Impact:</span>
              <span className="text-small text-numeric text-bold">
                {swapPriceImpact.toFixed(2)}%
              </span>
            </div>
          ) : null}

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
        {renderSwapSection()}
        <ToasterWrapper />
      </div>
    </div>
  );
};

export default Swap;
