import React, { useState, useEffect, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { IPairData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from './Button';

import { formatStringToStringWei, formatStringWeiToStringEther } from '../utils/numberUtils';
import { addressToContractId, idToAddress, calculateReserves } from '../utils/tokenUtils';
import { getTransactionSettings } from '../utils/transactionUtils';
import { getConnectedWallet } from '../pages/Helpers';
import { MAX_UINT_ERC20 } from '../constants';

interface IPoolInfoProps {
  pairData: IPairData;
}

const PoolInfo = ({ pairData }: IPoolInfoProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const connectedWallet = getConnectedWallet();

  const [showRemoveContainer, setShowRemoveContainer] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const [errorRemove, setErrorRemove] = useState(false);

  const [lpApproved, setLpApproved] = useState(false);
  const [lpInputValue, setLpInputValue] = useState(
    formatStringWeiToStringEther(pairData.lpShares as string),
  );

  const [removeLpData, setRemoveLpData] = useState({
    tokenInAddress: '',
    tokenOutAddress: '',
    tokensLpAmount: '',
    tokens0Amount: '0.0',
    tokens1Amount: '0.0',
    token0Decimals: 0,
    token1Decimals: 0,
  });

  const [removeNative, setRemoveNative] = useState(false);
  const [hasWrappedHBAR, setHasWrappedHBAR] = useState(false);

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setLpInputValue(value);
  };

  const handleCalculateButtonClick = async () => {
    const {
      pairSupply,
      token0Amount,
      token1Amount,
      token0: tokenInAddress,
      token1: tokenOutAddress,
      token0Decimals,
      token1Decimals,
    } = pairData;
    const tokensLPToRemove = formatStringToStringWei(lpInputValue);

    const { reserve0ShareStr: tokens0Amount, reserve1ShareStr: tokens1Amount } = calculateReserves(
      tokensLPToRemove,
      pairSupply,
      token0Amount,
      token1Amount,
      token0Decimals,
      token1Decimals,
    );

    const tokensLpAmount = hethers.utils.formatUnits(tokensLPToRemove, 18).toString();

    setRemoveLpData({
      tokenInAddress,
      tokenOutAddress,
      tokensLpAmount,
      tokens0Amount,
      tokens1Amount,
      token0Decimals,
      token1Decimals,
    });
  };

  const handleRemoveLPButtonClick = async () => {
    setLoadingRemove(true);
    setErrorRemove(false);

    try {
      let responseData;
      const { removeSlippage, transactionExpiration } = getTransactionSettings();

      if (hasWrappedHBAR && removeNative) {
        const isFirstTokenWHBAR = pairData.token0 === process.env.REACT_APP_WHBAR_ADDRESS;

        const WHBARAmount = isFirstTokenWHBAR
          ? removeLpData.tokens0Amount
          : removeLpData.tokens1Amount;

        const WHBARDecimals = isFirstTokenWHBAR
          ? removeLpData.token0Decimals
          : removeLpData.token1Decimals;

        const tokenAmount = isFirstTokenWHBAR
          ? removeLpData.tokens1Amount
          : removeLpData.tokens0Amount;

        const tokenDecimals = isFirstTokenWHBAR
          ? removeLpData.token1Decimals
          : removeLpData.token0Decimals;

        const tokenAddress = isFirstTokenWHBAR
          ? removeLpData.tokenOutAddress
          : removeLpData.tokenInAddress;

        responseData = await sdk.removeNativeLiquidity(
          hashconnectConnectorInstance,
          userId,
          tokenAddress,
          removeLpData.tokensLpAmount,
          tokenAmount,
          WHBARAmount,
          tokenDecimals,
          WHBARDecimals,
          removeSlippage,
          transactionExpiration,
        );
      } else {
        responseData = await sdk.removeLiquidity(
          hashconnectConnectorInstance,
          userId,
          removeLpData.tokenInAddress,
          removeLpData.tokenOutAddress,
          removeLpData.tokensLpAmount,
          removeLpData.tokens0Amount,
          removeLpData.tokens1Amount,
          removeLpData.token0Decimals,
          removeLpData.token1Decimals,
          removeSlippage,
          transactionExpiration,
        );
      }

      const { response } = responseData;
      const { success } = response;

      if (success) {
        setRemoveLpData({
          tokenInAddress: '',
          tokenOutAddress: '',
          tokensLpAmount: '',
          tokens0Amount: '0.0',
          tokens1Amount: '0.0',
          token0Decimals: 0,
          token1Decimals: 0,
        });
        setShowRemoveContainer(false);
      } else {
        setErrorRemove(true);
      }
    } catch (e) {
      console.error(e);
      setErrorRemove(true);
    } finally {
      setLoadingRemove(false);
    }
  };

  const hanleApproveLPClick = async () => {
    const amount = MAX_UINT_ERC20.toString();

    try {
      const contractId = addressToContractId(pairData.pairAddress);
      await sdk.approveToken(hashconnectConnectorInstance, amount, userId, contractId);
      setLpApproved(true);
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  useEffect(() => {
    const getApproved = async () => {
      if (connectedWallet) {
        const resultBN = await sdk.checkAllowance(
          pairData.pairAddress,
          idToAddress(userId),
          process.env.REACT_APP_ROUTER_ADDRESS as string,
          connectedWallet,
        );

        const resultStr = hethers.utils.formatUnits(resultBN, 18);
        const resultNum = Number(resultStr);

        setLpApproved(resultNum >= Number(removeLpData.tokensLpAmount));
      }
    };

    pairData && pairData.pairAddress && userId && getApproved();

    if (pairData && pairData.pairAddress) {
      setHasWrappedHBAR(
        pairData.token0 === process.env.REACT_APP_WHBAR_ADDRESS ||
          pairData.token1 === process.env.REACT_APP_WHBAR_ADDRESS,
      );
    }
  }, [pairData, connectedWallet, removeLpData, sdk, userId]);

  const canRemove = lpApproved && removeLpData.tokenInAddress !== '';

  const { reserve0ShareStr, reserve1ShareStr } = calculateReserves(
    pairData.lpShares as string,
    pairData.pairSupply,
    pairData.token0Amount,
    pairData.token1Amount,
    pairData.token0Decimals,
    pairData.token1Decimals,
  );

  const formatIcons = (icons: string[]) =>
    icons &&
    icons.length > 0 &&
    icons.map((item, index) => <img key={index} width={20} src={`/icons/${item}.png`} alt="" />);

  return (
    <div className="mt-4 rounded border border-primary p-4">
      <div className="d-flex align-items-center">
        {formatIcons([pairData.token0Symbol, pairData.token1Symbol])}
        <h3 className="text-title ms-2">{pairData.pairSymbol}</h3>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-4">
        <p>Your total LP tokens:</p>
        <p>{formatStringWeiToStringEther(pairData.lpShares as string)}</p>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <p>Pooled {pairData.token0Symbol}:</p>
        <p className="d-flex align-items-center">
          <span className="me-2">{reserve0ShareStr}</span>
          <img width={20} src={`/icons/${pairData.token0Symbol}.png`} alt="" />
        </p>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <p>Pooled {pairData.token1Symbol}:</p>
        <p className="d-flex align-items-center">
          <span className="me-2">{reserve1ShareStr}</span>
          <img width={20} src={`/icons/${pairData.token1Symbol}.png`} alt="" />
        </p>
      </div>
      <hr />
      <div className="mt-4">
        <div className="d-flex">
          <Button>Add Liquidity</Button>
          <Button onClick={() => setShowRemoveContainer(prev => !prev)} className="ms-3">
            Remove Liquidity
          </Button>
        </div>

        {showRemoveContainer ? (
          <div className="mt-4 rounded border border-secondary p-4">
            {errorRemove ? (
              <div className="alert alert-danger mb-4" role="alert">
                <strong>Something went wrong!</strong>
              </div>
            ) : null}
            <input
              value={lpInputValue}
              onChange={hanleLpInputChange}
              type="text"
              name=""
              className="form-control mt-2"
            />
            <div className="mt-4 d-flex">
              <Button disabled={lpApproved} onClick={hanleApproveLPClick}>
                Approve
              </Button>
              <Button
                loading={loadingRemove}
                disabled={!canRemove}
                className="ms-3"
                onClick={handleRemoveLPButtonClick}
              >
                Remove
              </Button>
              <Button className="ms-3" onClick={handleCalculateButtonClick}>
                Calculate
              </Button>
            </div>
            <div className="mt-4">
              {hasWrappedHBAR ? (
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={removeNative}
                      onClick={() => setRemoveNative(!removeNative)}
                    />
                    <span className="ms-2">Receive HBAR</span>
                  </label>
                </div>
              ) : null}
              You will receive:
              <div className="d-flex justify-content-between align-items-center mt-2">
                <p>Pooled {pairData.token0Symbol}:</p>
                <p className="d-flex align-items-center">
                  <span className="me-2">{removeLpData.tokens0Amount}</span>
                  <img width={20} src={`/icons/${pairData.token0Symbol}.png`} alt="" />
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <p>Pooled {pairData.token1Symbol}:</p>
                <p className="d-flex align-items-center">
                  <span className="me-2">{removeLpData.tokens1Amount}</span>
                  <img width={20} src={`/icons/${pairData.token1Symbol}.png`} alt="" />
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PoolInfo;
