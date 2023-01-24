import React from 'react';
// import Loader from '../components/Loader';
// import IconToken from '../components/IconToken';
import ExpandContent from '../components/ExpandContent';

const Lockdrop = () => {
  return (
    <div className="d-flex justify-content-center">
      <div>
        <h1 className="text-display text-bold text-center">HELI LockDrop</h1>

        <h2 className="text-subheader text-bold text-center mt-7 mt-lg-20">About the LockDrop</h2>

        <div className="row mt-5">
          <div className="col-lg-5 offset-lg-1">
            <p className="text-small">
              We give out a large amount of HELI to anyone who locks up their HBAR on the lockdrop
              page. We then merge the pre-announced amount of HELI with the received HBAR to create
              LP tokens that will vest linearly over 3 months and are added to a newly created
              HBAR/HELI Liquidity Pool. Simply explained, we give out a large amount of HELI to
              anyone who locks up their HBAR on the lockdrop page. We then merge the
            </p>
          </div>

          <div className="col-lg-5 mt-4 mt-lg-0">
            <p className="text-small">
              pre-announced amount of HELI with the received HBAR to create LP tokens that will vest
              linearly over 3 months and are added to a newly created HBAR/HELI Liquidity Pool. This
              mechanism helps HeliSwap create a large initial HBAR/HELI pool with deep liquidity and
              allows for a natural price discovery. Your vested LPs can then even be used to earn
              rewards on the HELI/HBAR pool by staking them into a farm, or used in any other
              fashion.
            </p>
          </div>
        </div>

        <h2 className="text-subheader text-bold text-center mt-7 mt-lg-20">
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
                breaking up your LP tokens, depends on various factors like for example the amount
                of swaps that happened, or the prices of both assets. Depending on these factors
                your HELI and HBAR positions may have changed.
                <br /> <br />
                It is possible, that you receive more or less HBAR than you contributed initially,
                but overall you will receive more value, as you do not just receive the HBAR, but
                also the HELI we associated with it.
                <br /> <br />
                You can break up your LP tokens to retrieve the underlying HBAR and HELI tokens.
              </p>
            </ExpandContent>

            <ExpandContent title="Will I get my HBAR back after the 3 month vesting period?">
              <p className="text-small">
                You will receive LP tokens where the underlying assets are HBAR and HELI. These LP
                tokens are vested over a 3 months period. The amount of HBAR you can get back via
                breaking up your LP tokens, depends on various factors like for example the amount
                of swaps that happened, or the prices of both assets. Depending on these factors
                your HELI and HBAR positions may have changed.
                <br /> <br />
                It is possible, that you receive more or less HBAR than you contributed initially,
                but overall you will receive more value, as you do not just receive the HBAR, but
                also the HELI we associated with it.
                <br /> <br />
                You can break up your LP tokens to retrieve the underlying HBAR and HELI tokens.
              </p>
            </ExpandContent>

            <ExpandContent title="Is there a minimum of HELI tokens I can earn?">
              <p className="text-small">
                You will receive LP tokens where the underlying assets are HBAR and HELI. These LP
                tokens are vested over a 3 months period. The amount of HBAR you can get back via
                breaking up your LP tokens, depends on various factors like for example the amount
                of swaps that happened, or the prices of both assets. Depending on these factors
                your HELI and HBAR positions may have changed.
                <br /> <br />
                It is possible, that you receive more or less HBAR than you contributed initially,
                but overall you will receive more value, as you do not just receive the HBAR, but
                also the HELI we associated with it.
                <br /> <br />
                You can break up your LP tokens to retrieve the underlying HBAR and HELI tokens.
              </p>
            </ExpandContent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lockdrop;
