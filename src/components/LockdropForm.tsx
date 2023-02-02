import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
// import toast from 'react-hot-toast';
import Tippy from '@tippyjs/react';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import { LOCKDROP_STATE, ILockdropData } from '../interfaces/common';

import ButtonSelector from '../components/ButtonSelector';
import InputToken from '../components/InputToken';
import InputTokenSelector from '../components/InputTokenSelector';
import WalletBalance from '../components/WalletBalance';
import IconToken from '../components/IconToken';
import Button from '../components/Button';
import Icon from '../components/Icon';
import ToasterWrapper from '../components/ToasterWrapper';

import { formatStringETHtoPriceFormatted, stripStringToFixedDecimals } from '../utils/numberUtils';
import { getTokenBalance, NATIVE_TOKEN } from '../utils/tokenUtils';

enum ActionTab {
  'Deposit',
  'Withdraw',
}

interface ILockdropFormProps {
  currentState: LOCKDROP_STATE;
  lockDropData: ILockdropData;
  getContractData: () => void;
}

const LockdropForm = ({ currentState, lockDropData, getContractData }: ILockdropFormProps) => {
  const lockDropContractAddress = process.env.REACT_APP_LOCKDROP_ADDRESS;
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { hashconnectConnectorInstance } = connection;
  const { userId, connected, setShowConnectModal, isHashpackLoading } = connection;

  // State for token balances
  const initialBallanceData = useMemo(() => '0', []);

  const [actionTab, setActionTab] = useState(ActionTab.Deposit);
  const [hbarBalance, setHbarBalance] = useState('initialBallanceData');
  const [depositValue, setDepositValue] = useState('0');
  const [withdrawValue, setWithdrawValue] = useState('0');
  const [claimValue, setClaimValue] = useState(lockDropData.estimatedLPTokens.valueStringETH);

  const [loadingButton, setLoadingButton] = useState(false);

  const handleDepositInputChange = (rawValue: string) => {
    setDepositValue(rawValue);
  };

  const handleWithdrawInputChange = (rawValue: string) => {
    setWithdrawValue(rawValue);
  };

  const handleClaimInputChange = (rawValue: string) => {
    setClaimValue(rawValue);
  };

  const handleTabClick = (target: ActionTab) => {
    setActionTab(target);
  };

  const handleDepositButtonClick = async () => {
    setLoadingButton(true);

    try {
      await sdk.depositHBAR(
        hashconnectConnectorInstance,
        lockDropContractAddress as string,
        userId,
        depositValue,
      );

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
      await sdk.withdrawHBAR(
        hashconnectConnectorInstance,
        lockDropContractAddress as string,
        userId,
        withdrawValue,
      );

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
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingButton(true);
    }
  };

  const handleClaimAndStakeButtonClick = async () => {
    setLoadingButton(true);

    try {
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingButton(true);
    }
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

  const renderHELIHBARRatio = () => (
    <p className="text-numeric text-small mt-6">
      1 HELI ={' '}
      {Number(lockDropData.totalHbars.valueStringETH) /
        Number(lockDropData.totalTokens.valueStringETH)}{' '}
      HBAR
    </p>
  );

  return (
    <div className="d-flex flex-column align-items-center py-15 container-lockdrop">
      <div className="container-action">
        {currentState < LOCKDROP_STATE.VESTING ? (
          <p className="text-subheader text-center mb-6">
            Select how much <span className="text-bold">HBAR</span> you want to deposit in the
            LockDrop Pool.
          </p>
        ) : (
          <p className="text-subheader text-center mb-6">Locking period has ended.</p>
        )}

        <p className="text-small mb-5">
          This is where you will be able to deposit and withdraw your HBAR. Simply pick between
          “deposit” and “withdraw” and choose how many HBAR. The bottom shows you the estimated
          amount of LP tokens you would receive if the lockdrop ended in that moment.
        </p>
        <div className="container-dark">
          {currentState >= LOCKDROP_STATE.DEPOSIT && currentState < LOCKDROP_STATE.VESTING ? (
            <>
              <div className="d-flex mb-5">
                <span
                  onClick={() => handleTabClick(ActionTab.Deposit)}
                  className={`text-small text-bold text-uppercase cursor-pointer ${
                    actionTab === ActionTab.Deposit ? '' : 'text-secondary'
                  }`}
                >
                  Deposit
                </span>
                <span
                  onClick={() => handleTabClick(ActionTab.Withdraw)}
                  className={`text-small text-bold text-uppercase cursor-pointer ${
                    actionTab === ActionTab.Withdraw ? '' : 'text-secondary'
                  } ms-4`}
                >
                  Withdraw
                </span>
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
                          handleDepositInputChange(strippedValue);
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
                          {formatStringETHtoPriceFormatted(
                            lockDropData.estimatedLPTokens.valueStringETH,
                          )}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const { value } = e.target;
                          const strippedValue = stripStringToFixedDecimals(value, 8);
                          handleWithdrawInputChange(strippedValue);
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
                          walletBalance={lockDropData.lockedHbars.valueStringETH}
                          onMaxButtonClick={(maxValue: string) => {
                            handleWithdrawInputChange(maxValue);
                          }}
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
                    <Button loading={loadingButton} onClick={handleDepositButtonClick}>
                      DEPOSIT HBAR
                    </Button>
                  ) : (
                    <Button loading={loadingButton} onClick={handleWithdrawButtonClick}>
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

          {currentState >= LOCKDROP_STATE.VESTING && currentState < LOCKDROP_STATE.END ? (
            <>
              <p className="text-small text-bold mb-3">Liquidity provied to Lockdrop</p>

              <div className="mt-6 rounded border border-secondary justify-content-between">
                <div className="d-flex justify-content-between align-items-center m-4">
                  <div className="d-flex align-items-center">
                    <IconToken symbol="HBAR" />
                    <span className="text-main ms-3">HBAR</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <p className="text-numeric text-small me-3">
                      {lockDropData.lockedHbars.valueStringETH}
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
                      {lockDropData.totalTokens.valueStringETH}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 d-flex justify-content-around align-items-center">
                <div className="text-center">
                  <p className="text-numeric text-small">1,000</p>
                  <div className="d-flex align-items-center">
                    <p className="text-micro">Total to claim</p>
                    <Tippy content={``}>
                      <span className="ms-2">
                        <Icon size="small" color="gray" name="hint" />
                      </span>
                    </Tippy>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-numeric text-small">1,000</p>
                  <div className="d-flex align-items-center">
                    <p className="text-micro">Available to claim</p>
                    <Tippy content={``}>
                      <span className="ms-2">
                        <Icon size="small" color="gray" name="hint" />
                      </span>
                    </Tippy>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-numeric text-small">1,000</p>
                  <div className="d-flex align-items-center">
                    <p className="text-micro">Claimed so far</p>
                    <Tippy content={``}>
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
                inputTokenComponent={
                  <InputToken
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const { value } = e.target;
                      const strippedValue = stripStringToFixedDecimals(value, 6);
                      handleClaimInputChange(strippedValue);
                    }}
                    value={claimValue}
                  />
                }
                buttonSelectorComponent={
                  <ButtonSelector disabled selectedToken={'LP'} selectorText="Select token" />
                }
              />

              {userId && !isHashpackLoading ? (
                <>
                  <div className="d-grid mt-5">
                    <Button loading={loadingButton} onClick={handleClaimButtonClick}>
                      CLAIM
                    </Button>
                  </div>
                  <div className="d-grid mt-4">
                    <Button
                      loading={loadingButton}
                      type="secondary"
                      onClick={handleClaimAndStakeButtonClick}
                    >
                      CLAIM AND STAKE
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
      <ToasterWrapper />
    </div>
  );
};

export default LockdropForm;
