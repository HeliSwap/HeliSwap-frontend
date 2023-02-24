import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import { LOCKDROP_STATE, ILockdropData, IDaysMapping } from '../interfaces/common';

import ButtonSelector from '../components/ButtonSelector';
import InputToken from '../components/InputToken';
import InputTokenSelector from '../components/InputTokenSelector';
import WalletBalance from '../components/WalletBalance';
import IconToken from '../components/IconToken';
import Button from '../components/Button';
import Icon from '../components/Icon';

import {
  formatStringETHtoPriceFormatted,
  getUserHELIReserves,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { getTokenBalance, getTokenBalanceERC20, NATIVE_TOKEN } from '../utils/tokenUtils';
import { formatTimeNumber, getCountdownReturnValues } from '../utils/timeUtils';

import getErrorMessage from '../content/errors';

enum ActionTab {
  'Deposit',
  'Withdraw',
}

interface ILockdropFormProps {
  currentState: LOCKDROP_STATE;
  lockDropData: ILockdropData;
  getContractData: () => void;
  toast: any;
  farmAddress: string;
  maxWithdrawValue: string;
  daysMapping: IDaysMapping;
  daysSinceStart: number;
}

const LockdropForm = ({
  currentState,
  lockDropData,
  getContractData,
  toast,
  farmAddress,
  maxWithdrawValue,
  daysMapping,
  daysSinceStart,
}: ILockdropFormProps) => {
  const lockDropContractAddress = process.env.REACT_APP_LOCKDROP_ADDRESS;
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { hashconnectConnectorInstance } = connection;
  const { userId, connected, setShowConnectModal, isHashpackLoading } = connection;
  const navigate = useNavigate();
  const {
    totalHbars,
    totalTokens,
    estimatedLPTokens,
    lockedHbars,
    claimed,
    claimable,
    totalClaimable,
    lastUserWithdrawal,
    lockDropDepositEnd,
    lpTokenAddress,
  } = lockDropData;

  // State for token balances
  const initialBallanceData = useMemo(() => '0', []);

  const [actionTab, setActionTab] = useState(
    currentState === LOCKDROP_STATE.DEPOSIT ? ActionTab.Deposit : ActionTab.Withdraw,
  );
  const [hbarBalance, setHbarBalance] = useState('initialBallanceData');
  const [depositValue, setDepositValue] = useState('0');
  const [withdrawValue, setWithdrawValue] = useState('0');
  const [lpBalance, setLpBalance] = useState('0');

  const [loadingButton, setLoadingButton] = useState(false);

  const handleDepositInputChange = (rawValue: string) => {
    setDepositValue(rawValue);
  };

  const handleWithdrawInputChange = (rawValue: string) => {
    setWithdrawValue(rawValue);
  };

  const handleTabClick = (target: ActionTab) => {
    setActionTab(target);
  };

  const handleDepositButtonClick = async () => {
    setLoadingButton(true);

    try {
      const receipt = await sdk.depositHBAR(
        hashconnectConnectorInstance,
        lockDropContractAddress as string,
        userId,
        depositValue,
      );

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens were deposited.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }

      await getContractData();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingButton(false);
    }
  };

  const handleWithdrawButtonClick = async () => {
    setLoadingButton(true);

    try {
      const receipt = await sdk.withdrawHBAR(
        hashconnectConnectorInstance,
        lockDropContractAddress as string,
        userId,
        withdrawValue,
      );

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens were withdrawn.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }

      await getContractData();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingButton(false);
    }
  };

  const handleClaimButtonClick = async () => {
    setLoadingButton(true);

    try {
      const receipt = await sdk.claimLP(
        hashconnectConnectorInstance,
        lockDropContractAddress as string,
        userId,
      );

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens were claimed.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }

      await getContractData();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingButton(false);
    }
  };

  const handleStakeButtonClick = async () => {
    navigate(`/farms/${farmAddress}`);
  };

  const getInsufficientToken = useCallback(() => {
    return (
      hbarBalance && depositValue && new BigNumber(depositValue).gt(new BigNumber(hbarBalance))
    );
  }, [depositValue, hbarBalance]);

  useEffect(() => {
    const getHbarBalance = async () => {
      if (userId) {
        const tokenBalance = await getTokenBalance(userId, NATIVE_TOKEN);
        setHbarBalance(tokenBalance as string);
      } else {
        setHbarBalance(initialBallanceData);
      }
    };

    getHbarBalance();
  }, [userId, initialBallanceData]);

  useEffect(() => {
    const getLPBalance = async () => {
      const userBalance = await getTokenBalanceERC20(lpTokenAddress, userId);
      setLpBalance(userBalance);
    };

    userId && lpTokenAddress && currentState >= LOCKDROP_STATE.VESTING && getLPBalance();
  }, [userId, lpTokenAddress, currentState]);

  const renderHELIHBARRatio = () => (
    <p className="text-numeric text-small mt-6">
      1 HELI = {Number(totalHbars.valueStringETH) / Number(totalTokens.valueStringETH)} HBAR
    </p>
  );

  const isInputValueInvalid = (value: string) => {
    return !value || isNaN(Number(value)) || Number(value) <= 0;
  };

  const renderDayMessage = () => {
    for (const [key, value] of Object.entries(daysMapping)) {
      if (Number(key) === daysSinceStart) {
        return (
          <>
            <div className="my-5 text-center">
              <p className="text-title text-white">
                It&rsquo;s day <span className="text-bold text-headline">{key}</span> from the
                Lockdrop.
              </p>
              <p className="text-main text-white mt-3">{value.message}</p>
              {timeTillLockdropEnd > 0 ? (
                <>
                  <hr />
                  <p className="text-title text-white text-secondary mt-5">
                    <span className="text-bold">{formatTimeNumber(countDownData.days)}</span> Days{' '}
                    <span className="text-bold">{formatTimeNumber(countDownData.hours)}</span> Hours{' '}
                    <span className="text-bold">{formatTimeNumber(countDownData.minutes)}</span>{' '}
                    Minutes
                  </p>
                  <p className="text-white text-uppercase text-bold mt-3">before lockdrop ends</p>
                </>
              ) : null}
            </div>
          </>
        );
      }
    }
  };

  const canClaim = Number(claimable.valueBN.toString()) > 0;
  const canWithdraw = lastUserWithdrawal < lockDropDepositEnd;
  const canStake = Number(lpBalance) > 0 && currentState >= LOCKDROP_STATE.VESTING && farmAddress;

  const timeNow = Date.now();
  const timeTillLockdropEnd = lockDropData.lockdropEnd - timeNow;
  const countDownData = getCountdownReturnValues(timeTillLockdropEnd);

  return (
    <div className="d-flex flex-column align-items-center py-15 container-lockdrop">
      <div className="container-action">
        {renderDayMessage()}

        <p className="text-small mb-5">
          This is where you can claim your LP tokens and stake them. Claim period is 3 months and
          the vesting is linear.
        </p>

        <div className="container-dark">
          {currentState >= LOCKDROP_STATE.DEPOSIT && currentState < LOCKDROP_STATE.PRE_VESTING ? (
            <>
              <div className="d-flex mb-5">
                {currentState === LOCKDROP_STATE.DEPOSIT ? (
                  <span
                    onClick={() => handleTabClick(ActionTab.Deposit)}
                    className={`text-small text-bold text-uppercase cursor-pointer ${
                      actionTab === ActionTab.Deposit ? '' : 'text-secondary'
                    } me-4`}
                  >
                    Deposit
                  </span>
                ) : null}

                <span
                  onClick={() => handleTabClick(ActionTab.Withdraw)}
                  className={`text-small text-bold text-uppercase cursor-pointer ${
                    actionTab === ActionTab.Withdraw ? '' : 'text-secondary'
                  }`}
                >
                  Withdraw
                </span>
              </div>

              <div className="alert alert-warning my-5 text-center">
                <p className="text-subheader">Network issues are possible!</p>
                <p className="text-small mt-3">
                  Please do not wait till the last moment to update your position!
                </p>
              </div>

              {actionTab === ActionTab.Deposit ? (
                <>
                  <p className="text-small text-bold mb-3">Enter Amount to Deposit</p>

                  <InputTokenSelector
                    isInvalid={getInsufficientToken() as boolean}
                    inputTokenComponent={
                      <InputToken
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const { value } = e.target;
                          const strippedValue = stripStringToFixedDecimals(value, 8);
                          handleDepositInputChange(
                            isNaN(Number(strippedValue)) ? '0' : strippedValue,
                          );
                        }}
                        value={depositValue}
                      />
                    }
                    buttonSelectorComponent={
                      <ButtonSelector disabled selectedToken={'HBAR'} selectorText="Select token" />
                    }
                    walletBalanceComponent={
                      connected && !isHashpackLoading ? (
                        <WalletBalance
                          insufficientBallance={getInsufficientToken() as boolean}
                          walletBalance={hbarBalance}
                          onMaxButtonClick={(maxValue: string) => {
                            handleDepositInputChange(maxValue);
                          }}
                        />
                      ) : null
                    }
                  />

                  <div className="mt-6 rounded border border-secondary justify-content-between">
                    <p className="text-small text-bold m-4">Estimate reward after the LockDrop:</p>
                    <div className="d-flex justify-content-between align-items-center m-4">
                      <p className="text-small">LP Tokens</p>
                      <div className="d-flex align-items-center">
                        <p className="text-numeric text-small me-3">
                          {formatStringETHtoPriceFormatted(estimatedLPTokens.valueStringETH)}
                        </p>
                        <IconToken symbol="LP" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-small text-bold mb-3">Enter Amount to Withdraw</p>

                  <InputTokenSelector
                    isInvalid={getInsufficientToken() as boolean}
                    inputTokenComponent={
                      <InputToken
                        disabled={!canWithdraw}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const { value } = e.target;
                          const strippedValue = stripStringToFixedDecimals(value, 8);

                          handleWithdrawInputChange(
                            isNaN(Number(strippedValue)) ? '0' : strippedValue,
                          );
                        }}
                        value={withdrawValue}
                        name="amountOut"
                      />
                    }
                    buttonSelectorComponent={
                      <ButtonSelector disabled selectedToken={'HBAR'} selectorText="Select token" />
                    }
                    walletBalanceComponent={
                      connected && !isHashpackLoading ? (
                        <WalletBalance
                          insufficientBallance={getInsufficientToken() as boolean}
                          walletBalance={canWithdraw ? maxWithdrawValue : '0'}
                          onMaxButtonClick={(maxValue: string) => {
                            handleWithdrawInputChange(maxValue);
                          }}
                          label="Available to withdraw"
                        />
                      ) : null
                    }
                  />
                </>
              )}

              {renderHELIHBARRatio()}

              {connected && !isHashpackLoading ? (
                <div className="d-grid mt-5">
                  {actionTab === ActionTab.Deposit ? (
                    <Button
                      loading={loadingButton}
                      disabled={isInputValueInvalid(depositValue)}
                      onClick={handleDepositButtonClick}
                    >
                      DEPOSIT HBAR
                    </Button>
                  ) : (
                    <Button
                      disabled={!canWithdraw || isInputValueInvalid(withdrawValue)}
                      loading={loadingButton}
                      onClick={handleWithdrawButtonClick}
                    >
                      WITHDRAW HBAR
                    </Button>
                  )}
                </div>
              ) : (
                <div className="d-grid mt-4">
                  <Button disabled={isHashpackLoading} onClick={() => setShowConnectModal(true)}>
                    Connect wallet
                  </Button>
                </div>
              )}
            </>
          ) : null}

          {currentState >= LOCKDROP_STATE.PRE_VESTING ? (
            <>
              <p className="text-small text-bold mb-3">Liquidity provided to Lockdrop</p>

              <div className="mt-6 rounded border border-secondary justify-content-between">
                <div className="d-flex justify-content-between align-items-center m-4">
                  <div className="d-flex align-items-center">
                    <IconToken symbol="HBAR" />
                    <span className="text-main ms-3">HBAR</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <p className="text-numeric text-small me-3">
                      {formatStringETHtoPriceFormatted(lockedHbars.valueStringETH)}
                    </p>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center m-4">
                  <div className="d-flex align-items-center">
                    <IconToken symbol="HELI" />
                    <span className="text-main ms-3">HELI</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <p className="text-numeric text-small me-3">
                      {formatStringETHtoPriceFormatted(
                        getUserHELIReserves(
                          totalTokens.valueBN,
                          lockedHbars.valueBN,
                          totalHbars.valueBN,
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 d-flex justify-content-around align-items-center">
                <div className="text-center">
                  <p className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted(totalClaimable.valueStringETH)}
                  </p>
                  <div className="d-flex align-items-center">
                    <p className="text-micro">Total to claim</p>
                    <Tippy
                      content={`The total amount of LP tokens that you were allocated during the lockdrop period (your HBAR contribution divided by the total HBAR contribution).`}
                    >
                      <span className="ms-2">
                        <Icon size="small" color="gray" name="hint" />
                      </span>
                    </Tippy>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted(claimable.valueStringETH)}
                  </p>
                  <div className="d-flex align-items-center">
                    <p className="text-micro">Available to claim</p>
                    <Tippy
                      content={`The amount of LP tokens that have vested (unlocked) and can be claimed by you.`}
                    >
                      <span className="ms-2">
                        <Icon size="small" color="gray" name="hint" />
                      </span>
                    </Tippy>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted(claimed.valueStringETH)}
                  </p>
                  <div className="d-flex align-items-center">
                    <p className="text-micro">Claimed so far</p>
                    <Tippy content={`The amount of LP tokens that you have claimed already.`}>
                      <span className="ms-2">
                        <Icon size="small" color="gray" name="hint" />
                      </span>
                    </Tippy>
                  </div>
                </div>
              </div>

              <hr />

              <p className="text-small text-bold mb-3">Enter Amount to Claim</p>

              <InputTokenSelector
                isInvalid={getInsufficientToken() as boolean}
                inputTokenComponent={<InputToken disabled value={claimable.valueStringETH} />}
                buttonSelectorComponent={
                  <ButtonSelector disabled selectedToken={'LP'} selectorText="Select token" />
                }
              />

              {userId && !isHashpackLoading ? (
                <>
                  <div className="d-grid mt-5">
                    <Button
                      disabled={currentState === LOCKDROP_STATE.PRE_VESTING || !canClaim}
                      loading={loadingButton}
                      onClick={handleClaimButtonClick}
                    >
                      CLAIM
                    </Button>
                  </div>
                  <div className="d-grid mt-4">
                    <Button
                      disabled={!canStake}
                      loading={loadingButton}
                      type="primary"
                      onClick={handleStakeButtonClick}
                    >
                      STAKE
                    </Button>
                  </div>
                </>
              ) : (
                <div className="d-grid mt-4">
                  <Button disabled={isHashpackLoading} onClick={() => setShowConnectModal(true)}>
                    Connect wallet
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LockdropForm;
