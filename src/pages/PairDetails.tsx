import React, { useEffect, useState, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../providers/Global';
import BigNumber from 'bignumber.js';

import { useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';

import { IPairData } from '../interfaces/tokens';

import { idToAddress, addressToContractId } from '../utils/tokenUtils';
import { formatBigNumberToNumber } from '../utils/numberUtils';
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
  });

  const [lpApproved, setLpApproved] = useState(false);
  const [lpInputValue, setLpInputValue] = useState('');

  useEffect(() => {
    if (data && data.pools.length > 0) {
      const foundPool = data.pools.find((pool: IPairData) => pool.pairAddress === address);

      console.log('foundPool', foundPool);

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

      console.log('balanceBN', balanceBN.toString());
      console.log('totalSupplyBN', totalSupplyBN.toString());

      const balanceStr = hethers.utils.formatUnits(balanceBN, 18);
      const totalSupplyStr = hethers.utils.formatUnits(totalSupplyBN, 18);
      const token0Str = hethers.utils.formatUnits(token0BN, 18);
      const token1Str = hethers.utils.formatUnits(token1BN, 18);

      const balanceNum = Number(balanceStr);
      // const totalSupplyNum = Number(totalSupplyStr);
      // const token0Num = Number(token0Str);
      // const token1Num = Number(token1Str);

      if (balanceNum > 0) {
        setPairDataContracts({
          balance: balanceStr,
          totalSupply: totalSupplyStr,
          token0: token0Str,
          token1: token1Str,
        });
        setLpInputValue(balanceStr);
      }
    }
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

  // const hanleRemoveLPClick = async () => {
  //   try {
  //     await sdk.removeLiquidity(
  //       hashconnectConnectorInstance,
  //       userId,
  //       pairData.token0,
  //       pairData.token1,
  //     );
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //   }
  // };

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setLpInputValue(value);
  };

  const hanleCalculateClick = () => {
    calculateTokensAmount();
  };

  const calculateTokensAmount = async () => {
    // Convert amounts to BN
    const tokensLPToRemoveBN = new BigNumber(lpInputValue);
    const totalSupplyTokensLPBN = new BigNumber(pairDataContracts.totalSupply);
    const token0BN = new BigNumber(pairDataContracts.token0);
    const token1BN = new BigNumber(pairDataContracts.token1);

    // Get LP token ratio - LP tokens to remove / Total amount ot LP tokens
    const ratioBN = tokensLPToRemoveBN.div(totalSupplyTokensLPBN);

    // Calculate reserves token amounts
    const tokens0ToRemoveBN = token0BN.times(ratioBN);
    const tokens1ToRemoveBN = token1BN.times(ratioBN);

    // Convent to string and numbers
    const tokensLPToRemoveStr = tokensLPToRemoveBN.toString();
    const totalSupplyTokensLPStr = totalSupplyTokensLPBN.toString();

    const tokens0ToRemoveStrRaw = tokens0ToRemoveBN.toString();
    const tokens0ToRemoveStrArr = tokens0ToRemoveStrRaw.split('.');
    tokens0ToRemoveStrArr[1] = tokens0ToRemoveStrArr[1].slice(0, 18);
    const tokens0ToRemoveStr = tokens0ToRemoveStrArr.join('.');

    const tokens1ToRemoveStrRaw = tokens1ToRemoveBN.toString();
    const tokens1ToRemoveStrArr = tokens1ToRemoveStrRaw.split('.');
    tokens1ToRemoveStrArr[1] = tokens1ToRemoveStrArr[1].slice(0, 18);
    const tokens1ToRemoveStr = tokens1ToRemoveStrArr.join('.');

    const ratioStr = ratioBN.toString();

    console.log('tokensLPToRemoveStr', tokensLPToRemoveStr);
    console.log('totalSupplyTokensLPStr', totalSupplyTokensLPStr);
    console.log('ratioStr', ratioStr);
    console.log('tokens0ToRemoveStrRaw', tokens0ToRemoveStrRaw);
    console.log('tokens0ToRemoveStr', tokens0ToRemoveStr);
    console.log('tokens1ToRemoveStrRaw', tokens1ToRemoveStrRaw);
    console.log('tokens1ToRemoveStr', tokens1ToRemoveStr);

    await sdk.removeLiquidity(
      hashconnectConnectorInstance,
      userId,
      pairData.token0,
      pairData.token1,
      tokensLPToRemoveStr,
      tokens0ToRemoveStr,
      tokens1ToRemoveStr,
    );

    setPairDataContracts({
      balance: '0.0',
      totalSupply: '0.0',
      token0: '0.0',
      token1: '0.0',
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
              <p>Pooled tokens:</p>
              <p className="text-title">
                {formatBigNumberToNumber(pairData.token0Amount)} {pairData.token0Symbol}
              </p>
              <p className="text-title">
                {formatBigNumberToNumber(pairData.token1Amount)} {pairData.token1Symbol}
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
                        {/* <Button className="mt-4" onClick={hanleRemoveLPClick}>
                          Remove LP
                        </Button> */}
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
                  <p>User LP tokens:</p>
                  <p className="text-title">{pairDataContracts.balance}</p>
                  <p className="mt-3">LP total supply:</p>
                  <p className="text-title">{pairDataContracts.totalSupply}</p>
                  <div className="row mt-3">
                    <div className="col-6">
                      <p>Token0:</p>
                      <p className="text-title">{pairDataContracts.token0}</p>
                    </div>
                    <div className="col-6">
                      <p>Token1:</p>
                      <p className="text-title">{pairDataContracts.token1}</p>
                    </div>
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
