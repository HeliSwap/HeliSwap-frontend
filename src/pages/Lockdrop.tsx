import numeral from 'numeral';
import React, { useState, useEffect } from 'react';

import ExpandContent from '../components/ExpandContent';
import LockdropCounter from '../components/LockdropCounter';
import LockdropForm from '../components/LockdropForm';

import { ILockdropData, LOCKDROP_STATE } from '../interfaces/common';

const Lockdrop = () => {
  const countdownEnd = 1676548800000; //Thursday, 16 February 2023 12:00:00
  const [currentState, setCurrentState] = useState(LOCKDROP_STATE.NOT_STARTED);

  const lockDropInitialData = {
    heliAmountRaw: '100000000000',
    heliAmount: '1000000',
    hbarAmount: '0',
    hbarAmountRaw: '0',
    lockedHbarAmount: '0',
  };

  const [lockDropData, setLockDropData] = useState<ILockdropData>(lockDropInitialData);

  useEffect(() => {
    setCurrentState(LOCKDROP_STATE.NOT_STARTED);
  }, []);

  return (
    <div className="container py-4 py-lg-7">
      <h1 className="text-display text-bold text-center">HELI LockDrop</h1>

      <div className="text-center mt-5">
        <h3 className="text-large text-bold">
          <span className="text-numeric">{numeral(lockDropData.heliAmount).format('0,0.00')}</span>{' '}
          HELI
        </h3>
        <p className="text-micro text-secondary mt-2">
          Total HELI amount that is going to given to Lockdrop.
        </p>
      </div>

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
            A large amount of HELI is distributed to anyone who deposits their HBAR on the lock drop
            page. We then merge the pre-announced amount of HELI (XXX,XXX,XXX) with the received
            HBAR to create an HBAR/HELI Liquidity Pool. ALL LP tokens that are generated throughout
            this process will be redistributed to participants and vest linearly over a 3 months
            period.
          </p>
        </div>

        <div className="col-lg-5 mt-4 mt-lg-0">
          <p className="text-small">
            This mechanism helps HeliSwap to create a large initial HBAR/HELI pool with deep
            liquidity and allows for a community driven natural price discovery process. In a
            further step your already vested LP tokens can then be used to earn additional token
            rewards by staking them into the HELI/HBAR yield farming campaign. This is only a
            suggestion and not financial advice, as already vested LP tokens can be used in any way
            you like.
          </p>
        </div>
      </div>
      {/* About the lockdrop */}

      <p className="mt-6 text-center">
        <a className="link-primary text-bold" href="#how-it-works">
          How it works
        </a>
      </p>

      {/* Lockdrop stats */}
      {lockDropData ? (
        <LockdropCounter
          lockDropData={lockDropData}
          currentState={currentState}
          countdownEnd={countdownEnd}
        />
      ) : null}
      {/* Lockdrop stats */}

      {/* Deposit, Withdrtaw & Claim form */}
      {currentState >= LOCKDROP_STATE.NOT_STARTED && lockDropData ? (
        <LockdropForm lockDropData={lockDropData} currentState={currentState} />
      ) : null}
      {/* Deposit, Withdrtaw & Claim form */}

      {/* How it works */}
      <h2 id="how-it-works" className="text-subheader text-bold text-center mt-7 mt-lg-20">
        How the LockDrop Works?
      </h2>

      <div className="row mt-6">
        <div className="col-lg-10 offset-lg-1">
          <h2 className="text-main text-bold mt-6">Step 1: The Lockdrop Pool</h2>
          <ul className="list-default mt-4">
            <li className="text-small">
              XXX,XXX,XXXX HELI tokens will be allocated to a so called "lockdrop pool".
            </li>
            <li className="text-small">
              Participants (you) may then decide to lock up their HBAR while the lockdrop-deposit
              window is open.
            </li>
            <li className="text-small">
              The entire lockdrop process lasts for 7 days. During the first 5 days, anyone may
              deposit or withdraw their HBAR at will and as many times as desired.
            </li>
            <li className="text-small">
              On days 6 & 7, no more deposits will be accepted. You may withdraw up to 50% of your
              investment on day 6 and a linearly decreasing amount on day 7 (50%-0%).
            </li>
            <li className="text-small">
              Each participant can only withdraw once after day 5 has ended.
            </li>
          </ul>

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
              <div className="container-day">🚀</div>
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

          <h2 className="text-main text-bold mt-6">Step 2: Allocation and LP token creation</h2>
          <ul className="list-default mt-4">
            <li className="text-small">
              Depending on your share of the overall HBAR contribution, we allocate a proprotional
              amount of the XXX,XXX,XXX HELI to your position. You can see the overall amount on the
              vesting page throughout the entire week.
            </li>
            <li className="text-small">
              We then take the HBAR and HELI and turn them into an LP token that will be used on the
              HBAR/HELI pool to bootstrap liquidity.
            </li>
            <li className="text-small">
              Over the next 3 months, your LP tokens will vest linearly and you can retrieve them on
              the same page as you originally deposited your Hbar. The amount of LP tokens you will
              receive will be directly proportional to the amount of HBAR you have contributed in
              relation to the total amount of HBAR contributed.
            </li>
          </ul>

          <h2 className="text-main text-bold mt-6">Step 3: Claiming your vested LP Tokens</h2>
          <ul className="list-default mt-4">
            <li className="text-small">
              During the 3 month linear vesting period, you may decide to vest and redeem portions
              of your allocated LP tokens.
            </li>
            <li className="text-small">
              Those redeemed LP tokens are yours and you have full ownership of them.
            </li>
            <li className="text-small">
              To make it easy for you, you can also directly stake your claimed LP tokens into our
              Yield Farm and benefit of the HBAR/HELI APRs (no financial advice).
            </li>
          </ul>
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
              You should only participate in a lockdrop with an amount that you are comfortable
              with. We allow you to deposit and withdraw HBAR as many times as you want, as the
              overall HBAR contribution amount determines the initial price of HELI and how many LP
              tokens you will receive, where the underlying assets are HBAR and HELI. Withdrawing
              HBAR during the first 5 days allows you to adjust your position if you desire to do
              so.
            </p>
          </ExpandContent>

          <ExpandContent title="What if I deposit my HBAR but then the HELI contribution and HELI price are not in line with my expectations?">
            <p className="text-small">
              During the first 5 days, you can simply withdraw your contribution, or, if you think
              it improves your position, may also deposit more.
            </p>
          </ExpandContent>

          <ExpandContent title="How many HELI tokens will I get?">
            <p className="text-small">
              This depends on a few factors.
              <br />
              (1) Your initial HBAR contribution compared to Total HBAR contribution (in %)
              <br />
              (2) The actual swap activity on the HBAR/HELI pool for your unvested tokens, which may
              affect the allotment of underlying HBAR and HELI assets for LP tokens when being
              claimed.
              <br />
              Overall however, you are receiving your portion of HELI and HBAR exceeding the HBAR
              contribution, as we simply match HELI with your HBAR after the pool closed.
            </p>
          </ExpandContent>

          <ExpandContent title="Is there a minimum of HELI tokens I can earn?">
            <p className="text-small">There is no minimum.</p>
          </ExpandContent>

          <ExpandContent title="Will I get my HBAR back after the 3 month vesting period?">
            <p className="text-small">
              You will receive LP tokens where the underlying assets are HBAR and HELI. These LP
              tokens are vested over a 3 months period. The amount of HBAR you can get back via
              breaking up your LP tokens, depends on various factors like for example the amount of
              swaps that happened, or the prices of both assets. Depending on these factors your
              HELI and HBAR positions may have changed.
              <br />
              It is possible, that you receive more or less HBAR than you contributed initially, but
              overall you will receive more value, as you do not just receive the HBAR, but also the
              HELI we associated with it.
              <br />
              You can break up your LP tokens to retrieve the underlying HBAR and HELI tokens.
            </p>
          </ExpandContent>

          <ExpandContent title="How does the 3 months linear vesting work?">
            <p className="text-small">
              Linear vesting over 3 months means that more of your LP tokens will be claimable each
              and every day (or every second to be precise).
              <br />
              To provide an example, let us assume that we are talking about 100 Days vesting
              (rather than 3 months):
              <br />
              Linear vesting would mean, that each day, 1% of your LP token allocation vests (1
              Day/100 Days). This means, that each day you have vested another 1% available to be
              claimed.
              <br />
              After the entire 100 days have passed, the entire amount has vested and is claimable.
            </p>
          </ExpandContent>

          <ExpandContent title="Will I earn APRs on my provided LP?">
            <p className="text-small">
              The locked LPs are not staked inside the Yield Farm. As your tokens vest, you can use
              the claimed LP tokens to stake them into the Yield Farm directly and start earning
              APRs.
              <br />
              All fully vested LP tokens are treated as any other LP token on the DEX and will earn
              the corresponding APR if you actively put them into the Yield Farm.
            </p>
          </ExpandContent>

          <ExpandContent title="Is there a minimum amount of HBAR I need to lock-up to participate?">
            <p className="text-small">No, there is no minimum. Anyone can participate.</p>
          </ExpandContent>

          <ExpandContent title="Why is a deep liquidity for the HELI token important to you guys?">
            <p className="text-small">
              Deep liquidity pools are essential for DEXes / Automated Market Makers to function
              properly. If a pool does not have sufficient liquidity it can create a large price
              impact when traders buy and sell assets. These can lead to capital inefficiencies and
              impermanent loss.
              <br />
              In the case of the HELI token this means that the deeper the liquidity pool for the
              HELI token the more capital efficient it will be and the less price impact trades will
              have on the asset price. Deeper liquidity and smaller price impact means that the risk
              of impermanent loss can also be reduced.
            </p>
          </ExpandContent>
        </div>
      </div>
      {/* FAQ */}
    </div>
  );
};

export default Lockdrop;
