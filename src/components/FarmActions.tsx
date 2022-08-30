import React, { useState, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import { IFarmData } from '../interfaces/tokens';

import Button from './Button';
import ButtonSelector from './ButtonSelector';
import InputToken from './InputToken';
import InputTokenSelector from './InputTokenSelector';
import WalletBalance from './WalletBalance';
import Icon from './Icon';

import { formatStringWeiToStringEther } from '../utils/numberUtils';

import getErrorMessage from '../content/errors';

import { MAX_UINT_ERC20 } from '../constants';

interface IFarmActionsProps {
  farmData: IFarmData;
  hasUserStaked: boolean;
  campaignEnded: boolean;
  hasUserProvided: boolean;
}

enum TabStates {
  STAKE,
  UNSTAKE,
}

const FarmActions = ({
  farmData,
  hasUserStaked,
  campaignEnded,
  hasUserProvided,
}: IFarmActionsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [lpInputValue, setLpInputValue] = useState(
    formatStringWeiToStringEther(farmData.poolData.lpShares as string),
  );
  const [loadingStake, setLoadingStake] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingExit, setLoadingExit] = useState(false);

  const [tabState, setTabState] = useState(TabStates.STAKE);

  const [lpApproved, setLpApproved] = useState(false);

  const getInsufficientTokenBalance = useCallback(() => {
    const {
      poolData: { lpShares },
    } = farmData;

    return new BigNumber(lpInputValue as string).gt(
      new BigNumber(formatStringWeiToStringEther(lpShares || '0')),
    );
  }, [farmData, lpInputValue]);

  // Handlers
  const handleTabButtonClick = (value: TabStates) => {
    setTabState(value);
  };

  const hanleLpInputChange = (value: string) => {
    setLpInputValue(value);
  };

  const handleStakeClick = async () => {
    setLoadingStake(true);
    try {
      const receipt = await sdk.stakeLP(
        hashconnectConnectorInstance,
        lpInputValue as string,
        farmData.address,
        userId,
      );
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens are staked');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
      toast.error('Error on stake');
    } finally {
      setLoadingStake(false);
    }
  };

  const handleExitButtonClick = async () => {
    setLoadingExit(true);

    try {
      const receipt = await sdk.exit(hashconnectConnectorInstance, farmData.address, userId);
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Exit was successful.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExit(false);
    }
  };

  const handleApproveButtonClick = async (campaignAddress: string, poolAddress: string) => {
    setLoadingApprove(true);
    const amount = MAX_UINT_ERC20.toString();
    try {
      const receipt = await sdk.approveTokenStake(
        hashconnectConnectorInstance,
        campaignAddress,
        amount,
        userId,
        poolAddress,
      );
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Token was approved.');
        setLpApproved(true);
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApprove(false);
    }
  };

  // Helper methods
  const getStakeButtonLabel = () => {
    if (getInsufficientTokenBalance()) return `Insufficient LP balance`;
    return 'Stake';
  };

  return (
    <div className="col-4">
      <div className="container-blue-neutral-900 rounded p-5 heigth-100 d-flex flex-column">
        <div>
          <span
            onClick={() => handleTabButtonClick(TabStates.STAKE)}
            className={`text-small text-bold text-uppercase link-tab me-5 ${
              tabState === TabStates.STAKE ? 'is-active' : ''
            }`}
          >
            Stake
          </span>
          {hasUserStaked ? (
            <span
              onClick={() => handleTabButtonClick(TabStates.UNSTAKE)}
              className={`text-small text-bold text-uppercase link-tab me-5 ${
                tabState === TabStates.UNSTAKE ? 'is-active' : ''
              }`}
            >
              Unstake
            </span>
          ) : null}
        </div>

        <div className="d-flex flex-column justify-content-between flex-1 mt-5">
          {tabState === TabStates.STAKE ? (
            <>
              <div>
                <p className="text-small text-bold">Enter LP Token Amount</p>
                <InputTokenSelector
                  className="mt-4"
                  readonly={campaignEnded || !hasUserProvided}
                  inputTokenComponent={
                    <InputToken
                      disabled={campaignEnded || !hasUserProvided}
                      value={lpInputValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const { value } = e.target;
                        hanleLpInputChange(value);
                      }}
                      isCompact={true}
                      name="amountIn"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector disabled selectedToken="LP" selectorText="Select a token" />
                  }
                  walletBalanceComponent={
                    !campaignEnded ? (
                      <WalletBalance
                        insufficientBallance={getInsufficientTokenBalance()}
                        walletBalance={formatStringWeiToStringEther(
                          farmData.poolData.lpShares || '0',
                        )}
                        onMaxButtonClick={(maxValue: string) => {
                          hanleLpInputChange(maxValue);
                        }}
                      />
                    ) : null
                  }
                />

                {!campaignEnded ? (
                  <div className="text-center mt-6">
                    <Link
                      className="text-small text-bold link-primary d-inline-flex align-items-center"
                      to={`/create/${farmData.poolData.token0}/${farmData.poolData.token1}`}
                    >
                      <span className="me-2">Get LP tokens</span>
                      <Icon size="small" name="arrow-right" />
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="d-grid">
                {!campaignEnded ? (
                  hasUserProvided ? (
                    lpApproved ? (
                      <Button
                        disabled={getInsufficientTokenBalance()}
                        loading={loadingStake}
                        onClick={handleStakeClick}
                      >
                        {getStakeButtonLabel()}
                      </Button>
                    ) : (
                      <Button
                        loading={loadingApprove}
                        onClick={() =>
                          handleApproveButtonClick(farmData.address, farmData.poolData.pairAddress)
                        }
                      >
                        Approve
                      </Button>
                    )
                  ) : null
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-small text-bold">LP Token Amount to unstake</p>
                <InputTokenSelector
                  className="mt-4"
                  readonly={true}
                  inputTokenComponent={
                    <InputToken
                      value={formatStringWeiToStringEther(
                        farmData.userStakingData?.stakedAmount as string,
                      )}
                      disabled={true}
                      isCompact={true}
                      name="amountIn"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector disabled selectedToken="LP" selectorText="Select a token" />
                  }
                />
              </div>

              <div className="d-grid">
                <Button loading={loadingExit} onClick={handleExitButtonClick}>
                  Unstake
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmActions;
