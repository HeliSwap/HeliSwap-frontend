import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import numeral from 'numeral';
import { ethers } from 'ethers';

import { GlobalContext } from '../providers/Global';

import { ILockdropData, LOCKDROP_STATE } from '../interfaces/common';

import LockdropStats from '../components/LockdropStats';
import LockdropFAQ from '../components/LockdropFAQ';
import LockdropForm from '../components/LockdropForm';
import LockdropHowItWorks from '../components/LockdropHowItWorks';
import Loader from '../components/Loader';

import { getProvider, idToAddress } from '../utils/tokenUtils';
import { calculateLPTokens, formatBigNumberToMilliseconds } from '../utils/numberUtils';

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
  const [currentState, setCurrentState] = useState(LOCKDROP_STATE.DAY_1_5);
  const [loadingContractData, setLoadingContractData] = useState(true);

  const lockDropInitialData: ILockdropData = {
    heliAmount: '0',
    hbarAmount: '0',
    lockedHbarAmount: '0',
    totalLP: '0',
    claimedOf: '0',
    endTimestamp: 0,
    vestingTimeEnd: 0,
    lastTwoDaysWithdrawals: false,
    estimatedLPTokens: '0',
  };

  const [lockDropData, setLockDropData] = useState<ILockdropData>(lockDropInitialData);

  const getContractData = useCallback(async () => {
    setLoadingContractData(true);

    const promisesArray = [
      lockDropContract.duration(),
      lockDropContract.vestingEndTime(),
      lockDropContract.totalHbars(),
      lockDropContract.totalLp(),
      lockDropContract.totalHeliTokens(),
    ];

    try {
      const [durationBN, vestingEndTimeBN, totalHbarsBN, totalLpBN, totalHeliTokensBN] =
        await Promise.all(promisesArray);

      let stakedTokensBN = ethers.BigNumber.from(0);
      let claimedOfBN = ethers.BigNumber.from(0);
      let lastTwoDaysWithdrawals = false;

      if (userId) {
        stakedTokensBN = await lockDropContract.providers(idToAddress(userId));
        claimedOfBN = await lockDropContract.claimedOf(idToAddress(userId));
        lastTwoDaysWithdrawals = await lockDropContract.lastTwoDaysWithdrawals(idToAddress(userId));
      }

      // Format data
      const heliAmount = formatBNTokenToString(totalHeliTokensBN);
      const hbarAmount = formatBNTokenToString(totalHbarsBN);
      const lockedHbarAmount = formatBNTokenToString(stakedTokensBN);
      const endTimestamp = formatBigNumberToMilliseconds(durationBN);
      const totalLP = formatBNTokenToString(totalLpBN, 18);
      const vestingTimeEnd = formatBigNumberToMilliseconds(vestingEndTimeBN);
      const claimedOf = formatBNTokenToString(claimedOfBN);
      const estimatedLPTokens = calculateLPTokens(heliAmount, lockedHbarAmount);

      // Determine state
      const nowTimeStamp = Date.now();
      const vesting = nowTimeStamp > endTimestamp && vestingTimeEnd === 0;
      const end = vestingTimeEnd !== 0 ? nowTimeStamp > vestingTimeEnd : false;

      if (vesting) {
        setCurrentState(LOCKDROP_STATE.VESTING);
      }

      if (end) {
        setCurrentState(LOCKDROP_STATE.END);
      }

      setLockDropData({
        heliAmount,
        hbarAmount,
        lockedHbarAmount,
        endTimestamp,
        totalLP,
        vestingTimeEnd,
        claimedOf,
        lastTwoDaysWithdrawals,
        estimatedLPTokens,
      });

      setCountDownEnd(endTimestamp);
    } catch (e) {
      console.error('Error on fetching contract data:', e);
    } finally {
      setLoadingContractData(false);
    }
  }, [lockDropContract, userId]);

  useEffect(() => {
    lockDropContract && getContractData();
  }, [lockDropContract, getContractData]);

  const formatBNTokenToString = (numberToFormat: ethers.BigNumber, decimals = 8) =>
    ethers.utils.formatUnits(numberToFormat, decimals);

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

          {/* Deposit, Withdrtaw & Claim form */}
          {lockDropData ? (
            <LockdropForm
              getContractData={getContractData}
              lockDropData={lockDropData}
              currentState={currentState}
            />
          ) : null}
          {/* Deposit, Withdrtaw & Claim form */}

          {/* Lockdrop stats */}
          {lockDropData ? (
            <LockdropStats
              lockDropData={lockDropData}
              currentState={currentState}
              countdownEnd={countdownEnd}
            />
          ) : null}
          {/* Lockdrop stats */}
        </>
      )}

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

      {/* <p className="mt-6 text-center">
        <a className="link-primary text-bold" href="#how-it-works">
          How it works
        </a>
      </p> */}

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
