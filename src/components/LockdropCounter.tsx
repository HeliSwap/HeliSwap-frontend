import React, { useState, useEffect } from 'react';
import numeral from 'numeral';

import { LOCKDROP_STATE } from '../interfaces/common';

interface ILockdropCounterProps {
  countdownEnd: number;
  currentState: LOCKDROP_STATE;
}

const LockdropCounter = ({ countdownEnd, currentState }: ILockdropCounterProps) => {
  const [isEnded, setIsEnded] = useState(false);
  const [countDown, setCountDown] = useState(countdownEnd - new Date().getTime());

  const getCountdownReturnValues = (countDown: number) => {
    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const renderHELIDistribution = () => (
    <div>
      <h3 className="text-subheader text-bold">
        <span className="text-numeric">{numeral(heliTokenDistribution).format('0,0.00')}</span> HELI
      </h3>
      <p className="text-micro text-secondary mt-2">
        Total HELI amount that is going to given to Lockdrop.
      </p>
      <hr />
    </div>
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countdownEnd - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownEnd]);

  useEffect(() => {
    countDown <= 0 && setIsEnded(true);
  }, [countDown]);

  const notStarted = currentState === LOCKDROP_STATE.NOT_STARTED;
  const heliTokenDistribution = 1_000_000;

  return (
    <div>
      <h2 className="text-subheader text-center mt-7 mt-lg-20">
        <span className="text-bold">HELI</span> Liquidity Bootstrap LockDrop
      </h2>
      <div className="row mt-6 mt-lg-8">
        <div className="col-lg-3 offset-md-1 mt-lg-7">
          {!notStarted ? (
            <>
              {renderHELIDistribution()}
              <div className="mt-5 mt-lg-15">
                <h3 className="text-subheader text-bold">
                  <span className="text-numeric">465,000,000.00</span> HBAR
                </h3>
                <p className="text-micro text-secondary mt-2">Total liquidity added to Lockdrop.</p>
                <hr />
              </div>
            </>
          ) : null}
        </div>

        <div className="col-lg-4 d-flex flex-column align-items-center">
          <div className="container-lockdrop-progress">
            {!isEnded ? (
              <div className="text-center">
                <p className="text-micro text-bold">{notStarted ? 'STARTS IN' : 'ENDS IN'}</p>
                <div className="mt-3 d-flex justify-content-center">
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">
                      {getCountdownReturnValues(countDown).days}
                    </p>
                    <p className="text-micro text-secondary text-uppercase mt-2">days</p>
                  </div>
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">
                      {getCountdownReturnValues(countDown).hours}
                    </p>
                    <p className="text-micro text-secondary text-uppercase mt-2">hours</p>
                  </div>
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">
                      {getCountdownReturnValues(countDown).minutes}
                    </p>
                    <p className="text-micro text-secondary text-uppercase mt-2">minutes</p>
                  </div>
                  {/* <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">
                      {getCountdownReturnValues(countDown).seconds}
                    </p>
                    <p className="text-micro text-secondary text-uppercase mt-2">seconds</p>
                  </div> */}
                </div>
              </div>
            ) : (
              <p className="text-huge text-bold">ENDED</p>
            )}
          </div>

          <div className="text-center mt-6 mt-lg-10">
            {notStarted ? (
              renderHELIDistribution()
            ) : (
              <>
                <p className="text-micro text-secondary mb-2">Estimated HELI Price After Launch</p>
                <h3 className="text-subheader text-bold">
                  $<span className="text-numeric"> 0.25</span>
                </h3>
                <hr />
              </>
            )}
          </div>
        </div>

        <div className="col-lg-3 mt-lg-7">
          {!notStarted ? (
            <>
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
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LockdropCounter;
