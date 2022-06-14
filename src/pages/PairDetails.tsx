import React, { useEffect, useState, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../providers/Global';

import { useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';

import { IPairData } from '../interfaces/tokens';

import { idToAddress, addressToContractId } from '../utils/tokenUtils';
import { INITIAL_EXPIRATION_TIME, INITIAL_SLIPPAGE_TOLERANCE } from '../utils/transactionUtils';
import {
  formatStringToBigNumberEthersWei,
  formatStringWeiToStringEther,
} from '../utils/numberUtils';
import { getConnectedWallet } from './Helpers';
import Loader from '../components/Loader';
import Button from '../components/Button';

const PairDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const connectedWallet = getConnectedWallet();

  const { address } = useParams();

  const { error, loading, data, refetch } = useQuery(GET_POOLS);
  const [pairData, setPairData] = useState<IPairData>({} as IPairData);
  const [pairDataContracts, setPairDataContracts] = useState({
    balance: '0.0',
    totalSupply: '0.0',
    token0: '0.0',
    token1: '0.0',
    totalSupplyBN: hethers.BigNumber.from(0),
    token0BN: hethers.BigNumber.from(0),
    token1BN: hethers.BigNumber.from(0),
  });

  const [lpApproved, setLpApproved] = useState(false);
  const [lpInputValue, setLpInputValue] = useState('');

  useEffect(() => {
    if (data && data.pools.length > 0) {
      const foundPool = data.pools.find((pool: IPairData) => pool.pairAddress === address);

      if (foundPool) {
        setPairData(foundPool);
      }
    }
  }, [data, address]);

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

  const getPairDataContracts = async () => {
    if (connectedWallet) {
      const userAddress = idToAddress(userId);
      const balanceBN = await sdk.checkBalance(pairData.pairAddress, userAddress, connectedWallet);
      const totalSupplyBN = await sdk.getTotalSupply(pairData.pairAddress, connectedWallet);
      const [token0BN, token1BN] = await sdk.getReserves(pairData.pairAddress, connectedWallet);

      const balanceStr = hethers.utils.formatUnits(balanceBN, 18);
      const totalSupplyStr = hethers.utils.formatUnits(totalSupplyBN, 18);
      const token0Str = hethers.utils.formatUnits(token0BN, pairData.token0Decimals);
      const token1Str = hethers.utils.formatUnits(token1BN, pairData.token1Decimals);

      const balanceNum = Number(balanceStr);

      if (balanceNum > 0) {
        setPairDataContracts({
          balance: balanceStr,
          totalSupply: totalSupplyStr,
          token0: token0Str,
          token1: token1Str,
          totalSupplyBN,
          token0BN,
          token1BN,
        });
        setLpInputValue(balanceStr);
      }
    }
  };

  const hanleApproveLPClick = async () => {
    try {
      const contractId = addressToContractId(pairData.pairAddress);
      await sdk.approveToken(hashconnectConnectorInstance, userId, contractId, '1000000', 18);
      setLpApproved(true);
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setLpInputValue(value);
  };

  const hanleCalculateClick = () => {
    calculateTokensAmount();
  };

  const calculateTokensAmount = async () => {
    const tokensLPToRemoveHBN = formatStringToBigNumberEthersWei(lpInputValue);

    const tokens0MulByAmount = pairDataContracts.token0BN.mul(tokensLPToRemoveHBN);
    const tokens1MulByAmount = pairDataContracts.token1BN.mul(tokensLPToRemoveHBN);

    const tokens0ToRemoveHBN = tokens0MulByAmount.div(pairDataContracts.totalSupplyBN);
    const tokens1ToRemoveHBN = tokens1MulByAmount.div(pairDataContracts.totalSupplyBN);

    const tokensLPToRemoveStr = tokensLPToRemoveHBN.toString();
    const tokens0ToRemoveStr = tokens0ToRemoveHBN.toString();
    const tokens1ToRemoveStr = tokens1ToRemoveHBN.toString();

    await sdk.removeLiquidity(
      hashconnectConnectorInstance,
      userId,
      pairData.token0,
      pairData.token1,
      tokensLPToRemoveStr,
      tokens0ToRemoveStr,
      tokens1ToRemoveStr,
      pairData.token0Decimals,
      pairData.token1Decimals,
      INITIAL_SLIPPAGE_TOLERANCE,
      INITIAL_EXPIRATION_TIME,
    );

    setPairDataContracts({
      balance: '0.0',
      totalSupply: '0.0',
      token0: '0.0',
      token1: '0.0',
      totalSupplyBN: hethers.BigNumber.from(0),
      token0BN: hethers.BigNumber.from(0),
      token1BN: hethers.BigNumber.from(0),
    });
    refetch();
  };

  const hasUserProvided = Number(pairDataContracts.balance) > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        {error ? (
          <div className="alert alert-danger mb-5" role="alert">
            <strong>Something went wrong!</strong> Cannot get pair data...
          </div>
        ) : null}

        {loading ? <Loader loadingText="Loading pool data..." /> : null}

        <h2 className="text-display">{pairData.pairSymbol} Pair</h2>
        <p className="text-small mt-2">{pairData.pairAddress}</p>

        <div className="row mt-5">
          <div className="col-6">
            <div className="p-4 rounded border border-primary">
              <h3 className="text-headline">Backend data:</h3>
              <hr />
              <p>LP total supply:</p>
              <p className="text-title">{pairData.pairSupply} wei</p>
              <p className="text-title">
                {formatStringWeiToStringEther(pairData.pairSupply)} ether
              </p>
              <p className="mt-3">Pooled tokens:</p>
              <p className="text-title">
                {formatStringWeiToStringEther(pairData.token0Amount, pairData.token0Decimals)}{' '}
                {pairData.token0Symbol} <span className="text-small">(formatted)</span>
              </p>
              <p className="text-title">
                {pairData.token0Amount} {pairData.token0Symbol}
              </p>
              <p className="text-title">
                {formatStringWeiToStringEther(pairData.token1Amount, pairData.token1Decimals)}{' '}
                {pairData.token1Symbol} <span className="text-small">(formatted)</span>
              </p>
              <p className="text-title">
                {pairData.token1Amount} {pairData.token1Symbol}
              </p>
            </div>

            {connectedWallet && hasUserProvided && (
              <div className="p-4 rounded border border-primary mt-4">
                <h3>Remove liquidity</h3>
                <div className="mt-4">
                  {lpApproved ? (
                    <div>
                      <label htmlFor="">LP tokens</label>
                      <input
                        value={lpInputValue}
                        onChange={hanleLpInputChange}
                        type="text"
                        name=""
                        className="form-control mt-2"
                      />
                      <div className="d-flex align-items-center">
                        <Button className="mt-4" onClick={hanleCalculateClick}>
                          Calculate and remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={hanleApproveLPClick}>Approve LP</Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {connectedWallet ? (
            <div className="col-6">
              {hasUserProvided ? (
                <div className="p-4 rounded border border-primary">
                  <h3 className="text-headline">Contract data:</h3>
                  <hr />
                  <p>LP total supply:</p>
                  <p className="text-title">{pairDataContracts.totalSupply}</p>
                  <p>User LP tokens:</p>
                  <p className="text-title">{pairDataContracts.balance}</p>
                  <div className="mt-3">
                    <p>Token0:</p>
                    <p className="text-title">{pairDataContracts.token0}</p>
                  </div>
                  <div className="mt-3">
                    <p>Token1:</p>
                    <p className="text-title">{pairDataContracts.token1}</p>
                  </div>
                </div>
              ) : (
                <Button onClick={getPairDataContracts}>Show contract data</Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PairDetails;
