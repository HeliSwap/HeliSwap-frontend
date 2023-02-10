import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import numeral from 'numeral';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import dayjs from 'dayjs';

import { GlobalContext } from '../providers/Global';

import useFarmAddress from '../hooks/useFarmAddress';

import { ILockdropData, LOCKDROP_STATE } from '../interfaces/common';

import LockdropStats from '../components/LockdropStats';
import LockdropFAQ from '../components/LockdropFAQ';
import LockdropForm from '../components/LockdropForm';
import LockdropHowItWorks from '../components/LockdropHowItWorks';
import Loader from '../components/Loader';
import ToasterWrapper from '../components/ToasterWrapper';

import { getProvider, idToAddress } from '../utils/tokenUtils';
import {
  calculateLPTokens,
  formatBigNumberToMilliseconds,
  formatStringWeiToStringEther,
  getUserHELIReserves,
} from '../utils/numberUtils';

import { useQueryOptionsPoolsFarms } from '../constants';

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
  const [currentState, setCurrentState] = useState(LOCKDROP_STATE.DEPOSIT);
  const [loadingContractData, setLoadingContractData] = useState(true);
  const [maxWithdrawValue, setMaxWithdrawValue] = useState<string>('0');

  const lockDropInitialData: ILockdropData = {
    lockDropDuration: 0,
    lastLockDropDay: 0,
    lockdropEnd: 0,
    lockDropDepositEnd: 0,
    vestingEndTime: 0,
    tokenAddress: '',
    lpTokenAddress: '',
    totalLP: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    totalHbars: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    totalTokens: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    lockedHbars: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    claimed: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    claimable: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    totalClaimable: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    lastUserWithdrawal: 0,
    estimatedLPTokens: {
      valueStringWei: '',
      valueStringETH: '',
    },
  };

  const [lockDropData, setLockDropData] = useState<ILockdropData>(lockDropInitialData);

  const { farmAddress } = useFarmAddress(useQueryOptionsPoolsFarms, lockDropData.lpTokenAddress);

  const getContractData = useCallback(async () => {
    setLoadingContractData(true);

    const promisesArray = [
      lockDropContract.LOCK_DROP_DURATION(),
      lockDropContract.lockDropEnd(),
      lockDropContract.lastLockDropDay(),
      lockDropContract.lockDropDepositEnd(),
      lockDropContract.vestingEndTime(),
      lockDropContract.totalLP(),
      lockDropContract.totalHbars(),
      lockDropContract.totalTokens(),
      lockDropContract.tokenAddress(),
      lockDropContract.LPToken(),
    ];

    try {
      const [
        lockDropDurationBN,
        lockDropEndBN,
        lastLockDropDayBN,
        lockDropDepositEndBN,
        vestingEndTimeBN,
        totalLPBN,
        totalHbarsBN,
        totalTokensBN,
        tokenAddress,
        lpTokenAddress,
      ] = await Promise.all(promisesArray);

      let stakedTokensBN = ethers.BigNumber.from(0);
      let claimedOfBN = ethers.BigNumber.from(0);
      let totalClaimableBN = ethers.BigNumber.from(0);
      let claimableBN = ethers.BigNumber.from(0);
      let lastUserWithdrawalBN = ethers.BigNumber.from(0);

      if (userId) {
        const userAddress = idToAddress(userId);

        const userPromisesArray = [
          lockDropContract.providers(userAddress),
          lockDropContract.claimedOf(userAddress),
          lockDropContract.lastUserWithdrawal(userAddress),
          lockDropContract.claimable(userAddress),
          lockDropContract.totalClaimable(userAddress),
        ];

        [stakedTokensBN, claimedOfBN, lastUserWithdrawalBN, claimableBN, totalClaimableBN] =
          await Promise.all(userPromisesArray);
      }

      // Format data
      const lockDropDuration = formatBigNumberToMilliseconds(lockDropDurationBN);
      const lockdropEnd = formatBigNumberToMilliseconds(lockDropEndBN);
      const lockDropDepositEnd = formatBigNumberToMilliseconds(lockDropDepositEndBN);
      const lastLockDropDay = formatBigNumberToMilliseconds(lastLockDropDayBN);
      const vestingEndTime = formatBigNumberToMilliseconds(vestingEndTimeBN);

      const totalLP = {
        valueBN: totalLPBN,
        valueStringWei: totalLPBN.toString(),
        valueStringETH: formatBNTokenToString(totalLPBN, 18),
      };

      const totalHbars = {
        valueBN: totalHbarsBN,
        valueStringWei: totalHbarsBN.toString(),
        valueStringETH: formatBNTokenToString(totalHbarsBN),
      };

      const totalTokens = {
        valueBN: totalTokensBN,
        valueStringWei: totalTokensBN.toString(),
        valueStringETH: formatBNTokenToString(totalTokensBN),
      };

      const lockedHbars = {
        valueBN: stakedTokensBN,
        valueStringWei: stakedTokensBN.toString(),
        valueStringETH: formatBNTokenToString(stakedTokensBN),
      };

      const claimed = {
        valueBN: claimedOfBN,
        valueStringWei: claimedOfBN.toString(),
        valueStringETH: formatBNTokenToString(claimedOfBN, 18),
      };

      const claimable = {
        valueBN: claimableBN,
        valueStringWei: claimableBN.toString(),
        valueStringETH: formatBNTokenToString(claimableBN, 18),
      };

      const totalClaimable = {
        valueBN: totalClaimableBN,
        valueStringWei: totalClaimableBN.toString(),
        valueStringETH: formatBNTokenToString(totalClaimableBN, 18),
      };

      const lastUserWithdrawal = formatBigNumberToMilliseconds(lastUserWithdrawalBN);

      const myHELIFormatted = getUserHELIReserves(
        totalTokens.valueBN,
        lockedHbars.valueBN,
        totalHbars.valueBN,
      );

      const estimatedLPTokensBN = calculateLPTokens(
        myHELIFormatted,
        lockedHbars.valueStringETH,
        8,
        8,
      );
      const estimatedLPTokens = {
        valueStringWei: estimatedLPTokensBN.toString(),
        valueStringETH: formatStringWeiToStringEther(estimatedLPTokensBN),
      };

      // Determine state
      const nowTimeStamp = Date.now();
      const withdrawOnly = nowTimeStamp > lockDropDepositEnd && nowTimeStamp <= lockdropEnd;
      const preVesting = nowTimeStamp > lockdropEnd && vestingEndTime === 0;
      const vesting = nowTimeStamp > lockdropEnd && vestingEndTime !== 0;
      const end = vestingEndTime !== 0 ? nowTimeStamp > vestingEndTime : false;

      if (withdrawOnly) {
        setCurrentState(LOCKDROP_STATE.WITHDRAW);
      }

      if (preVesting) {
        setCurrentState(LOCKDROP_STATE.PRE_VESTING);
      }

      if (vesting) {
        setCurrentState(LOCKDROP_STATE.VESTING);
      }

      if (end) {
        setCurrentState(LOCKDROP_STATE.END);
      }

      setLockDropData({
        lockDropDuration,
        lockdropEnd,
        lastLockDropDay,
        lockDropDepositEnd,
        vestingEndTime,
        totalLP,
        totalHbars,
        totalTokens,
        lockedHbars,
        claimed,
        claimable,
        totalClaimable,
        lastUserWithdrawal,
        tokenAddress,
        estimatedLPTokens,
        lpTokenAddress,
      });

      setCountDownEnd(vesting ? vestingEndTime : lockdropEnd);
    } catch (e) {
      console.error('Error on fetching contract data:', e);
    } finally {
      setLoadingContractData(false);
    }
  }, [lockDropContract, userId]);

  const getMaxWithdrawAmount = useCallback(() => {
    const { lockdropEnd, lockedHbars } = lockDropData;

    let maxWithdrawValue = '0';

    const timeLockDropEnd = dayjs(lockdropEnd);
    const timeLockDropStart = dayjs(lockdropEnd).subtract(7, 'days');
    const timeNow = dayjs();

    const timeMinusTwoDays = dayjs(lockdropEnd).subtract(2, 'days');
    const timeMinusOneDay = dayjs(lockdropEnd).subtract(1, 'days');

    const zeroBN = ethers.BigNumber.from('0');
    const twoBN = ethers.BigNumber.from('2');

    if (
      lockedHbars.valueBN.gt(zeroBN) &&
      (timeNow.isAfter(timeLockDropStart) || timeNow.isBefore(timeLockDropEnd))
    ) {
      if (timeNow.isBefore(timeMinusTwoDays)) {
        maxWithdrawValue = lockedHbars.valueStringETH;
      } else if (timeNow.isAfter(timeMinusTwoDays) && timeNow.isBefore(timeMinusOneDay)) {
        maxWithdrawValue = ethers.utils.formatUnits(lockedHbars.valueBN.div(twoBN), 8);
      } else if (timeNow.isAfter(timeMinusTwoDays) && timeNow.isBefore(timeLockDropEnd)) {
        //Show the amount in future moment, so the user is able to execute the transaction and withraw the amount shown
        const timeNowDelayed = timeNow.add(30, 'seconds');

        const maxAvailableToWithdraw = lockedHbars.valueBN.div(twoBN);
        const timeFromStartOfDay = timeNowDelayed.valueOf() - timeMinusOneDay.valueOf();
        const timeToLockdropEnd = timeLockDropEnd.valueOf() - timeMinusOneDay.valueOf();

        const timeRatio = ethers.BigNumber.from(timeFromStartOfDay.toString())
          .mul(ethers.BigNumber.from(ethers.constants.WeiPerEther))
          .div(ethers.BigNumber.from(timeToLockdropEnd.toString()));

        const maxWithdrawValueBN = maxAvailableToWithdraw.sub(
          maxAvailableToWithdraw
            .mul(timeRatio)
            .div(ethers.BigNumber.from(ethers.constants.WeiPerEther))
            .toString(),
        );

        maxWithdrawValue = maxWithdrawValueBN.lte(zeroBN)
          ? '0'
          : ethers.utils.formatUnits(maxWithdrawValueBN, 8);
      }
    }
    setMaxWithdrawValue(maxWithdrawValue);
  }, [lockDropData]);

  console.log('maxWithdrawValue', maxWithdrawValue);

  useEffect(() => {
    lockDropContract && getContractData();
  }, [lockDropContract, getContractData]);

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      getMaxWithdrawAmount();
    }, 5000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, [getMaxWithdrawAmount]);

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
                {numeral(lockDropData.totalTokens.valueStringETH).format('0,0.00')}
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
              toast={toast}
              getContractData={getContractData}
              lockDropData={lockDropData}
              currentState={currentState}
              farmAddress={farmAddress}
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
      <ToasterWrapper />
    </div>
  );
};

export default Lockdrop;
