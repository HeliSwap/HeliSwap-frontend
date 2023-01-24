import React, { useState, useEffect } from 'react';

import ExpandContent from '../components/ExpandContent';
import LockdropCounter from '../components/LockdropCounter';
import LockdropForm from '../components/LockdropForm';

import { LOCKDROP_STATE } from '../interfaces/common';

const Lockdrop = () => {
  const countdownEnd = 1674567900000;
  const [currentState, setCurrentState] = useState(LOCKDROP_STATE.NOT_STARTED);

  useEffect(() => {
    setCurrentState(LOCKDROP_STATE.NOT_STARTED);
  }, []);

  return (
    <div
      className={`container ${
        currentState > LOCKDROP_STATE.NOT_STARTED ? 'container-lockdrop' : ''
      } py-4 py-lg-7`}
    >
      <h1 className="text-display text-bold text-center">HELI LockDrop</h1>

      {currentState > LOCKDROP_STATE.NOT_STARTED ? (
        currentState < LOCKDROP_STATE.FINISHED ? (
          <p className="text-main text-center mt-4">
            Select how much <span className="text-bold">HBAR</span> you want to deposit in the
            LockDrop Pool.
          </p>
        ) : (
          <p className="text-main text-center mt-4">Locking period has ended.</p>
        )
      ) : null}

      {/* About the lockdrop */}
      <h2 className="text-subheader text-bold text-center mt-7 mt-lg-10">About the LockDrop</h2>
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

      <p className="mt-6 text-center">
        <a className="link-primary text-bold" href="#how-it-works">
          How it works
        </a>
      </p>

      {/* Deposit, Withdrtaw & Claim form */}
      {currentState > LOCKDROP_STATE.NOT_STARTED ? (
        <LockdropForm currentState={currentState} />
      ) : null}

      {/* Deposit, Withdrtaw & Claim form */}

      {/* Lockdrop stats */}
      <LockdropCounter countdownEnd={countdownEnd} />
      {/* Lockdrop stats */}

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
