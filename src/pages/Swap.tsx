import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import BigNumber from 'bignumber.js';

import {
  ITokenData,
  ISwapTokenData,
  TokenType,
  ITokensData,
  IfaceInitialBalanceData,
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
  formatStringWeiToStringEther,
  getAmountWithSlippage,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';

import usePools from '../hooks/usePools';
import useTokens from '../hooks/useTokens';

import { MAX_UINT_ERC20, MAX_UINT_HTS } from '../constants';
import InputToken from '../components/InputToken';
import ButtonSelector from '../components/ButtonSelector';
import Icon from '../components/Icon';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance, connected, connectWallet } = connection;

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

  // State for pools
  const {
    pools: poolsData,
    loading: loadingPools,
    refetch,
  } = usePools({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const { loading: loadingTDL, tokens: tokenDataList } = useTokens({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '',
    amountOut: '',
  };

  // State for Swap
  const [swapData, setSwapData] = useState(initialSwapData);

  // State for approved
  const [approved, setApproved] = useState(false);

  // State for associated
  const [associated, setAssociated] = useState(false);

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
  const [readyToApprove, setReadyToApprove] = useState(false);
  const [readyToAssociate, setReadyToAssociate] = useState(false);
  const [readyToSwap, setReadyToSwap] = useState(false);
  const [tokenInExactAmount, setTokenInExactAmount] = useState(true);
  const [bestPath, setBestPath] = useState<string[]>([]);
  const [ratioBasedOnTokenOut, setRatioBasedOnTokenOut] = useState(true);

  // State for general error
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successSwap, setSuccessSwap] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);

  const getInsufficientTokenIn = useCallback(() => {
    const { tokenA: tokenABalance } = tokenBalances;
    const { amountIn } = swapData;
    return tokenABalance && amountIn && new BigNumber(amountIn).gt(new BigNumber(tokenABalance));
  }, [swapData, tokenBalances]);

  const handleInputChange = async (
    value: string,
    name: string,
    inputTokensData: any = tokensData,
  ) => {
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
          poolsData || [],
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
          poolsData || [],
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
    setSuccessSwap(false);
    setSuccessMessage('');
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

  const switchTokens = () => {
    const newTokensData = {
      tokenA: tokensData.tokenB,
      tokenB: tokensData.tokenA,
    };
    setTokensData(newTokensData);
    const newInputValueKey = tokenInExactAmount ? 'amountOut' : 'amountIn';
    const oldInputValueKey = tokenInExactAmount ? 'amountIn' : 'amountOut';

    handleInputChange(swapData[oldInputValueKey], newInputValueKey, newTokensData);
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
    const getAllowanceHTS = async (userId: string) => {
      const { amountIn: amountToSpend, tokenIdIn } = swapData;

      const {
        tokenA: { type, decimals },
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
  }, [tokensData, userId, initialBallanceData]);

  useEffect(() => {
    let ready = true;

    // First token needs to be approved
    if (!approved) {
      ready = false;
    }

    // Token amounts need to be gt 0
    if (!swapData.amountIn || !swapData.amountOut || getInsufficientTokenIn()) {
      ready = false;
    }

    const readyToAssociate =
      !isNaN(Number(swapData.amountOut)) &&
      Number(swapData.amountOut) > 0 &&
      swapData.tokenIdOut !== initialSwapData.tokenIdOut &&
      Object.keys(tokensData.tokenB).length !== 0 &&
      !insufficientLiquidity;
    setReadyToAssociate(readyToAssociate);

    const readyToApprove =
      Object.keys(tokensData.tokenA).length !== 0 &&
      !isNaN(Number(swapData.amountIn)) &&
      Number(swapData.amountIn) > 0 &&
      !insufficientLiquidity;
    setReadyToApprove(readyToApprove);

    setReadyToSwap(ready);
  }, [
    swapData,
    approved,
    initialSwapData.tokenIdOut,
    tokenBalances,
    getInsufficientTokenIn,
    tokensData,
    insufficientLiquidity,
  ]);

  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);

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
        {getSuccessMessage()}

        <InputTokenSelector
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
            modalTitle="Select a token"
            tokenFieldId="tokenA"
            setTokensData={newTokensData => {
              const { tokenA } = newTokensData();
              if (tokenA && typeof tokenA.hederaId !== 'undefined') {
                const newSwapData = {
                  tokenIdOut: tokenA.hederaId,
                  tokenOutDecimals: tokenA.decimals,
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

        <div onClick={switchTokens} className="text-center my-4">
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
          walletBalanceComponent={<WalletBalance walletBalance={tokenBalances.tokenB} />}
        />
        <Modal show={showModalB}>
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
    if (getInsufficientTokenIn()) return `Unsufficient ${tokenA.symbol} balance`;
    if (insufficientLiquidity) return 'Insufficient liquidity for this trade.';
    return willWrapTokens ? 'wrap' : willUnwrapTokens ? 'unwrap' : 'swap';
  };

  const getSwapButtonDisabledState = () => {
    return !readyToSwap || !associated;
  };

  const getActionButtons = () => {
    return connected ? (
      <>
        {loadingPools ? (
          <div className="d-flex justify-content-center mt-4">
            <Loader />
          </div>
        ) : (
          <>
            {readyToApprove && !approved ? (
              <div className="d-grid mt-4">
                <Button
                  loading={loadingApprove}
                  disabled={Number(swapData.amountIn) <= 0}
                  onClick={() => handleApproveClick()}
                >
                  {`Approve ${tokensData.tokenA.symbol}`}
                </Button>
              </div>
            ) : null}

            {readyToAssociate && !associated ? (
              <div className="d-grid mt-4">
                <Button
                  loading={loadingSwap}
                  disabled={!readyToAssociate}
                  onClick={() => handleAssociateClick()}
                >
                  Associate token
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
          <Modal show={showModalConfirmSwap}>
            <ConfirmTransactionModalContent
              modalTitle="Confirm swap"
              closeModal={() => setShowModalConfirmSwap(false)}
              confirmTansaction={handleSwapConfirm}
              confirmButtonLabel="Confirm swap"
            >
              <InputTokenSelector
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
              {getTokensRatio()}
              {getAdvancedSwapInfo()}
            </ConfirmTransactionModalContent>
          </Modal>
        ) : null}
      </>
    ) : (
      <div className="d-grid mt-4">
        <Button onClick={() => connectWallet()}>Connect wallet</Button>
      </div>
    );
  };

  const getSuccessMessage = () => {
    return successSwap ? (
      <div className="alert alert-success alert-dismissible mb-5" role="alert">
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
      >{`1 ${baseTokenName} = ${ratio} ${secondTokenName}`}</div>
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
            <span className="text-small text-numeric text-bold">{`${swapData.amountOut} ${tokensData.tokenB.symbol}`}</span>
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

            <span className="text-small text-numeric text-bold">{`${amountAfterSlippageStr} ${secondTokenName}`}</span>
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
