import React, { useState, useEffect, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { IPairData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from './Button';

import { formatStringToStringWei, formatStringWeiToStringEther } from '../utils/numberUtils';
import { addressToContractId, idToAddress, calculateReserves } from '../utils/tokenUtils';
import { getConnectedWallet } from '../pages/Helpers';

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
  });

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

    const { reserve0ShareHBN, reserve1ShareHBN } = calculateReserves(
      tokensLPToRemove,
      pairSupply,
      token0Amount,
      token1Amount,
      token0Decimals,
      token1Decimals,
    );

    const tokensLpAmount = tokensLPToRemove.toString();
    const tokens0Amount = reserve0ShareHBN.toString();
    const tokens1Amount = reserve1ShareHBN.toString();

    setRemoveLpData({
      tokenInAddress,
      tokenOutAddress,
      tokensLpAmount,
      tokens0Amount,
      tokens1Amount,
    });
  };

  const handleRemoveLPButtonClick = async () => {
    setLoadingRemove(true);
    setErrorRemove(false);

    try {
      const responseData = await sdk.removeLiquidity(
        hashconnectConnectorInstance,
        userId,
        removeLpData.tokenInAddress,
        removeLpData.tokenOutAddress,
        removeLpData.tokensLpAmount,
        removeLpData.tokens0Amount,
        removeLpData.tokens1Amount,
      );

      const { response } = responseData;
      const { success } = response;

      if (success) {
        setRemoveLpData({
          tokenInAddress: '',
          tokenOutAddress: '',
          tokensLpAmount: '',
          tokens0Amount: '0.0',
          tokens1Amount: '0.0',
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
    try {
      const contractId = addressToContractId(pairData.pairAddress);
      await sdk.approveToken(
        hashconnectConnectorInstance,
        userId,
        contractId,
        removeLpData.tokensLpAmount,
      );
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

        setLpApproved(resultNum > 10000);
      }
    };

    pairData && pairData.pairAddress && userId && getApproved();
  }, [pairData, connectedWallet, sdk, userId]);

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
        <p>{reserve0ShareStr}</p>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <p>Pooled {pairData.token1Symbol}:</p>
        <p>{reserve1ShareStr}</p>
      </div>
      <hr />
      <div className="mt-4 row">
        <div className="col-md-7">
          <div className="d-flex">
            <Button>Add Liquidity</Button>
            <Button onClick={() => setShowRemoveContainer(prev => !prev)} className="ms-3">
              Remove Liquidity
            </Button>
          </div>

          {showRemoveContainer ? (
            <div className="mt-4 rounded border border-secondary p-4">
              {errorRemove ? (
                <div className="alert alert-danger mb-5" role="alert">
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
                You will receive:
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <p>Pooled {pairData.token0Symbol}:</p>
                  <p>
                    {formatStringWeiToStringEther(
                      removeLpData.tokens0Amount,
                      pairData.token0Decimals,
                    )}
                  </p>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <p>Pooled {pairData.token1Symbol}:</p>
                  <p>
                    {formatStringWeiToStringEther(
                      removeLpData.tokens1Amount,
                      pairData.token1Decimals,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PoolInfo;
