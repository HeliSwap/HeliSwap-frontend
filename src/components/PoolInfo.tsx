import React, { useState, useContext } from 'react';
import BigNumber from 'bignumber.js';
import { GlobalContext } from '../providers/Global';

import { IPairData } from '../interfaces/tokens';
import { formatStringWeiToStringEther } from '../utils/numberUtils';

import Button from './Button';
import { addressToContractId } from '../utils/tokenUtils';

interface IPoolInfoProps {
  pairData: IPairData;
}

const PoolInfo = ({ pairData }: IPoolInfoProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [showRemoveContainer, setShowRemoveContainer] = useState(false);

  const [lpApproved, setLpApproved] = useState(false);
  const [lpInputValue, setLpInputValue] = useState(
    formatStringWeiToStringEther(pairData.lpShares as string),
  );

  const [removeLpData, setRemoveLpData] = useState({
    tokenInAddress: '',
    tokenOutAddress: '',
    tokensLpAmount: '',
    tokens0Amount: '',
    tokens1Amount: '',
  });

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setLpInputValue(value);
  };

  const calculateTokensAmount = async () => {
    // Convert amounts to BN
    const tokensLPToRemoveBN = new BigNumber(lpInputValue as string);
    const totalSupplyTokensLPBN = new BigNumber(formatStringWeiToStringEther(pairData.pairSupply));
    const token0BN = new BigNumber(formatStringWeiToStringEther(pairData.token0Amount));
    const token1BN = new BigNumber(formatStringWeiToStringEther(pairData.token1Amount));

    // Get LP token ratio - LP tokens to remove / Total amount ot LP tokens
    const ratioBN = tokensLPToRemoveBN.div(totalSupplyTokensLPBN);

    // Calculate reserves token amounts
    const tokens0ToRemoveBN = token0BN.times(ratioBN);
    const tokens1ToRemoveBN = token1BN.times(ratioBN);

    // Convent to string and numbers
    const tokensLPToRemoveStr = tokensLPToRemoveBN.toString();
    const tokens0ToRemoveStr = tokens0ToRemoveBN.toString();
    const tokens1ToRemoveStr = tokens1ToRemoveBN.toString();

    setRemoveLpData({
      tokenInAddress: pairData.token0,
      tokenOutAddress: pairData.token1,
      tokensLpAmount: tokensLPToRemoveStr,
      tokens0Amount: tokens0ToRemoveStr,
      tokens1Amount: tokens1ToRemoveStr,
    });
  };

  const handleRemoveLPButtonClick = async () => {
    await sdk.removeLiquidity(
      hashconnectConnectorInstance,
      userId,
      removeLpData.tokenInAddress,
      removeLpData.tokenOutAddress,
      removeLpData.tokensLpAmount,
      removeLpData.tokens0Amount,
      removeLpData.tokens1Amount,
    );
  };

  const hanleApproveLPClick = async () => {
    try {
      const contractId = addressToContractId(pairData.pairAddress);
      await sdk.approveToken(hashconnectConnectorInstance, userId, contractId);
      setLpApproved(true);
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  const canRemove = lpApproved && removeLpData.tokenInAddress !== '';

  return (
    <div className="mt-4 rounded border border-primary p-4">
      <h3 className="text-title">{pairData.pairSymbol}</h3>
      <div className="d-flex justify-content-between align-items-center mt-4">
        <p>Your total LP tokens:</p>
        <p>{formatStringWeiToStringEther(pairData.lpShares as string)}</p>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <p>Pooled {pairData.token0Symbol}:</p>
        <p>{formatStringWeiToStringEther(pairData.token0Amount as string)}</p>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <p>Pooled {pairData.token1Symbol}:</p>
        <p>{formatStringWeiToStringEther(pairData.token1Amount as string)}</p>
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
                <Button disabled={!canRemove} className="ms-3" onClick={handleRemoveLPButtonClick}>
                  Remove
                </Button>
                <Button className="ms-3" onClick={calculateTokensAmount}>
                  Calculate
                </Button>
              </div>
              <div className="mt-4">
                You will receive:
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <p>Pooled {pairData.token0Symbol}:</p>
                  <p>{removeLpData.tokens0Amount}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <p>Pooled {pairData.token1Symbol}:</p>
                  <p>{removeLpData.tokens1Amount}</p>
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
