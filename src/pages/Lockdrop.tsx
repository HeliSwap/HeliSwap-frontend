import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import ButtonSelector from '../components/ButtonSelector';
import ExpandContent from '../components/ExpandContent';
import InputToken from '../components/InputToken';
import InputTokenSelector from '../components/InputTokenSelector';
import WalletBalance from '../components/WalletBalance';
import IconToken from '../components/IconToken';
import Button from '../components/Button';

import { stripStringToFixedDecimals } from '../utils/numberUtils';
import { getTokenBalance, NATIVE_TOKEN } from '../utils/tokenUtils';

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

  const [hbarBalance, setHbarBalance] = useState(initialBallanceData);
  const [depositValue, setDepositValue] = useState('0');

  const handleInputChange = (rawValue: string) => {
    setDepositValue(rawValue);
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
    <div className="container py-4 py-lg-7">
      <h1 className="text-display text-bold text-center">HELI LockDrop</h1>
      <p className="text-main text-center mt-4">
        Select how much <span className="text-bold">HBAR</span> you want to deposit in the LockDrop
        Pool.
      </p>
      <p className="mt-6 text-center">
        <a className="link-primary text-bold" href="#how-it-works">
          How it works
        </a>
      </p>

      <div className="d-flex justify-content-center mt-8">
        <div className="container-action">
          <div className="container-dark">
            <InputTokenSelector
              isInvalid={getInsufficientToken() as boolean}
              inputTokenComponent={
                <InputToken
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const { value } = e.target;
                    const strippedValue = stripStringToFixedDecimals(value, 6);
                    handleInputChange(strippedValue);
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
                      handleInputChange(maxValue);
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

            {connected && !isHashpackLoading ? (
              <div className="d-grid mt-5">
                <Button onClick={handleDepositButtonClick}>DEPOSIT HBAR</Button>
              </div>
            ) : (
              <div className="d-grid mt-4">
                <Button disabled={isHashpackLoading} onClick={() => setShowConnectModal(true)}>
                  Connect wallet
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Lockdrop;
