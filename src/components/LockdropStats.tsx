import React from 'react';
import numeral from 'numeral';
import Tippy from '@tippyjs/react';

import Icon from './Icon';
import LockdropCounter from './LockdropCounter';

import { LOCKDROP_STATE, ILockdropData } from '../interfaces/common';
import { formatStringETHtoPriceFormatted } from '../utils/numberUtils';

interface ILockdropStats {
  countdownEnd: number;
  currentState: LOCKDROP_STATE;
  lockDropData: ILockdropData;
}

const LockdropStats = ({ lockDropData, currentState, countdownEnd }: ILockdropStats) => {
  const renderHELIDistribution = () => (
    <div>
      <h3 className="text-subheader text-bold">
        <span className="text-numeric">
          {numeral(lockDropData.totalTokens.valueStringETH).format('0,0.00')}
        </span>{' '}
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

  const heliEstimatedPrice = 0.063115689;

  return (
    <div>
      <h2 className="text-subheader text-center mt-7 mt-lg-10">
        <span className="text-bold">HELI</span> Liquidity Bootstrap LockDrop
      </h2>
      <div className="row mt-6 mt-lg-8">
        <div className="col-lg-3 offset-md-1 mt-lg-7">
          {renderHELIDistribution()}
          <div className="mt-5 mt-lg-15">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">
                {numeral(lockDropData.totalHbars.valueStringETH).format('0,0.00')}
              </span>{' '}
              HBAR
            </h3>
            <div className="d-flex align-items-center">
              <p className="text-micro text-secondary mt-2">
                Total HBAR deposited to the Lockdrop Pool
              </p>
              <Tippy
                content={`This is the amount of HBAR that the community has contributed towards the HELI Lockdrop Pool.`}
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
            <p className="text-micro text-secondary mb-2">Initial HELI Price After the Lockdrop</p>
            <div className="d-flex justify-content-center align-items-center">
              <h3 className="text-subheader text-bold">
                $<span className="text-numeric">{heliEstimatedPrice}</span>
              </h3>
              <Tippy
                content={`The price of the HELI token determined by the community through their HBAR contributions `}
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
                {numeral(lockDropData.lockedHbars.valueStringETH).format('0,0.00')}
              </span>{' '}
              HBAR
            </h3>
            <div className="d-flex justify-content-end align-items-center">
              <p className="text-micro text-secondary mt-2">My liquidity added to Lockdrop</p>
              <Tippy content={`How many HBAR you have contributed to the HELI Lockdrop Pool. `}>
                <span className="ms-2">
                  <Icon size="small" color="gray" name="hint" />
                </span>
              </Tippy>
            </div>
            <hr />
          </div>

          <div className="text-end mt-5 mt-lg-15">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">
                {formatStringETHtoPriceFormatted(lockDropData.estimatedLPPercentage)}
              </span>{' '}
              % of all LP TOKENS
            </h3>
            <div className="d-flex justify-content-end align-items-center">
              <p className="text-micro text-secondary mt-2">My estimated LP Token allocation</p>
              <Tippy
                content={`The percentage of total LP token allocation your current position represents.`}
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
