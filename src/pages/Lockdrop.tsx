import numeral from 'numeral';
import React, { useState, useEffect } from 'react';

import LockdropCounter from '../components/LockdropCounter';
import LockdropFAQ from '../components/LockdropFAQ';
import LockdropForm from '../components/LockdropForm';
import LockdropHowItWorks from '../components/LockdropHowItWorks';

import { ILockdropData, LOCKDROP_STATE } from '../interfaces/common';

const Lockdrop = () => {
  const countdownEnd = 1676548800000; //Thursday, 16 February 2023 12:00:00
  const [currentState, setCurrentState] = useState(LOCKDROP_STATE.NOT_STARTED);

  const lockDropInitialData = {
    heliAmountRaw: '100000000000',
    heliAmount: '20000000',
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
      <h1 className="text-display text-bold text-center">HELI Community Lockdrop</h1>

      {/* <div className="text-center mt-5">
        <h3 className="text-large text-bold">
          <span className="text-numeric">{numeral(lockDropData.heliAmount).format('0,0.00')}</span>{' '}
          HELI
        </h3>
        <p className="text-micro text-secondary mt-2">Total HELI amount distributed in Lockdrop</p>
      </div> */}

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

      {/* Lockdrop stats */}
      {lockDropData ? (
        <LockdropCounter
          lockDropData={lockDropData}
          currentState={currentState}
          countdownEnd={countdownEnd}
        />
      ) : null}
      {/* Lockdrop stats */}

      {/* About the lockdrop */}
      <h2 className="text-subheader text-bold text-center mt-7 mt-lg-10">About the LockDrop</h2>
      <div className="row mt-5">
        <div className="col-lg-6 offset-lg-3">
          <p className="text-small">
            A large amount of HELI is distributed to anyone who deposits their HBAR on the lock drop
            page. We then merge the pre-announced amount of HELI (20,000,000) with the received HBAR
            to create an HBAR/HELI Liquidity Pool. ALL LP tokens that are generated throughout this
            process will be redistributed to participants and vest linearly over a 3 months period.{' '}
            <br />
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

      {/* Deposit, Withdrtaw & Claim form */}
      {currentState >= LOCKDROP_STATE.NOT_STARTED && lockDropData ? (
        <LockdropForm
          countdownEnd={countdownEnd}
          lockDropData={lockDropData}
          currentState={currentState}
        />
      ) : null}
      {/* Deposit, Withdrtaw & Claim form */}

      {/* How it works */}
      <LockdropHowItWorks />
      {/* How it works */}

      {/* FAQ */}
      <LockdropFAQ />
      {/* FAQ */}

      <div className="mt-6 mt-lg-8 d-flex justify-content-center align-items-center">
        <p className="text-main">More Information:</p>
        <a
          href="https://app.gitbook.com/o/-MjU-PIYsZoZ56-mDgdv/s/WEJ4Xz5JZB9w7aYjQ7lg/~/changes/covMo7r1tk2GpJW6LfxL/heli-lockdrop"
          rel="noreferrer"
          target="_blank"
        >
          <img className="ms-4" src="/button-gitbook.svg" alt="" />
        </a>
      </div>
    </div>
  );
};

export default Lockdrop;
