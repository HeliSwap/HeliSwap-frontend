import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import numeral from 'numeral';
import { ethers } from 'ethers';

import { GlobalContext } from '../providers/Global';

import LockdropCounter from '../components/LockdropCounter';
import LockdropFAQ from '../components/LockdropFAQ';
import LockdropForm from '../components/LockdropForm';
import LockdropHowItWorks from '../components/LockdropHowItWorks';
import Loader from '../components/Loader';

import { ILockdropData, LOCKDROP_STATE } from '../interfaces/common';
import { getProvider, idToAddress } from '../utils/tokenUtils';

const LockDropABI = require('../abi/LockDrop.json');

const Lockdrop = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const lockDropContract = useMemo(() => {
    const provider = getProvider();
    const lockDropContractAddress = process.env.REACT_APP_LOCKDROP_ADDRESS;

    return new ethers.Contract(lockDropContractAddress as string, LockDropABI, provider);
  }, []);

  const [countdownEnd, setCountDownEnd] = useState(0);
  const [currentState, setCurrentState] = useState(LOCKDROP_STATE.NOT_STARTED);
  const [loadingContractData, setLoadingContractData] = useState(true);

  const lockDropInitialData = {
    heliAmountRaw: '100000000000',
    heliAmount: '1000000',
    hbarAmount: '0',
    hbarAmountRaw: '0',
    lockedHbarAmount: '0',
    endTimestamp: 0,
  };

  const getContractData = useCallback(async () => {
    setLoadingContractData(true);

    const promisesArray = [
      lockDropContract.duration(),
      lockDropContract.vestingEndTime(),
      lockDropContract.totalHbars(),
      lockDropContract.totalLp(),
      lockDropContract.totalHeliTokens(),
      lockDropContract.providers(idToAddress(userId)),
    ];

    try {
      const [
        durationBN,
        vestingEndTimeBN,
        totalHbarsBN,
        totalLpBN,
        totalHeliTokensBN,
        stakedTokensBN,
      ] = await Promise.all(promisesArray);

      console.log('duration', durationBN.toString());
      console.log('vestingEndTime', vestingEndTimeBN.toString());
      console.log('totalHbars', totalHbarsBN.toString());
      console.log('totalLp', totalLpBN.toString());
      console.log('totalHeliTokens', totalHeliTokensBN.toString());
      console.log('stakedTokensBN', stakedTokensBN.toString());

      setLockDropData({
        heliAmountRaw: totalHeliTokensBN.toString(),
        hbarAmountRaw: totalHbarsBN.toString(),
        heliAmount: ethers.utils.formatUnits(totalHeliTokensBN, 8),
        hbarAmount: ethers.utils.formatUnits(totalHbarsBN, 8),
        lockedHbarAmount: ethers.utils.formatUnits(stakedTokensBN, 8),
        endTimestamp: Number(durationBN.toString()),
      });
      setCountDownEnd(Number(durationBN.toString()) * 1000);
    } catch (e) {
    } finally {
      setLoadingContractData(false);
    }
  }, [lockDropContract, userId]);

  const [lockDropData, setLockDropData] = useState<ILockdropData>(lockDropInitialData);

  useEffect(() => {
    setCurrentState(LOCKDROP_STATE.NOT_STARTED);
    setLockDropData(lockDropInitialData);
  }, [lockDropInitialData]);

  useEffect(() => {
    userId && lockDropContract && getContractData();
  }, [lockDropContract, getContractData, userId]);

  return (
    <div className="container py-4 py-lg-7">
      <h1 className="text-display text-bold text-center">HELI Community Lockdrop</h1>

      {loadingContractData ? (
        <div className="d-flex justify-content-center my-6">
          <Loader />
        </div>
      ) : (
        <>
          <div className="text-center mt-5">
            <h3 className="text-large text-bold">
              <span className="text-numeric">
                {numeral(lockDropData.heliAmount).format('0,0.00')}
              </span>{' '}
              HELI
            </h3>
            <p className="text-micro text-secondary mt-2">
              Total HELI amount distributed in Lockdrop
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
                A large amount of HELI is distributed to anyone who deposits their HBAR on the lock
                drop page. We then merge the pre-announced amount of HELI (XXX,XXX,XXX) with the
                received HBAR to create an HBAR/HELI Liquidity Pool. ALL LP tokens that are
                generated throughout this process will be redistributed to participants and vest
                linearly over a 3 months period.
              </p>
            </div>

            <div className="col-lg-5 mt-4 mt-lg-0">
              <p className="text-small">
                This mechanism helps HeliSwap to create a large initial HBAR/HELI pool with deep
                liquidity and allows for a community driven natural price discovery process. In a
                further step your already vested LP tokens can then be used to earn additional token
                rewards by staking them into the HELI/HBAR yield farming campaign. This is only a
                suggestion and not financial advice, as already vested LP tokens can be used in any
                way you like.
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
            <LockdropForm
              getContractData={getContractData}
              countdownEnd={countdownEnd}
              lockDropData={lockDropData}
              currentState={currentState}
            />
          ) : null}
          {/* Deposit, Withdrtaw & Claim form */}
        </>
      )}

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
