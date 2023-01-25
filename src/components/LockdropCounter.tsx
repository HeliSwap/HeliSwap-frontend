import React, { useState, useEffect, useContext } from 'react';
import numeral from 'numeral';
import Tippy from '@tippyjs/react';

import { GlobalContext } from '../providers/Global';

import { LOCKDROP_STATE, ILockdropData } from '../interfaces/common';
import { calculateLPTokens, formatStringETHtoPriceFormatted } from '../utils/numberUtils';
import Icon from './Icon';

interface ILockdropCounterProps {
  countdownEnd: number;
  currentState: LOCKDROP_STATE;
  lockDropData: ILockdropData;
}

const LockdropCounter = ({ countdownEnd, currentState, lockDropData }: ILockdropCounterProps) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

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
        <span className="text-numeric">{numeral(lockDropData.heliAmount).format('0,0.00')}</span>{' '}
        HELI
      </h3>
      <div className="d-flex align-items-center">
        <p className="text-micro text-secondary mt-2">
          Total HELI amount that is going to given to Lockdrop.
        </p>
        <Tippy content={``}>
          <span className="ms-2">
            <Icon size="small" color="gray" name="hint" />
          </span>
        </Tippy>
      </div>
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
  const heliEstimatedPrice =
    (Number(lockDropData.heliAmount) / Number(lockDropData.hbarAmount)) * hbarPrice;
  const LPEstimatedTokens = calculateLPTokens(lockDropData.heliAmount, lockDropData.hbarAmount);

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
              <p className="text-micro text-secondary mt-2">Total liquidity added to Lockdrop.</p>
              <Tippy content={``}>
                <span className="ms-2">
                  <Icon size="small" color="gray" name="hint" />
                </span>
              </Tippy>
            </div>
            <hr />
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column align-items-center">
          <div className="container-lockdrop-progress">
            {!isEnded ? (
              <div className="text-center">
                <p className="text-micro text-bold">{notStarted ? 'STARTS IN' : 'ENDS IN'}</p>
                <div className="mt-3 d-flex justify-content-center">
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">
                      {getCountdownReturnValues(countDown).days < 10
                        ? `0${getCountdownReturnValues(countDown).days}`
                        : getCountdownReturnValues(countDown).days}
                    </p>
                    <p className="text-micro text-secondary text-uppercase mt-2">days</p>
                  </div>
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">
                      {getCountdownReturnValues(countDown).hours < 10
                        ? `0${getCountdownReturnValues(countDown).hours}`
                        : getCountdownReturnValues(countDown).hours}
                    </p>
                    <p className="text-micro text-secondary text-uppercase mt-2">hours</p>
                  </div>
                  <div className="mx-3">
                    <p className="text-numeric text-huge text-bold">
                      {getCountdownReturnValues(countDown).minutes < 10
                        ? `0${getCountdownReturnValues(countDown).minutes}`
                        : getCountdownReturnValues(countDown).minutes}
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
            <p className="text-micro text-secondary mb-2">Estimated HELI Price After Launch</p>
            <div className="d-flex justify-content-center align-items-center">
              <h3 className="text-subheader text-bold">
                $
                <span className="text-numeric">
                  {' '}
                  {Number(lockDropData.hbarAmount) > 0
                    ? formatStringETHtoPriceFormatted(heliEstimatedPrice.toString(), 3)
                    : '-'}
                </span>
              </h3>
              <Tippy content={``}>
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
              <Tippy content={``}>
                <span className="ms-2">
                  <Icon size="small" color="gray" name="hint" />
                </span>
              </Tippy>
            </div>
            <hr />
          </div>

          <div className="text-end mt-5 mt-lg-15">
            <h3 className="text-subheader text-bold">
              <span className="text-numeric">0.00%</span> LP TOKENS
            </h3>
            <div className="d-flex justify-content-end align-items-center">
              <p className="text-micro text-secondary mt-2">
                My estimated LP Tokens reward following current investment.
              </p>
              <Tippy content={``}>
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

export default LockdropCounter;
