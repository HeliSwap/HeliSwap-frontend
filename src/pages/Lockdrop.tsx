import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';

import Tippy from '@tippyjs/react';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import ButtonSelector from '../components/ButtonSelector';
import ExpandContent from '../components/ExpandContent';
import InputToken from '../components/InputToken';
import InputTokenSelector from '../components/InputTokenSelector';
import WalletBalance from '../components/WalletBalance';
import IconToken from '../components/IconToken';
import Button from '../components/Button';
import Icon from '../components/Icon';

import { stripStringToFixedDecimals } from '../utils/numberUtils';
import { getTokenBalance, NATIVE_TOKEN } from '../utils/tokenUtils';

enum LOCKDROP_STATE {
  NOT_STARTED,
  DAY_1_5,
  DAY_6,
  DAY_7,
  FINISHED,
}

enum ActionTab {
  'Deposit',
  'Withdraw',
}

const Lockdrop = () => {
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

  const [currentState, setCurrentState] = useState(LOCKDROP_STATE.NOT_STARTED);
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
    <div className="container container-lockdrop py-4 py-lg-7">
      <h1 className="text-display text-bold text-center">HELI LockDrop</h1>

      {currentState >= LOCKDROP_STATE.NOT_STARTED && currentState < LOCKDROP_STATE.FINISHED ? (
        <p className="text-main text-center mt-4">
          Select how much <span className="text-bold">HBAR</span> you want to deposit in the
          LockDrop Pool.
        </p>
      ) : (
        <p className="text-main text-center mt-4">Locking period has ended.</p>
      )}

      <p className="mt-6 text-center">
        <a className="link-primary text-bold" href="#how-it-works">
          How it works
        </a>
      </p>

      {/* Deposit, Withdrtaw & Claim form */}
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
                        <ButtonSelector
                          disabled
                          selectedToken={'HBAR'}
                          selectorText="Select token"
                        />
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
                      <p className="text-small text-bold m-4">
                        Estimate reward after the LockDrop:
                      </p>
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
                        <ButtonSelector
                          disabled
                          selectedToken={'HBAR'}
                          selectorText="Select token"
                        />
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
      {/* Deposit, Withdrtaw & Claim form */}

      {/* Lockdrop stats */}
      <h2 className="text-subheader text-center mt-7 mt-lg-20">
        <span className="text-bold">HELI</span> Liquidity Bootstrap LockDrop
      </h2>
      <div className="row mt-6">
        <div className="col-lg-3 offset-md-1">
          <div>
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">123,000,000.00</span> HELI
            </h3>
            <p className="text-micro text-secondary mt-2">
              Total HELI amount that is going to given to Lockdrop.
            </p>
            <hr />
          </div>

          <div className="mt-5 mt-lg-15">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">465,000,000.00</span> HBAR
            </h3>
            <p className="text-micro text-secondary mt-2">Total liquidity added to Lockdrop.</p>
            <hr />
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column align-items-center">
          <div className="container-lockdrop-progress">
            {currentState < LOCKDROP_STATE.FINISHED ? (
              <div className="text-center">
                <p className="text-micro text-bold">ENDS IN</p>
                <div className="mt-3 d-flex justify-content-center">
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">10</p>
                    <p className="text-micro text-secondary text-uppercase mt-2">days</p>
                  </div>
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">21</p>
                    <p className="text-micro text-secondary text-uppercase mt-2">hours</p>
                  </div>
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">13</p>
                    <p className="text-micro text-secondary text-uppercase mt-2">minutes</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-huge text-bold">ENDED</p>
            )}
          </div>

          <div className="text-center mt-6 mt-lg-10">
            <p className="text-micro text-secondary mb-2">Estimated HELI Price After Launch</p>
            <h3 className="text-subheader text-bold">
              $<span className="text-numeric"> 0.25</span>
            </h3>
            <hr />
          </div>
        </div>

        <div className="col-lg-3">
          <div className="text-end">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">123,000.00</span> HBAR
            </h3>
            <p className="text-micro text-secondary mt-2">My liquidity added to Lockdrop</p>
            <hr />
          </div>

          <div className="text-end mt-5 mt-lg-15">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">0.05%</span> LP TOKENS
            </h3>
            <p className="text-micro text-secondary mt-2">
              My estimated LP Tokens reward following current investment.
            </p>
            <hr />
          </div>
        </div>
      </div>
      {/* Lockdrop stats */}

      {/* About the lockdrop */}
      <h2 className="text-subheader text-bold text-center mt-7 mt-lg-20">About the LockDrop</h2>
      <div className="row mt-5">
        <div className="col-lg-5 offset-lg-1">
          <p className="text-small">
            We give out a large amount of HELI to anyone who locks up their HBAR on the lockdrop
            page. We then merge the pre-announced amount of HELI with the received HBAR to create LP
            tokens that will vest linearly over 3 months and are added to a newly created HBAR/HELI
            Liquidity Pool. Simply explained, we give out a large amount of HELI to anyone who locks
            up their HBAR on the lockdrop page. We then merge the
          </p>
        </div>

        <div className="col-lg-5 mt-4 mt-lg-0">
          <p className="text-small">
            pre-announced amount of HELI with the received HBAR to create LP tokens that will vest
            linearly over 3 months and are added to a newly created HBAR/HELI Liquidity Pool. This
            mechanism helps HeliSwap create a large initial HBAR/HELI pool with deep liquidity and
            allows for a natural price discovery. Your vested LPs can then even be used to earn
            rewards on the HELI/HBAR pool by staking them into a farm, or used in any other fashion.
          </p>
        </div>
      </div>
      {/* About the lockdrop */}

      {/* How it works */}
      <h2 id="how-it-works" className="text-subheader text-bold text-center mt-7 mt-lg-20">
        How the LockDrop Works?
      </h2>
      <div className="row mt-6">
        <div className="col-lg-10 offset-lg-1">
          <div className="mt-6">
            <div className="container-days-labels">
              <p className="text-micro text-center">Day 1-5</p>
              <p className="text-micro text-center">Day 6-7</p>
            </div>
            <div className="container-days mt-4">
              <div className="container-day">1</div>
              <div className="container-day">2</div>
              <div className="container-day">3</div>
              <div className="container-day">4</div>
              <div className="container-day">5</div>
              <div className="container-day is-day-6">6</div>
              <div className="container-day is-day-7">7</div>
            </div>
            <div className="container-days-labels mt-4">
              <p className="text-micro text-center">
                Deposits and withdraws are allowed during the first 5 days.
              </p>
              <div>
                <ul className="list-default">
                  <li className="text-micro">From day 6 on deposits are closed</li>
                  <li className="text-micro">On day 6 users can withdraw up to 50%.</li>
                  <li className="text-micro">
                    On day 7, the final day, the max withdrawable amount decreases linearly,
                    starting at 50% and decreasing to 0% at the end of the lockdrop.
                  </li>
                  <li className="text-micro">
                    <span style={{ textDecoration: 'underline' }}>Be aware:</span> Only 1 withdraw
                    transaction can be made during the last 2 days.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* How it works */}

      {/* FAQ */}
      <h2 className="text-subheader text-bold text-center mt-7 mt-lg-20">
        Some Frequently Asked Questions
      </h2>
      <div className="row mt-6">
        <div className="col-lg-10 offset-lg-1">
          <ExpandContent title="Why would I deposit / withdraw HBAR?">
            <p className="text-small">
              You will receive LP tokens where the underlying assets are HBAR and HELI. These LP
              tokens are vested over a 3 months period. The amount of HBAR you can get back via
              breaking up your LP tokens, depends on various factors like for example the amount of
              swaps that happened, or the prices of both assets. Depending on these factors your
              HELI and HBAR positions may have changed.
              <br /> <br />
              It is possible, that you receive more or less HBAR than you contributed initially, but
              overall you will receive more value, as you do not just receive the HBAR, but also the
              HELI we associated with it.
              <br /> <br />
              You can break up your LP tokens to retrieve the underlying HBAR and HELI tokens.
            </p>
          </ExpandContent>

          <ExpandContent title="Will I get my HBAR back after the 3 month vesting period?">
            <p className="text-small">
              You will receive LP tokens where the underlying assets are HBAR and HELI. These LP
              tokens are vested over a 3 months period. The amount of HBAR you can get back via
              breaking up your LP tokens, depends on various factors like for example the amount of
              swaps that happened, or the prices of both assets. Depending on these factors your
              HELI and HBAR positions may have changed.
              <br /> <br />
              It is possible, that you receive more or less HBAR than you contributed initially, but
              overall you will receive more value, as you do not just receive the HBAR, but also the
              HELI we associated with it.
              <br /> <br />
              You can break up your LP tokens to retrieve the underlying HBAR and HELI tokens.
            </p>
          </ExpandContent>

          <ExpandContent title="Is there a minimum of HELI tokens I can earn?">
            <p className="text-small">
              You will receive LP tokens where the underlying assets are HBAR and HELI. These LP
              tokens are vested over a 3 months period. The amount of HBAR you can get back via
              breaking up your LP tokens, depends on various factors like for example the amount of
              swaps that happened, or the prices of both assets. Depending on these factors your
              HELI and HBAR positions may have changed.
              <br /> <br />
              It is possible, that you receive more or less HBAR than you contributed initially, but
              overall you will receive more value, as you do not just receive the HBAR, but also the
              HELI we associated with it.
              <br /> <br />
              You can break up your LP tokens to retrieve the underlying HBAR and HELI tokens.
            </p>
          </ExpandContent>
        </div>
      </div>
      {/* FAQ */}
    </div>
  );
};

export default Lockdrop;
