import React, { useContext } from 'react';
import numeral from 'numeral';
import Tippy from '@tippyjs/react';

import { GlobalContext } from '../providers/Global';

import Icon from './Icon';
import LockdropCounter from './LockdropCounter';

import { LOCKDROP_STATE, ILockdropData } from '../interfaces/common';
import { calculateLPTokens } from '../utils/numberUtils';

interface ILockdropStats {
  countdownEnd: number;
  currentState: LOCKDROP_STATE;
  lockDropData: ILockdropData;
}

const LockdropStats = ({ lockDropData, currentState, countdownEnd }: ILockdropStats) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const renderHELIDistribution = () => (
    <div>
      <h3 className="text-subheader text-bold">
        <span className="text-numeric">{numeral(lockDropData.heliAmount).format('0,0.00')}</span>{' '}
        HELI
      </h3>
      <div className="d-flex align-items-center">
        <p className="text-micro text-secondary mt-2">Total HELI amount distributed in Lockdrop</p>
        <Tippy
          content={`This is the amount that will be distributed to anyone who locks up HBAR in the lockdrop pool. We match your HBAR with HELI following your share of total contribution to create LP tokens.`}
        >
          <span className="ms-2">
            <Icon size="small" color="gray" name="hint" />
          </span>
        </Tippy>
      </div>
      <hr />
    </div>
  );

  const heliEstimatedPrice =
    (Number(lockDropData.hbarAmount) / Number(lockDropData.heliAmount)) * hbarPrice;
  const LPEstimatedTokens = calculateLPTokens(
    lockDropData.heliAmount,
    lockDropData.lockedHbarAmount,
  );

  return (
    <div>
      <h2 className="text-subheader text-center mt-7 mt-lg-20">
        <span className="text-bold">HELI</span> Liquidity Bootstrap LockDrop
      </h2>
      <div className="row mt-6 mt-lg-8">
        <div className="col-lg-3 offset-md-1 mt-lg-7">
          {renderHELIDistribution()}
          <div className="mt-5 mt-lg-15">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">
                {numeral(lockDropData.hbarAmount).format('0,0.00')}
              </span>{' '}
              HBAR
            </h3>
            <div className="d-flex align-items-center">
              <p className="text-micro text-secondary mt-2">
                Total HBAR deposited to the Lockdrop Pool
              </p>
              <Tippy
                content={`This is the amount of HBAR that the community currently has locked into the HELI Lockdrop pool. Please be aware, that this number is not final as more users may deposit, or users may deposit more or withdraw their HBAR again. Please read below to understand the mechanism.`}
              >
                <span className="ms-2">
                  <Icon size="small" color="gray" name="hint" />
                </span>
              </Tippy>
            </div>
            <hr />
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column align-items-center">
          <LockdropCounter currentState={currentState} countdownEnd={countdownEnd} />

          <div className="text-center mt-6 mt-lg-10">
            <p className="text-micro text-secondary mb-2">Estimated HELI Price After Launch</p>
            <div className="d-flex justify-content-center align-items-center">
              <h3 className="text-subheader text-bold">
                $
                <span className="text-numeric">
                  {' '}
                  {Number(lockDropData.hbarAmount) > 0 ? heliEstimatedPrice.toFixed(10) : '-'}
                </span>
              </h3>
              <Tippy
                content={`After 7 days, the lockdrop closes and the LP tokens are created to build the initial liquidity. This is the HELI price in the moment of launch. It depends on the ratio of HBAR committed to Total HELI in the lock drop at the end of day 7.`}
              >
                <span className="ms-2">
                  <Icon size="small" color="gray" name="hint" />
                </span>
              </Tippy>
            </div>
            <hr />
          </div>
        </div>

        <div className="col-lg-3 mt-lg-7">
          <div className="text-end">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">
                {numeral(lockDropData.lockedHbarAmount).format('0,0.00')}
              </span>{' '}
              HBAR
            </h3>
            <div className="d-flex justify-content-end align-items-center">
              <p className="text-micro text-secondary mt-2">My liquidity added to Lockdrop</p>
              <Tippy
                content={`This is how many HBAR you have deposited into the pool in total. You may deposit more or withdraw a portion of it. Only commit an amount that you are comfortable with. For more information read below.`}
              >
                <span className="ms-2">
                  <Icon size="small" color="gray" name="hint" />
                </span>
              </Tippy>
            </div>
            <hr />
          </div>

          <div className="text-end mt-5 mt-lg-15">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">{LPEstimatedTokens}</span> LP TOKENS
            </h3>
            <div className="d-flex justify-content-end align-items-center">
              <p className="text-micro text-secondary mt-2">My estimated LP Token allocation</p>
              <Tippy
                content={`This is an estimate based on your current deposit compared to the total HBAR that was deposited into the pool. It may change depending on either of these metrics increasing or decreasing.`}
              >
                <span className="ms-2">
                  <Icon size="small" color="gray" name="hint" />
                </span>
              </Tippy>
            </div>
            <hr />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockdropStats;
