import React, { useState, useEffect, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import {
  ITokenData,
  TokenType,
  IPairData,
  ICreatePairData,
  ITokensData,
} from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import WalletBalance from '../components/WalletBalance';
import TransactionSettingsModalContent from '../components/Modals/TransactionSettingsModalContent';

import errorMessages from '../content/errors';
import { idToAddress } from '../utils/tokenUtils';
import { formatStringToBigNumberEthersWei } from '../utils/numberUtils';
import {
  getTransactionSettings,
  INITIAL_PROVIDE_SLIPPAGE_TOLERANCE,
  handleSaveTransactionSettings,
} from '../utils/transactionUtils';
import { getConnectedWallet } from './Helpers';
import usePools from '../hooks/usePools';

const Create = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  // State for modals
  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);
  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);

  // State for token inputs
  const [tokensData, setTokensData] = useState<ITokensData>({
    tokenA: {} as ITokenData,
    tokenB: {} as ITokenData,
  });

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

  // State for approved
  const [approved, setApproved] = useState({
    tokenA: false,
    tokenB: false,
  });

  // State for common pool data
  const [selectedPoolData, setSelectedPoolData] = useState<IPairData>({} as IPairData);

  // Additional states for Providing/Creating pairs
  const [readyToProvide, setReadyToProvide] = useState(false);
  const [tokensInSamePool, setTokensInSamePool] = useState(false);
  const [provideNative, setProvideNative] = useState(false);

  // State for general error
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
    const { hederaId, decimals } = tokensData[key];
    const keyAmount = `${key}Amount` as keyof ICreatePairData;
    const amount = createPairData[keyAmount] as string;

    setLoadingApprove(true);

    try {
      const receipt = await sdk.approveToken(
        hashconnectConnectorInstance,
        userId,
        hederaId,
        amount,
        decimals,
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
    setLoadingCreate(true);
    setError(false);
    setErrorMessage('');

    try {
      //TODO add logic for adding native liquidity
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
        setTokensData({
          tokenA: {} as ITokenData,
          tokenB: {} as ITokenData,
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
      setLoadingCreate(false);
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
        const key = `${index}Amount`;

        setApproved(prev => ({
          ...prev,
          [index]: resultNum >= Number(createPairData[key as keyof ICreatePairData]),
        }));
      } else {
        setApproved(prev => ({ ...prev, [index]: false }));
      }
    };

    const { tokenA, tokenB } = tokensData;

    if (tokenA.type === TokenType.HBAR) {
      setApproved(prev => ({ ...prev, tokenA: true }));
    } else if (tokenA.type === TokenType.ERC20) {
      tokenA.hederaId && getApproved(tokenA.hederaId, 'tokenA');
    }

    if (tokenB.type === TokenType.HBAR) {
      setApproved(prev => ({ ...prev, tokenB: true }));
    } else if (tokenB.type === TokenType.ERC20) {
      tokenB.hederaId && getApproved(tokenB.hederaId, 'tokenB');
    }
  }, [tokensData, sdk, userId, createPairData]);

  useEffect(() => {
    const { tokenA, tokenB } = tokensData;
    const newPairData = {
      tokenAId: tokenA.hederaId,
      tokenBId: tokenB.hederaId,
      tokenADecimals: tokenA.decimals,
      tokenBDecimals: tokenB.decimals,
    };
    setCreatePairData(prev => ({ ...prev, ...newPairData }));
  }, [tokensData]);

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
              slippage={getTransactionSettings().provideSlippage}
              expiration={getTransactionSettings().transactionExpiration}
              saveChanges={handleSaveTransactionSettings}
              defaultSlippageValue={INITIAL_PROVIDE_SLIPPAGE_TOLERANCE}
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
                <div className="d-flex align-items-center">
                  <img
                    className="me-2"
                    width={24}
                    src={`/icons/${tokensData.tokenB.symbol}.png`}
                    alt=""
                  />
                  <span className="me-2">{tokensData?.tokenB.symbol}</span>
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

        {readyToProvide ? (
          <div className="bg-slate rounded p-4 my-4">
            {tokensInSamePool ? (
              <div>
                <p>Prices and pool share</p>
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
          {tokensData.tokenA.hederaId && !approved.tokenA && createPairData.tokenAAmount !== '0' ? (
            <Button
              loading={loadingApprove}
              onClick={() => handleApproveClick('tokenA')}
              className="mx-2"
            >{`Approve ${tokensData.tokenA.symbol}`}</Button>
          ) : null}

          {tokensData.tokenB.hederaId && !approved.tokenB && createPairData.tokenBAmount !== '0' ? (
            <Button
              loading={loadingApprove}
              onClick={() => handleApproveClick('tokenB')}
              className="mx-2"
            >{`Approve ${tokensData.tokenB.symbol}`}</Button>
          ) : null}

          {approved.tokenA && approved.tokenB ? (
            tokensInSamePool ? (
              <Button
                loading={loadingCreate}
                disabled={!readyToProvide}
                onClick={handleCreateClick}
              >
                Provide
              </Button>
            ) : (
              <Button
                loading={loadingCreate}
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
