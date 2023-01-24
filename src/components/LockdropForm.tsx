import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import BigNumber from 'bignumber.js';
import Tippy from '@tippyjs/react';

import { GlobalContext } from '../providers/Global';

import ButtonSelector from '../components/ButtonSelector';
import InputToken from '../components/InputToken';
import InputTokenSelector from '../components/InputTokenSelector';
import WalletBalance from '../components/WalletBalance';
import IconToken from '../components/IconToken';
import Button from '../components/Button';
import Icon from '../components/Icon';

import { LOCKDROP_STATE } from '../interfaces/common';

import { stripStringToFixedDecimals } from '../utils/numberUtils';
import { getTokenBalance, NATIVE_TOKEN } from '../utils/tokenUtils';

enum ActionTab {
  'Deposit',
  'Withdraw',
}

interface ILockdropFormProps {
  currentState: LOCKDROP_STATE;
}

const LockdropForm = ({ currentState }: ILockdropFormProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const {
    userId,
    hashconnectConnectorInstance,
    connected,
    setShowConnectModal,
    isHashpackLoading,
  } = connection;

  // State for token balances
  const initialBallanceData = useMemo(() => '0', []);

  const [actionTab, setActionTab] = useState(ActionTab.Deposit);
  const [hbarBalance, setHbarBalance] = useState(initialBallanceData);
  const [depositValue, setDepositValue] = useState('0');
  const [withdrawValue, setWithdrawValue] = useState('0');
  const [claimValue, setClaimValue] = useState('0');

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

  const handleDepositButtonClick = () => {};

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

  return (
    <div className="d-flex justify-content-center mt-8">
      <div className="container-action">
        <div className="container-dark">
          {currentState < LOCKDROP_STATE.FINISHED ? (
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
                          const strippedValue = stripStringToFixedDecimals(value, 6);
                          handleDepositInputChange(strippedValue);
                        }}
                        value={depositValue}
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
                          walletBalance={hbarBalance}
                          onMaxButtonClick={(maxValue: string) => {
                            handleDepositInputChange(maxValue);
                          }}
                        />
                      ) : null
                    }
                  />

                  <p className="text-numeric text-small mt-6">1 HELI = 1.00 HBAR</p>

                  <div className="mt-6 rounded border border-secondary justify-content-between">
                    <p className="text-small text-bold m-4">Estimate reward after the LockDrop:</p>
                    <div className="d-flex justify-content-between align-items-center m-4">
                      <p className="text-small">LP Tokens</p>
                      <div className="d-flex align-items-center">
                        <p className="text-numeric text-small me-3">1000</p>
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
                          const strippedValue = stripStringToFixedDecimals(value, 6);
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
                          walletBalance={hbarBalance}
                          onMaxButtonClick={(maxValue: string) => {
                            handleWithdrawInputChange(maxValue);
                          }}
                        />
                      ) : null
                    }
                  />

                  <p className="text-numeric text-small mt-6">1 HELI = 1.00 HBAR</p>
                </>
              )}

              {connected && !isHashpackLoading ? (
                <div className="d-grid mt-5">
                  {actionTab === ActionTab.Deposit ? (
                    <Button onClick={handleDepositButtonClick}>DEPOSIT HBAR</Button>
                  ) : (
                    <Button onClick={handleDepositButtonClick}>WITHDRAW HBAR</Button>
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
          ) : (
            <>
              <p className="text-small text-bold mb-3">Liquidity provied to Lockdrop</p>

              <div className="mt-6 rounded border border-secondary justify-content-between">
                <div className="d-flex justify-content-between align-items-center m-4">
                  <div className="d-flex align-items-center">
                    <IconToken symbol="HBAR" />
                    <span className="text-main ms-3">HBAR</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <p className="text-numeric text-small me-3">1000</p>
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
                    name="amountOut"
                  />
                }
                buttonSelectorComponent={
                  <ButtonSelector disabled selectedToken={'LP'} selectorText="Select token" />
                }
                walletBalanceComponent={
                  connected && !isHashpackLoading ? (
                    <WalletBalance
                      insufficientBallance={getInsufficientToken() as boolean}
                      walletBalance={hbarBalance}
                      onMaxButtonClick={(maxValue: string) => {
                        handleClaimInputChange(maxValue);
                      }}
                    />
                  ) : null
                }
              />

              {connected && !isHashpackLoading ? (
                <>
                  <div className="d-grid mt-5">
                    <Button onClick={handleDepositButtonClick}>CLAIM</Button>
                  </div>
                  <div className="d-grid mt-4">
                    <Button type="secondary" onClick={handleDepositButtonClick}>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default LockdropForm;