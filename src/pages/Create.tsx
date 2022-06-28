import React, { useState, useEffect, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import {
  ITokenData,
  TokenType,
  IPairData,
  ICreatePairData,
  ITokensData,
  IfaceInitialBalanceData,
} from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import TransactionSettingsModalContent from '../components/Modals/TransactionSettingsModalContent';
import InputTokenSelector from '../components/InputTokenSelector';
import InputToken from '../components/InputToken';
import ButtonSelector from '../components/ButtonSelector';
import WalletBalance from '../components/WalletBalance';

import errorMessages from '../content/errors';
import { checkAllowanceHTS, getTokenBalance, idToAddress } from '../utils/tokenUtils';
import { formatStringToBigNumberEthersWei } from '../utils/numberUtils';
import {
  getTransactionSettings,
  INITIAL_PROVIDE_SLIPPAGE_TOLERANCE,
  handleSaveTransactionSettings,
} from '../utils/transactionUtils';
import { getConnectedWallet } from './Helpers';
import usePools from '../hooks/usePools';
import { MAX_UINT_ERC20, MAX_UINT_HTS } from '../constants';

const Create = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  // State for modals
  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);
  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);

  const initialTokensData = {
    tokenA: {} as ITokenData,
    tokenB: {} as ITokenData,
  };

  // State for token inputs
  const [tokensData, setTokensData] = useState<ITokensData>(initialTokensData);

  // State for pools
  const { pools: poolsData } = usePools({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const initialCreateData: ICreatePairData = {
    tokenAAmount: '0',
    tokenBAmount: '0',
    tokenAId: '',
    tokenBId: '',
    tokenADecimals: 18,
    tokenBDecimals: 18,
  };

  // State for Create/Provide
  const [createPairData, setCreatePairData] = useState<ICreatePairData>(initialCreateData);

  const initialApproveData = {
    tokenA: false,
    tokenB: false,
  };

  // State for approved
  const [approved, setApproved] = useState(initialApproveData);

  // State for common pool data
  const [selectedPoolData, setSelectedPoolData] = useState<IPairData>({} as IPairData);

  // State for token balances
  const initialBallanceData = {
    tokenA: undefined,
    tokenB: undefined,
  };

  const [tokenBalances, setTokenBalances] = useState<IfaceInitialBalanceData>(initialBallanceData);

  // Additional states for Providing/Creating pairs
  const [readyToProvide, setReadyToProvide] = useState(false);
  const [tokensInSamePool, setTokensInSamePool] = useState(false);
  const [provideNative, setProvideNative] = useState(false);

  // State for general error
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successCreate, setSuccessCreate] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    const inputToken = name === 'tokenAAmount' ? tokensData.tokenA : tokensData.tokenB;
    const inputTokenAddress = inputToken.address
      ? inputToken.address
      : (process.env.REACT_APP_WHBAR_ADDRESS as string);

    if (tokensInSamePool) {
      const isInputAddressFirstInPool = inputTokenAddress === selectedPoolData?.token0;

      const inputTokenAmount = isInputAddressFirstInPool
        ? (selectedPoolData?.token0Amount as string)
        : (selectedPoolData?.token1Amount as string);

      const calculatedTokenAmount = isInputAddressFirstInPool
        ? (selectedPoolData?.token1Amount as string)
        : (selectedPoolData?.token0Amount as string);

      const inputTokenDecimals = isInputAddressFirstInPool
        ? selectedPoolData?.token0Decimals
        : selectedPoolData?.token1Decimals;

      const calculatedTokenDecimals = isInputAddressFirstInPool
        ? selectedPoolData?.token1Decimals
        : selectedPoolData?.token0Decimals;

      const token0AmountBN = hethers.BigNumber.from(inputTokenAmount);
      const token1AmountBN = hethers.BigNumber.from(calculatedTokenAmount);

      const valueBN = formatStringToBigNumberEthersWei(value, inputTokenDecimals);
      const keyToUpdate = name === 'tokenAAmount' ? 'tokenBAmount' : 'tokenAAmount';
      const valueToUpdate = valueBN.mul(token1AmountBN).div(token0AmountBN);

      setCreatePairData(prev => ({
        ...prev,
        [keyToUpdate]: hethers.utils.formatUnits(valueToUpdate, calculatedTokenDecimals).toString(),
        [name]: value,
      }));
    } else {
      setCreatePairData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApproveClick = async (key: string) => {
    const { hederaId, type } = tokensData[key];
    const amount = type === TokenType.ERC20 ? MAX_UINT_ERC20.toString() : MAX_UINT_HTS.toString();

    setLoadingApprove(true);

    try {
      const receipt = await sdk.approveToken(
        hashconnectConnectorInstance,
        amount,
        userId,
        hederaId,
      );
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
      setLoadingApprove(false);
    }
  };

  const handleCreateClick = async () => {
    const { provideSlippage, transactionExpiration } = getTransactionSettings();

    setError(false);
    setErrorMessage('');
    setSuccessCreate(false);
    setSuccessMessage('');
    setLoadingCreate(true);

    try {
      const receipt = provideNative
        ? await sdk.addNativeLiquidity(
            hashconnectConnectorInstance,
            userId,
            createPairData,
            provideSlippage,
            transactionExpiration,
          )
        : await sdk.addLiquidity(
            hashconnectConnectorInstance,
            userId,
            createPairData,
            provideSlippage,
            transactionExpiration,
          );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        const successMessage = `Provided exactly ${createPairData.tokenAAmount} ${tokensData.tokenA.symbol} and ${createPairData.tokenBAmount} ${tokensData.tokenB.symbol}`;

        setCreatePairData(initialCreateData);
        setTokensData(initialTokensData);
        setSelectedPoolData({} as IPairData);
        setApproved(initialApproveData);
        setSuccessCreate(true);
        setSuccessMessage(successMessage);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage('Error on create');
    } finally {
      setLoadingCreate(false);
    }
  };

  useEffect(() => {
    const getAllowanceERC20 = async (token: ITokenData, index: string) => {
      const connectedWallet = getConnectedWallet();
      if (connectedWallet) {
        const tokenAddress = idToAddress(token.hederaId);
        const userAddress = idToAddress(userId);
        const resultBN = await sdk.checkAllowance(
          tokenAddress,
          userAddress,
          process.env.REACT_APP_ROUTER_ADDRESS as string,
          connectedWallet,
        );

        const resultStr = hethers.utils.formatUnits(resultBN, token.decimals);
        const resultNum = Number(resultStr);
        const key = `${index}Amount`;

        setApproved(prev => ({
          ...prev,
          [index]: resultNum >= Number(createPairData[key as keyof ICreatePairData]),
        }));
      } else {
        setApproved(prev => ({ ...prev, [index]: false }));
      }
    };

    const getAllowanceHTS = async (userId: string, token: ITokenData, index: string) => {
      const key = `${index}Amount`;
      const amountToSpend = createPairData[key as keyof ICreatePairData] as string;
      const canSpend = await checkAllowanceHTS(userId, token, amountToSpend);

      setApproved(prev => ({ ...prev, [index]: canSpend }));
    };

    const { tokenA, tokenB } = tokensData;

    if (tokenA.type === TokenType.HBAR) {
      setApproved(prev => ({ ...prev, tokenA: true }));
    } else if (tokenA.type === TokenType.ERC20) {
      getAllowanceERC20(tokenA, 'tokenA');
    } else {
      userId && tokenA.hederaId && getAllowanceHTS(userId, tokenA, 'tokenA');
    }

    if (tokenB.type === TokenType.HBAR) {
      setApproved(prev => ({ ...prev, tokenB: true }));
    } else if (tokenB.type === TokenType.ERC20) {
      getAllowanceERC20(tokenB, 'tokenB');
    } else {
      userId && tokenB.hederaId && getAllowanceHTS(userId, tokenB, 'tokenB');
    }
  }, [tokensData, sdk, userId, createPairData]);

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
    const newPairData: ICreatePairData = {
      tokenAId: tokenA.hederaId,
      tokenBId: tokenB.hederaId,
      tokenADecimals: tokenA.decimals,
      tokenBDecimals: tokenB.decimals,
      tokenAAmount: '0',
      tokenBAmount: '0',
    };

    setCreatePairData(prev => ({ ...prev, ...newPairData }));
    setApproved({ tokenA: false, tokenB: false });
    if (userId) getTokenBalances();
  }, [tokensData, userId]);

  useEffect(() => {
    const { tokenA, tokenB } = tokensData;

    const tokenAIsNative = tokenA.type === TokenType.HBAR;
    const tokenBIsNative = tokenB.type === TokenType.HBAR;
    const provideNative = tokenAIsNative || tokenBIsNative;
    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS as string;

    const selectedPoolData =
      (poolsData &&
        poolsData.length > 0 &&
        poolsData.filter((pool: any) => {
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
    setTokensInSamePool(selectedPoolData && selectedPoolData.length !== 0);
  }, [tokensData, poolsData]);

  useEffect(() => {
    let isReady = true;

    const { tokenAAmount, tokenAId, tokenBAmount, tokenBId } = createPairData;

    if (tokenAAmount === '0' || tokenBAmount === '0') {
      isReady = false;
    }

    // Not safe enough
    if (!provideNative) {
      if (tokenAId === '' || tokenBId === '') {
        isReady = false;
      }
    }

    setReadyToProvide(isReady);
  }, [createPairData, provideNative]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-action">
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
              slippage={getTransactionSettings().provideSlippage}
              expiration={getTransactionSettings().transactionExpiration}
              saveChanges={handleSaveTransactionSettings}
              defaultSlippageValue={INITIAL_PROVIDE_SLIPPAGE_TOLERANCE}
            />
          </Modal>
        ) : null}

        <div className="container-dark">
          {error ? (
            <div className="alert alert-danger my-5" role="alert">
              <strong>Something went wrong!</strong>
              <p>{errorMessages[errorMessage]}</p>
            </div>
          ) : null}

          {successCreate ? (
            <div className="alert alert-success alert-dismissible my-5" role="alert">
              <strong>Success provide!</strong>
              <p>{successMessage}</p>
              <button
                onClick={() => setSuccessCreate(false)}
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
              ></button>
            </div>
          ) : null}

          <InputTokenSelector
            inputTokenComponent={
              <InputToken
                value={createPairData.tokenAAmount}
                onChange={handleInputChange}
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
              <WalletBalance
                walletBalance={tokenBalances.tokenA}
                onMaxButtonClick={(maxValue: string) => {
                  // handleInputChange(maxValue);
                }}
              />
            }
          />
          <Modal show={showModalA}>
            <ModalSearchContent
              modalTitle="Select a token"
              tokenFieldId="tokenA"
              setTokensData={setTokensData}
              closeModal={() => setShowModalA(false)}
            />
          </Modal>

          <InputTokenSelector
            className="mt-4"
            inputTokenComponent={
              <InputToken
                value={createPairData.tokenBAmount}
                onChange={handleInputChange}
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

          {readyToProvide ? (
            <div className="my-4">
              {tokensInSamePool ? (
                <div>
                  <div className="mt-3 d-flex justify-content-around">
                    <div className="text-center">
                      <p>
                        <span className="text-small text-numeric">
                          {Number(createPairData.tokenBAmount) /
                            Number(createPairData.tokenAAmount)}
                        </span>
                      </p>
                      <p className="text-micro">
                        {tokensData.tokenB.symbol} per {tokensData.tokenA.symbol}
                      </p>
                    </div>

                    <div className="text-center">
                      <p>
                        <span className="text-small text-numeric">
                          {Number(createPairData.tokenAAmount) /
                            Number(createPairData.tokenBAmount)}
                        </span>
                      </p>
                      <p className="text-micro">
                        {tokensData.tokenA.symbol} per {tokensData.tokenB.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mt-3 d-flex justify-content-around">
                    <div className="text-center">
                      <p>
                        <span className="text-small text-numeric">
                          {Number(createPairData.tokenBAmount) /
                            Number(createPairData.tokenAAmount)}
                        </span>
                      </p>
                      <p className="text-micro">
                        {tokensData.tokenB.symbol} per {tokensData.tokenA.symbol}
                      </p>
                    </div>

                    <div className="text-center">
                      <p>
                        <span className="text-small text-numeric">
                          {Number(createPairData.tokenAAmount) /
                            Number(createPairData.tokenBAmount)}
                        </span>
                      </p>
                      <p className="text-micro">
                        {tokensData.tokenA.symbol} per {tokensData.tokenB.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-5">
            {tokensData.tokenA.hederaId &&
            !approved.tokenA &&
            createPairData.tokenAAmount !== '0' ? (
              <div className="d-grid mt-4">
                <Button
                  loading={loadingApprove}
                  onClick={() => handleApproveClick('tokenA')}
                  className="mx-2"
                >{`Approve ${tokensData.tokenA.symbol}`}</Button>
              </div>
            ) : null}

            {tokensData.tokenB.hederaId &&
            !approved.tokenB &&
            createPairData.tokenBAmount !== '0' ? (
              <div className="d-grid mt-4">
                <div className="d-grid mt-4">
                  {' '}
                  <Button
                    loading={loadingApprove}
                    onClick={() => handleApproveClick('tokenB')}
                    className="mx-2"
                  >{`Approve ${tokensData.tokenB.symbol}`}</Button>
                </div>
              </div>
            ) : null}

            {approved.tokenA && approved.tokenB ? (
              tokensInSamePool ? (
                <div className="d-grid mt-4">
                  <Button
                    loading={loadingCreate}
                    disabled={!readyToProvide}
                    onClick={handleCreateClick}
                  >
                    Provide
                  </Button>
                </div>
              ) : (
                <div className="d-grid mt-4">
                  {' '}
                  <Button
                    loading={loadingCreate}
                    disabled={!readyToProvide}
                    onClick={handleCreateClick}
                  >
                    Create
                  </Button>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
