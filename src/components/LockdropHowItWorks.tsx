import React from 'react';

import { IDaysMapping } from '../interfaces/common';

interface ILockdropHowItWorks {
  daysSinceStart: number;
  daysMapping: IDaysMapping;
}

const LockdropHowItWorks = ({ daysSinceStart, daysMapping }: ILockdropHowItWorks) => {
  return (
    <>
      <h2 id="how-it-works" className="text-subheader text-bold text-center mt-7 mt-lg-20">
        How the LockDrop Works?
      </h2>

      <div className="row mt-6">
        <div className="col-lg-10 offset-lg-1">
          <h2 className="text-main text-bold mt-6">Step 1: The Lockdrop Pool</h2>
          <ul className="list-default mt-4">
            <li className="text-small">
              20,000,000 HELI tokens will be allocated to a so called "lockdrop pool".
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
              {Object.keys(daysMapping).map(key => (
                <div
                  key={key}
                  className={`${daysMapping[key].className} ${
                    Number(key) === daysSinceStart ? 'is-active' : ''
                  }`}
                >
                  {key}
                </div>
              ))}
              {/* <div className="container-day">1</div>
              <div className="container-day">2</div>
              <div className="container-day">3</div>
              <div className="container-day">4</div>
              <div className="container-day">5</div>
              <div className="container-day is-day-6">6</div>
              <div className="container-day is-day-7">7</div> */}
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
              <p className="text-micro text-center">HELI launched</p>
            </div>
          </div>

          <h2 className="text-main text-bold mt-6">Step 2: Allocation and LP token creation</h2>
          <ul className="list-default mt-4">
            <li className="text-small">
              Depending on your share of the overall HBAR contribution, we allocate a proportional
              amount of the 20,000,000 HELI to your position. You can see the overall amount on the
              vesting page throughout the entire week.
            </li>
            <li className="text-small">
              We then take the HBAR and HELI and turn them into an LP token that will be used on the
              HBAR/ HELI pool to bootstrap liquidity.
            </li>
            <li className="text-small">
              Over the next 3 months, your LP tokens will vest linearly and you can retrieve them on
              the same page as you originally deposited your HBAR. The amount of LP tokens you will
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
    </>
  );
};

export default LockdropHowItWorks;
