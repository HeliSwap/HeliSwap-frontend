import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import toast from 'react-hot-toast';
import Tippy from '@tippyjs/react';

import { hethers } from '@hashgraph/hethers';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

import { GlobalContext } from '../providers/Global';

import {
  ITokenData,
  TokenType,
  IPoolData,
  ICreatePairData,
  ITokensData,
  IfaceInitialBalanceData,
} from '../interfaces/tokens';

import Button from '../components/Button';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import InputTokenSelector from '../components/InputTokenSelector';
import InputToken from '../components/InputToken';
import PageHeader from '../components/PageHeader';
import ButtonSelector from '../components/ButtonSelector';
import WalletBalance from '../components/WalletBalance';
import ConfirmTransactionModalContent from '../components/Modals/ConfirmTransactionModalContent';
import IconToken from '../components/IconToken';
import Confirmation from '../components/Confirmation';
import Icon from '../components/Icon';

import {
  checkAllowanceHTS,
  getTokenBalance,
  idToAddress,
  NATIVE_TOKEN,
  getUserAssociatedTokens,
  hasFeesOrKeys,
  invalidInputTokensData,
  getAmountToApprove,
  checkAllowanceERC20,
} from '../utils/tokenUtils';
import {
  formatStringETHtoPriceFormatted,
  formatStringToBigNumberEthersWei,
  formatStringToBigNumberWei,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { getTransactionSettings } from '../utils/transactionUtils';
import { formatIcons } from '../utils/iconUtils';

import usePoolsByToken from '../hooks/usePoolsByToken';
import useTokensByListIds from '../hooks/useTokensByListIds';
import useTokensByFilter from '../hooks/useTokensByFilter';
import ToasterWrapper from '../components/ToasterWrapper';

import getErrorMessage from '../content/errors';
import { generalFeesAndKeysWarning } from '../content/messages';

import {
  POOLS_FEE,
  ASYNC_SEARCH_THRESHOLD,
  initialTokensDataCreate,
  initialCreateData,
  initialApproveData,
  initialNeedApprovalData,
  useQueryOptionsProvideSwapRemove,
  useQueryOptions,
} from '../constants';

enum ADD_LIQUIDITY_TITLES {
  CREATE_POOL = 'Create pool',
  PROVIDE_LIQUIDITY = 'Provide liquidity',
  INCREASE_LIQUIDITY = 'Increase liquidity',
}

const Create = () => {
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
  const navigate = useNavigate();

  //State for tokens whitelist
  const [tokensWhitelistedIds, setTokensWhitelistedIds] = useState<string[]>([]);

  // State for modals
  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);
  const [showModalConfirmProvide, setShowModalConfirmProvide] = useState(false);

  // State for token inputs
  const [tokensData, setTokensData] = useState<ITokensData>(initialTokensDataCreate);
  const [inputTokenA, setInputTokenA] = useState(true);
  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [loadingAssociate, setLoadingAssociate] = useState(false);

  //State for tokens data
  const [selectedTokensIds, setSelectedTokensIds] = useState<string[]>([]);
  const [mergedTokensData, setMergedTokensData] = useState<ITokenData[]>([] as ITokenData[]);

  // State for Create/Provide
  const [createPairData, setCreatePairData] = useState<ICreatePairData>(initialCreateData);
  const tokenAValue = createPairData.tokenAAmount;
  const tokenBValue = createPairData.tokenBAmount;

  // State for approved
  const [approved, setApproved] = useState(initialApproveData);
  const [needApproval, setNeedApproval] = useState(initialNeedApprovalData);

  // State for common pool data
  const [selectedPoolData, setSelectedPoolData] = useState<IPoolData>({} as IPoolData);

  // State for token balances
  const initialBallanceData = useMemo(
    () => ({
      tokenA: undefined,
      tokenB: undefined,
    }),
    [],
  );

  const [tokenBalances, setTokenBalances] = useState<IfaceInitialBalanceData>(initialBallanceData);

  // Additional states for Providing/Creating pairs
  const [readyToProvide, setReadyToProvide] = useState(false);
  const [tokensInSamePool, setTokensInSamePool] = useState(false);
  const [provideNative, setProvideNative] = useState(false);
  const [pageTitle, setPageTitle] = useState(ADD_LIQUIDITY_TITLES.CREATE_POOL);

  //State for loading data
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCheckApprove, setLoadingCheckApprove] = useState(true);
  const [loadingApprove, setLoadingApprove] = useState(false);

  // State for preset tokens from choosen pool
  const [tokensDerivedFromPool, setTokensDerivedFromPool] = useState(false);

  //Get pools by token A
  const { filteredPools: poolsData } = usePoolsByToken(
    useQueryOptionsProvideSwapRemove,
    tokensData.tokenA.address || (process.env.REACT_APP_WHBAR_ADDRESS as string),
    false,
  );

  //Get whitelisted tokens
  const { loading: loadingTDL, tokens: tokenDataList } = useTokensByListIds(
    tokensWhitelistedIds,
    useQueryOptions,
  );

  // Get selected tokens
  const { tokens: selectedTokens } = useTokensByListIds(selectedTokensIds, useQueryOptions);

  //Get tokens by filter
  const { filteredTokens, loadFilteredTokens } = useTokensByFilter(useQueryOptions);

  // Memoizing functions
  const searchTokensFunc = useMemo(
    () => (value: string) => {
      if (value.length > ASYNC_SEARCH_THRESHOLD)
        loadFilteredTokens({ variables: { keyword: value } });
    },
    [loadFilteredTokens],
  );

  const getFilteredTokens = (mergedTokensData: ITokenData[], filterBy: ITokenData) => {
    return (
      mergedTokensData.filter((token: ITokenData) => {
        if (
          filterBy.type === TokenType.HBAR ||
          filterBy.address === process.env.REACT_APP_WHBAR_ADDRESS
        ) {
          return (
            token.type !== TokenType.HBAR && token.address !== process.env.REACT_APP_WHBAR_ADDRESS
          );
        }
        return token.address !== filterBy.address;
      }) || []
    );
  };

  const tokenAFilteredData = useMemo(
    () => getFilteredTokens(mergedTokensData, tokensData.tokenB),
    [mergedTokensData, tokensData.tokenB],
  );

  const tokenBFilteredData = useMemo(
    () => getFilteredTokens(mergedTokensData, tokensData.tokenA),
    [mergedTokensData, tokensData.tokenA],
  );

  const invalidTokenData = useCallback(() => {
    const { tokenA, tokenB } = tokensData;
    const hbarAddresss = process.env.REACT_APP_WHBAR_ADDRESS;
    const tokenANotSelected = Object.keys(tokenA).length === 0;
    const tokenBNotSelected = Object.keys(tokenB).length === 0;
    const sameTokenSelected = tokenA.address === tokenB.address;
    const onlyHbarSelected =
      (tokenA.type === TokenType.HBAR && tokenB.address === hbarAddresss) ||
      (tokenB.type === TokenType.HBAR && tokenA.address === hbarAddresss);

    return tokenANotSelected || tokenBNotSelected || sameTokenSelected || onlyHbarSelected;
  }, [tokensData]);

  const getInsufficientTokenA = useCallback(() => {
    const { tokenA } = tokenBalances;
    const { tokenAAmount } = createPairData;
    return tokenA && tokenAAmount && new BigNumber(tokenAAmount).gt(new BigNumber(tokenA));
  }, [tokenBalances, createPairData]);

  const getInsufficientTokenB = useCallback(() => {
    const { tokenB } = tokenBalances;
    const { tokenBAmount } = createPairData;
    return tokenB && tokenBAmount && new BigNumber(tokenBAmount).gt(new BigNumber(tokenB));
  }, [tokenBalances, createPairData]);

  // Handlers
  const handleInputChange = useCallback(
    (rawValue: string, name: string, inputSelectedPoolData: IPoolData = selectedPoolData) => {
      const { tokenA, tokenB } = tokensData;
      const inputToken = name === 'tokenAAmount' ? tokenA : tokenB;
      setInputTokenA(name === 'tokenAAmount');

      const value = stripStringToFixedDecimals(
        rawValue,
        name === 'tokenAAmount' ? tokenA.decimals : tokenB.decimals,
      );

      if (invalidInputTokensData(value)) {
        setReadyToProvide(false);
        setCreatePairData(prev => ({ ...prev, tokenAAmount: '', tokenBAmount: '' }));
        return;
      }
      if (invalidTokenData()) {
        setReadyToProvide(false);
        setCreatePairData(prev => ({ ...prev, [name]: value }));
        return;
      }

      const inputTokenAddress = inputToken.address
        ? inputToken.address
        : (process.env.REACT_APP_WHBAR_ADDRESS as string);

      if (tokensInSamePool) {
        const isInputAddressFirstInPool = inputTokenAddress === inputSelectedPoolData?.token0;

        const inputTokenAmount = isInputAddressFirstInPool
          ? (inputSelectedPoolData?.token0Amount as string)
          : (inputSelectedPoolData?.token1Amount as string);

        const calculatedTokenAmount = isInputAddressFirstInPool
          ? (inputSelectedPoolData?.token1Amount as string)
          : (inputSelectedPoolData?.token0Amount as string);

        const inputTokenDecimals = isInputAddressFirstInPool
          ? inputSelectedPoolData?.token0Decimals
          : inputSelectedPoolData?.token1Decimals;

        const calculatedTokenDecimals = isInputAddressFirstInPool
          ? inputSelectedPoolData?.token1Decimals
          : inputSelectedPoolData?.token0Decimals;

        const token0AmountBN = hethers.BigNumber.from(inputTokenAmount);
        const token1AmountBN = hethers.BigNumber.from(calculatedTokenAmount);

        const valueBN = formatStringToBigNumberEthersWei(value, inputTokenDecimals);
        const keyToUpdate = name === 'tokenAAmount' ? 'tokenBAmount' : 'tokenAAmount';
        const valueToUpdate = valueBN.mul(token1AmountBN).div(token0AmountBN);

        setCreatePairData(prev => ({
          ...prev,
          [keyToUpdate]: hethers.utils
            .formatUnits(valueToUpdate, calculatedTokenDecimals)
            .toString(),
          [name]: value,
        }));
      } else {
        setCreatePairData(prev => ({ ...prev, [name]: value }));
      }
    },
    [invalidTokenData, selectedPoolData, tokensData, tokensInSamePool],
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
        toast.success('Success! Token was associated.');
      }
    } catch (err) {
      toast.error('Associate Token transaction resulted in an error. ');
    } finally {
      setLoadingAssociate(false);
    }
  };

  const handleApproveClick = async (key: string) => {
    const { hederaId, type } = tokensData[key];
    const amount = await getAmountToApprove(hederaId, type === TokenType.HTS);

    setLoadingApprove(true);

    try {
      const receipt = await sdk.approveToken(
        hashconnectConnectorInstance,
        amount,
        userId,
        hederaId,
        type === TokenType.HTS,
      );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        setApproved(prev => ({ ...prev, [key]: true }));
        toast.success('Success! Token was approved.');
      }
    } catch (err) {
      toast.error('Approve Token transaction resulted in an error.');
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleProvideClick = () => {
    setShowModalConfirmProvide(true);
  };

  const handleProvideConfirm = async () => {
    const { provideSlippage, transactionExpiration } = getTransactionSettings();
    const {
      tokenA: { type: typeA },
      tokenB: { type: typeB },
    } = tokensData;

    setLoadingCreate(true);

    try {
      const receipt = provideNative
        ? await sdk.addNativeLiquidity(
            hashconnectConnectorInstance,
            userId,
            createPairData,
            provideSlippage,
            transactionExpiration,
            tokensInSamePool,
            typeA === TokenType.HBAR ? typeB : typeA,
          )
        : await sdk.addLiquidity(
            hashconnectConnectorInstance,
            userId,
            createPairData,
            provideSlippage,
            transactionExpiration,
            tokensInSamePool,
            typeA,
            typeB,
          );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        setCreatePairData({ ...createPairData, tokenAAmount: '', tokenBAmount: '' });
        setReadyToProvide(false);
        toast.success('Success! Liquidity was added.');

        const newBalanceTokenA = await getTokenBalance(userId, tokensData.tokenA);
        const newBalanceTokenB = await getTokenBalance(userId, tokensData.tokenB);

        setTokenBalances({
          tokenA: newBalanceTokenA,
          tokenB: newBalanceTokenB,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Add Liquidity transaction resulted in an error.');
    } finally {
      setLoadingCreate(false);
      setShowModalConfirmProvide(false);
    }
  };

  const handleBackClick = () => {
    navigate('/pools');
  };

  // Check for allowance and approvals
  useEffect(() => {
    const getAllowanceHTS = async (userId: string, token: ITokenData, index: string) => {
      const key = `${index}Amount`;
      const amountToSpend = createPairData[key as keyof ICreatePairData] as string;
      const canSpend = await checkAllowanceHTS(userId, token, amountToSpend);

      setApproved(prev => ({ ...prev, [index]: canSpend }));
      setLoadingCheckApprove(false);
    };

    const getAllowanceERC20 = async (userId: string, tokenA: ITokenData, index: string) => {
      const key = `${index}Amount`;
      const amountToSpend = createPairData[key as keyof ICreatePairData] as string;
      const spenderAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

      try {
        const canSpend = await checkAllowanceERC20(
          tokenA.address,
          userId,
          spenderAddress,
          amountToSpend,
        );
        setApproved(prev => ({ ...prev, [index]: canSpend }));
      } catch {
        setApproved(prev => ({ ...prev, [index]: false }));
      } finally {
        setLoadingCheckApprove(false);
      }
    };

    const { tokenA, tokenB } = tokensData;
    const hasTokenAData = createPairData.tokenAId && createPairData.tokenAAmount;
    const hasTokenBData = createPairData.tokenBId && createPairData.tokenBAmount;

    if (tokenA.type === TokenType.HBAR) {
      setNeedApproval(prev => ({ ...prev, tokenA: false }));
    } else if (hasTokenAData && userId) {
      if (tokensData.tokenA.type === TokenType.HTS) {
        getAllowanceHTS(userId, tokenA, 'tokenA');
      } else if (tokensData.tokenA.type === TokenType.ERC20) {
        getAllowanceERC20(userId, tokenA, 'tokenA');
      }
    }

    if (tokenB.type === TokenType.HBAR) {
      setNeedApproval(prev => ({ ...prev, tokenB: false }));
    } else if (hasTokenBData && userId) {
      if (tokensData.tokenB.type === TokenType.HTS) {
        getAllowanceHTS(userId, tokenB, 'tokenB');
      } else if (tokensData.tokenB.type === TokenType.ERC20) {
        getAllowanceERC20(userId, tokenB, 'tokenB');
      }
    }

    return () => {
      setReadyToProvide(false);
    };
  }, [tokensData, sdk, userId, createPairData]);

  // Check for associations
  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);

  // Check for balances
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
    const newPairData: ICreatePairData = {
      tokenAId: tokenA.hederaId,
      tokenBId: tokenB.hederaId,
      tokenADecimals: tokenA.decimals,
      tokenBDecimals: tokenB.decimals,
      tokenAAmount: '',
      tokenBAmount: '',
    };

    setCreatePairData(prev => ({ ...prev, ...newPairData }));
    getTokenBalances();
  }, [tokensData, userId, initialBallanceData]);

  // Check for native tokens
  useEffect(() => {
    const { tokenA, tokenB } = tokensData;
    const poolsDataLoaded = poolsData.length !== 0;
    const tokenASelected = Object.keys(tokensData.tokenA).length !== 0;
    const tokenBSelected = Object.keys(tokensData.tokenB).length !== 0;

    const tokenAIsNative = tokenA.type === TokenType.HBAR;
    const tokenBIsNative = tokenB.type === TokenType.HBAR;
    const provideNative = tokenAIsNative || tokenBIsNative;
    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS as string;

    const selectedPoolData =
      (poolsDataLoaded &&
        !invalidTokenData() &&
        poolsData.filter((pool: IPoolData) => {
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
        })) ||
      [];

    setSelectedPoolData(selectedPoolData[0] || {});
    setProvideNative(provideNative);
    const tokensInSamePool = selectedPoolData && selectedPoolData.length !== 0;
    setTokensInSamePool(tokensInSamePool);
    const pageTitle = tokensInSamePool
      ? selectedPoolData[0].lpShares
        ? ADD_LIQUIDITY_TITLES.INCREASE_LIQUIDITY
        : ADD_LIQUIDITY_TITLES.PROVIDE_LIQUIDITY
      : ADD_LIQUIDITY_TITLES.CREATE_POOL;

    setPageTitle(pageTitle);

    //Set selected pool address in the URL
    if (poolsDataLoaded && tokenASelected && tokenBSelected) {
      navigate(
        `/create/${
          selectedPoolData[0] ? `${selectedPoolData[0].token0}/${selectedPoolData[0].token1}` : ''
        }`,
      );
    }
  }, [tokensData, poolsData, navigate, invalidTokenData]);

  // Check for address in url
  useEffect(() => {
    try {
      if (
        !tokensDerivedFromPool &&
        token0 &&
        token1 &&
        poolsData.length !== 0 &&
        mergedTokensData
      ) {
        const token0Found = mergedTokensData.some((token: ITokenData) => token.address === token0);
        const token1Found = mergedTokensData.some((token: ITokenData) => token.address === token1);

        if (!token0Found || !token1Found) {
          //Load data for the tokens chosen
          setSelectedTokensIds([token0, token1]);
          return;
        }
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

        setTokensData({ tokenA, tokenB });
        //We want to set the tokens from the pool selected just once
        setTokensDerivedFromPool(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [poolsData, mergedTokensData, token0, token1, tokensDerivedFromPool]);

  // Cache input values
  useEffect(() => {
    //Update inputs data on poolsData and tokensDataChange
    const inputName = inputTokenA ? 'tokenAAmount' : 'tokenBAmount';
    const inputValue = inputTokenA ? tokenAValue : tokenBValue;

    handleInputChange(inputValue, inputName, selectedPoolData || {});
  }, [
    poolsData,
    tokensData,
    selectedPoolData,
    handleInputChange,
    inputTokenA,
    tokenAValue,
    tokenBValue,
  ]);

  // Final check before create
  useEffect(() => {
    let isReady = true;

    const { tokenAAmount, tokenBAmount } = createPairData;

    if (
      !tokenAAmount ||
      parseFloat(tokenAAmount) === 0 ||
      !tokenBAmount ||
      parseFloat(tokenBAmount) === 0
    ) {
      isReady = false;
    }

    if (invalidTokenData()) {
      isReady = false;
    }

    if (
      (tokensData.tokenA.hederaId && !approved.tokenA) ||
      (tokensData.tokenB.hederaId && !approved.tokenB)
    ) {
      isReady = false;
    }

    if (getInsufficientTokenA() || getInsufficientTokenB()) {
      isReady = false;
    }

    setReadyToProvide(isReady);
  }, [
    createPairData,
    provideNative,
    approved,
    getInsufficientTokenA,
    getInsufficientTokenB,
    invalidTokenData,
    tokensData,
  ]);

  // Update whitelisted tokens ids when whitelisted tokens list changes
  useEffect(() => {
    if (tokensWhitelisted && tokensWhitelisted.length !== 0) {
      const tokensWhitelistedIds = tokensWhitelisted.map(item => item.address);
      setTokensWhitelistedIds(tokensWhitelistedIds);
    }
  }, [tokensWhitelisted]);

  //Merge token lists comming from BE
  useEffect(() => {
    const mergedTokensData = _.unionBy(tokenDataList, selectedTokens, filteredTokens, 'address');
    setMergedTokensData(mergedTokensData);
  }, [tokenDataList, selectedTokens, filteredTokens]);

  // Helper functions
  const getTokenIsAssociated = (token: ITokenData) => {
    const notHTS =
      Object.keys(token).length === 0 ||
      token.type === TokenType.HBAR ||
      token.type === TokenType.ERC20;
    return notHTS || userAssociatedTokens?.includes(token.hederaId);
  };

  const getPoolShare = () => {
    if (Object.keys(selectedPoolData).length === 0) return '100';

    //Calculating the pool share using one of the pool's provision tokens as no info for the LP token is available
    const { token0Amount, token1Amount, token0 } = selectedPoolData;
    const { tokenAAmount, tokenAId, tokenADecimals } = createPairData;

    const token0Id =
      provideNative && !tokenAId ? (process.env.REACT_APP_WHBAR_ADDRESS as string) : tokenAId;

    const tokenATotalAmountBN =
      token0 === idToAddress(token0Id) ? new BigNumber(token0Amount) : new BigNumber(token1Amount);

    const tokenAAmountBN = formatStringToBigNumberWei(tokenAAmount, tokenADecimals);

    return tokenAAmountBN
      .div(tokenATotalAmountBN.plus(tokenAAmountBN))
      .times(new BigNumber(100))
      .toFixed(4);
  };

  const getProvideButtonLabel = () => {
    const {
      tokenA: { symbol: symbolA },
      tokenB: { symbol: symbolB },
    } = tokensData;

    if (getInsufficientTokenA()) return `Insufficient ${symbolA} balance`;
    if (getInsufficientTokenB()) return `Insufficient ${symbolB} balance`;
    if (invalidTokenData()) return 'Invalid pool';
    return tokensInSamePool ? 'Provide' : 'Create';
  };

  //Render methods
  const renderWarningMessage = () => {
    if (hasFeesOrKeys(tokensData.tokenA) || hasFeesOrKeys(tokensData.tokenB)) {
      return (
        <div className="alert alert-info my-4 d-flex align-items-center" role="alert">
          <Icon className="alert-icon" name="info" color="info" />{' '}
          <p className="ms-3 alert-message">{generalFeesAndKeysWarning}</p>
        </div>
      );
    }
  };

  const renderProvideSection = () => {
    return (
      <div className="container-dark">
        <div className="mb-4 text-small text-bold">Enter amount</div>
        <InputTokenSelector
          isInvalid={getInsufficientTokenA() as boolean}
          inputTokenComponent={
            <InputToken
              value={createPairData.tokenAAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value, name } = e.target;
                const strippedValue = stripStringToFixedDecimals(value, tokensData.tokenA.decimals);
                handleInputChange(strippedValue, name);
              }}
              name="tokenAAmount"
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
                insufficientBallance={getInsufficientTokenA() as boolean}
                walletBalance={tokenBalances.tokenA}
                onMaxButtonClick={(maxValue: string) => {
                  handleInputChange(maxValue, 'tokenAAmount');
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
              setTokensData={tokensData => {
                const { tokenA } = tokensData();
                if (tokenA && typeof tokenA.hederaId !== 'undefined') {
                  setNeedApproval(prev => ({ ...prev, tokenA: true }));
                  setApproved(prev => ({ ...prev, tokenA: false }));
                  setTokensData(prev => ({ ...prev, tokenA }));
                }
              }}
              closeModal={() => setShowModalA(false)}
              tokenDataList={tokenAFilteredData}
              loadingTDL={loadingTDL}
              searchFunc={searchTokensFunc}
              itemToExlude={tokensData.tokenB}
            />
          </Modal>
        ) : null}

        <InputTokenSelector
          isInvalid={getInsufficientTokenB() as boolean}
          className="mt-4"
          inputTokenComponent={
            <InputToken
              value={createPairData.tokenBAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value, name } = e.target;
                const strippedValue = stripStringToFixedDecimals(value, tokensData.tokenB.decimals);
                handleInputChange(strippedValue, name);
              }}
              name="tokenBAmount"
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
              <WalletBalance
                insufficientBallance={getInsufficientTokenB() as boolean}
                walletBalance={tokenBalances.tokenB}
                onMaxButtonClick={(maxValue: string) => {
                  handleInputChange(maxValue, 'tokenBAmount');
                }}
              />
            ) : null
          }
        />
        {showModalB ? (
          <Modal show={showModalB} closeModal={() => setShowModalB(false)}>
            <ModalSearchContent
              modalTitle="Select token"
              tokenFieldId="tokenB"
              setTokensData={tokensData => {
                const { tokenB } = tokensData();
                if (tokenB && typeof tokenB.hederaId !== 'undefined') {
                  setNeedApproval(prev => ({ ...prev, tokenB: true }));
                  setApproved(prev => ({ ...prev, tokenB: false }));
                  setTokensData(prev => ({ ...prev, tokenB }));
                }
              }}
              closeModal={() => setShowModalB(false)}
              tokenDataList={tokenBFilteredData}
              loadingTDL={loadingTDL}
              searchFunc={searchTokensFunc}
              itemToExlude={tokensData.tokenA}
            />
          </Modal>
        ) : null}
        {renderFeesInfo()}
        <hr className="my-4" />
        {renderTokensRatioSection()}
        {renderActionButtons()}
      </div>
    );
  };

  const renderFeesInfo = () => {
    return (
      <div className="d-flex my-4 justify-content-between align-items-center ">
        <span className="text-small text-bold">Liquidity provider fee:</span>
        <div className="d-flex align-items-center">
          <span className="text-small text-numeric">{POOLS_FEE}</span>
          <Tippy
            content={`The liquidity provider fee is predefined. You'll earn ${POOLS_FEE} of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
          >
            <span className="ms-2">
              <Icon color="gray" name="hint" />
            </span>
          </Tippy>
        </div>
      </div>
    );
  };

  const renderTokensRatioSection = () => {
    return readyToProvide ? (
      <div className="my-4">
        <div className="mt-3 d-flex justify-content-around">
          <div className="text-center">
            <p>
              <span className="text-small text-numeric">{tokenBARatioFormatted}</span>
            </p>
            <p className="text-micro">
              {tokensData.tokenB.symbol} per {tokensData.tokenA.symbol}
            </p>
          </div>

          <div className="text-center">
            <p>
              <span className="text-small text-numeric">{tokenABRatioFormatted}</span>
            </p>
            <p className="text-micro">
              {tokensData.tokenA.symbol} per {tokensData.tokenB.symbol}
            </p>
          </div>
          <div className="text-center">
            <p>
              <span className="text-small text-numeric">{`${getPoolShare()}%`}</span>
            </p>
            <p className="text-micro">Share of the pool</p>
          </div>
        </div>
      </div>
    ) : null;
  };

  const renderActionButtons = () => {
    return connected && !isHashpackLoading ? (
      <div className="mt-5">
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

        {tokensData.tokenA.hederaId &&
        needApproval.tokenA &&
        !approved.tokenA &&
        createPairData.tokenAAmount &&
        getTokenIsAssociated(tokensData.tokenA) ? (
          <div className="d-grid mt-4">
            <Button
              className="d-flex justify-content-center align-items-center"
              loading={loadingApprove || loadingCheckApprove}
              onClick={() => handleApproveClick('tokenA')}
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

        {tokensData.tokenB.hederaId &&
        needApproval.tokenB &&
        !approved.tokenB &&
        createPairData.tokenBAmount &&
        getTokenIsAssociated(tokensData.tokenB) ? (
          <div className="d-grid mt-4">
            <Button
              className="d-flex justify-content-center align-items-center"
              loading={loadingApprove || loadingCheckApprove}
              onClick={() => handleApproveClick('tokenB')}
            >
              <span>{`Approve ${tokensData.tokenB.symbol}`}</span>
              <Tippy
                content={`You must give the HeliSwap smart contracts permission to use your ${tokensData.tokenB.symbol}.`}
              >
                <span className="ms-2">
                  <Icon name="hint" />
                </span>
              </Tippy>
            </Button>
          </div>
        ) : null}

        <div className="d-grid mt-4">
          <Button loading={loadingCreate} disabled={!readyToProvide} onClick={handleProvideClick}>
            {getProvideButtonLabel()}
          </Button>
        </div>

        {showModalConfirmProvide ? (
          <Modal
            show={showModalConfirmProvide}
            closeModal={() => setShowModalConfirmProvide(false)}
          >
            <ConfirmTransactionModalContent
              isLoading={loadingCreate}
              modalTitle={pageTitle}
              closeModal={() => setShowModalConfirmProvide(false)}
              confirmTansaction={handleProvideConfirm}
              confirmButtonLabel="Confirm"
            >
              {renderProvideConfirmationModalContent()}
            </ConfirmTransactionModalContent>
          </Modal>
        ) : null}
      </div>
    ) : (
      <div className="d-grid mt-4">
        <Button disabled={isHashpackLoading} onClick={() => setShowConnectModal(true)}>
          Connect wallet
        </Button>
      </div>
    );
  };

  const renderProvideConfirmationModalContent = () => {
    const hasSelectedPool = Object.keys(selectedPoolData).length;
    const token0Symbol = hasSelectedPool ? selectedPoolData.token0Symbol : tokensData.tokenA.symbol;
    const token1Symbol = hasSelectedPool ? selectedPoolData.token1Symbol : tokensData.tokenB.symbol;

    const confirmationText = `Providing ${createPairData.tokenAAmount} ${token0Symbol} and ${createPairData.tokenBAmount} ${token1Symbol}`;

    return (
      <>
        {loadingCreate ? (
          <Confirmation confirmationText={confirmationText} />
        ) : (
          <>
            <div className="d-flex align-items-center">
              {formatIcons([token0Symbol, token1Symbol], 'large')}
              <p className="text-subheader ms-3">
                {token0Symbol}/{token1Symbol}
              </p>
            </div>
            <div className="mt-4 rounded border border-secondary justify-content-between ">
              <div className="d-flex justify-content-between align-items-center m-4">
                <div className="d-flex align-items-center">
                  <IconToken symbol={token0Symbol} />
                  <span className="text-main ms-3">{token0Symbol}</span>
                </div>

                <div className="d-flex justify-content-end align-items-center">
                  <span className="text-numeric text-main">{createPairData.tokenAAmount}</span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center m-4">
                <div className="d-flex align-items-center">
                  <IconToken symbol={token1Symbol} />
                  <span className="text-main ms-3">{token1Symbol}</span>
                </div>

                <div className="d-flex justify-content-end align-items-center">
                  <span className="text-numeric text-main">{createPairData.tokenBAmount}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded border border-secondary justify-content-between">
              {renderTokensRatioSection()}
            </div>
            {renderWarningMessage()}
          </>
        )}
      </>
    );
  };

  const tokenBARatio = Number(createPairData.tokenBAmount) / Number(createPairData.tokenAAmount);
  const tokenABRatio = Number(createPairData.tokenAAmount) / Number(createPairData.tokenBAmount);
  const tokenBARatioFormatted = formatStringETHtoPriceFormatted(tokenBARatio.toString());
  const tokenABRatioFormatted = formatStringETHtoPriceFormatted(tokenABRatio.toString());

  return (
    <div className="d-flex justify-content-center">
      <div className="container-action">
        <PageHeader handleBackClick={handleBackClick} slippage="create" title={pageTitle} />
        {renderProvideSection()}
        <ToasterWrapper />
      </div>
    </div>
  );
};

export default Create;
