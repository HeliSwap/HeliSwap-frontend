import React, { useState, useEffect } from 'react';

import { LOCKDROP_STATE } from '../interfaces/common';
import { getCountdownReturnValues, formatTimeNumber } from '../utils/timeUtils';

interface ILockdropCounterProps {
  countdownEnd: number;
  currentState: LOCKDROP_STATE;
}

const LockdropCounter = ({ countdownEnd, currentState }: ILockdropCounterProps) => {
  const [isEnded, setIsEnded] = useState(false);
  const [countDown, setCountDown] = useState(countdownEnd - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countdownEnd - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownEnd]);

  useEffect(() => {
    countDown <= 0 && setIsEnded(true);
  }, [countDown]);

  const stateMapping: any = {
    [LOCKDROP_STATE.DEPOSIT]: 'Lockrop',
    [LOCKDROP_STATE.WITHDRAW]: 'Lockrop',
    [LOCKDROP_STATE.VESTING]: 'Vesting',
    [LOCKDROP_STATE.END]: 'Vesting',
  };

  return (
    <div className="container-lockdrop-progress">
      {currentState === LOCKDROP_STATE.PRE_VESTING ? (
        <p className="text-display text-bold text-center">DEPLOYING POOL...</p>
      ) : !isEnded ? (
        <div className="text-center">
          <p className="text-micro text-uppercase text-bold">
            {stateMapping[currentState]} ENDS IN
          </p>
          <div className="mt-3 d-flex justify-content-center">
            <div className="mx-3">
              <p className="text-numeric text-huge text-bold">
                {formatTimeNumber(getCountdownReturnValues(countDown).days)}
              </p>
              <p className="text-micro text-secondary text-uppercase mt-2">days</p>
            </div>
            <div className="mx-3">
              <p className="text-numeric text-huge text-bold">
                {formatTimeNumber(getCountdownReturnValues(countDown).hours)}
              </p>
              <p className="text-micro text-secondary text-uppercase mt-2">hours</p>
            </div>
            <div className="mx-3">
              <p className="text-numeric text-huge text-bold">
                {formatTimeNumber(getCountdownReturnValues(countDown).minutes)}
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
        <p className="text-display text-bold text-uppercase text-center px-3">
          {stateMapping[currentState]} ENDED
        </p>
      )}
    </div>
  );
};

export default LockdropCounter;
