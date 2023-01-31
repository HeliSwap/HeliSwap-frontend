import { useMemo, useEffect, useContext, useCallback, useState } from 'react';
import Tippy from '@tippyjs/react';
import { ethers } from 'ethers';
import numeral from 'numeral';

import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Icon from '../components/Icon';
import IconToken from '../components/IconToken';
import Loader from '../components/Loader';

import { getProvider } from '../utils/tokenUtils';

import { IClaimdropData } from '../interfaces/common';

// TODO: needs to be changed with the claim drop ABI
import ClaimDropABI from '../abi/LockDrop.json';
import { getDaysFromDurationMilliseconds, timestampToDate } from '../utils/timeUtils';
import { formatBigNumberToMilliseconds } from '../utils/numberUtils';

const ClaimDrop = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const claimDropContract = useMemo(() => {
    const provider = getProvider();
    const claimDropContractAddress = process.env.REACT_APP_CLAIMDROP_ADDRESS;
    return new ethers.Contract(claimDropContractAddress as string, ClaimDropABI, provider);
  }, []);

  const initialClaimdropData: IClaimdropData = {
    claimdropStart: {
      date: '',
      timestamp: 0,
    },
    vestingDuration: {
      valueNumericDays: 0,
      valueNumericMilliseconds: 0,
      valueString: '',
    },
    claimPeriod: '',
    totalTokensAllocated: '',
    totalTokensClaimed: '',
    availableToClaim: '',
  };

  const [loadingContractData, setLoadingContractData] = useState(true);
  const [claimdropData, setClaimdropData] = useState<IClaimdropData>(initialClaimdropData);
  const [loadingClaim, setLoadingClaim] = useState(false);

  const handleButtonClaimClick = () => {
    setLoadingClaim(true);
    setLoadingClaim(false);
    getContractData();
  };

  const getContractData = useCallback(async () => {
    setLoadingContractData(true);
    console.log('userId', userId);

    // Contract data
    const startDateBN = ethers.BigNumber.from(1673697600);
    const vestingDurationBN = ethers.BigNumber.from(2592000); // 30 Days
    const claimPeriodBN = ethers.BigNumber.from(2592000 * 2);
    const totalTokensAllocatedBN = ethers.BigNumber.from(3_000_000_000_000_00);
    const totalTokensClaimedBN = ethers.BigNumber.from(2_000_000_000_000_00);
    const availableToClaimBN = ethers.BigNumber.from(1_000_000_000_000_00);

    // Prepare contract data
    const startTimestamp = formatBigNumberToMilliseconds(startDateBN);
    const claimdropStart = {
      date: timestampToDate(startTimestamp),
      timestamp: startTimestamp,
    };

    const valueNumericMilliseconds = formatBigNumberToMilliseconds(vestingDurationBN);
    const { valueString, valueNumeric: valueNumericDays } =
      getDaysFromDurationMilliseconds(valueNumericMilliseconds);
    const vestingDuration = {
      valueString,
      valueNumericDays,
      valueNumericMilliseconds,
    };

    const claimPeriod = getDaysFromDurationMilliseconds(
      formatBigNumberToMilliseconds(claimPeriodBN),
    ).valueString;

    const totalTokensAllocated = formatBNTokenToString(totalTokensAllocatedBN);
    const totalTokensClaimed = formatBNTokenToString(totalTokensClaimedBN);
    const availableToClaim = formatBNTokenToString(availableToClaimBN);

    setClaimdropData({
      claimdropStart,
      vestingDuration,
      claimPeriod,
      totalTokensAllocated,
      totalTokensClaimed,
      availableToClaim,
    });

    try {
    } catch (e) {
      console.error('Error on fetching contract data:', e);
    } finally {
      setLoadingContractData(false);
    }
  }, [userId]);

  const formatBNTokenToString = (numberToFormat: ethers.BigNumber) =>
    numeral(ethers.utils.formatUnits(numberToFormat, 8)).format();

  const renderClaimdropStatus = () => {
    const { claimdropStart, vestingDuration } = claimdropData;
    const now = Date.now();
    const notStarted = now < claimdropStart.timestamp;
    const ended = now > claimdropStart.timestamp + vestingDuration.valueNumericMilliseconds;

    if (notStarted) return <p className="text-small text-bold text-uppercase">Not started</p>;

    if (ended) return <p className="text-small text-bold text-uppercase">Ended</p>;

    const millisecondsPast = now - claimdropStart.timestamp;
    const daysPast = Math.ceil(millisecondsPast / 1000 / 3600 / 24);

    return (
      <p className="text-small text-bold text-uppercase">
        Day {daysPast}/{vestingDuration.valueNumericDays}
      </p>
    );
  };

  useEffect(() => {
    claimDropContract && getContractData();
  }, [claimDropContract, getContractData]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        {loadingContractData ? (
          <div className="d-flex justify-content-center my-6">
            <Loader />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-lg-7 offset-lg-1">
                <h1 className="text-subheader mb-5">
                  Claim Drop - <span className="text-bold">OM Holders</span>
                </h1>
                <p className="text-main text-gray mt-5">
                  You may have received claimable token rewards from the HeliSwap Airdrop. Claiming
                  your airdrop will forfeit a portion of your balance. Your total claimable amount
                  will rise whenever someone forfeits a portion of their reward.
                </p>
              </div>

              <div className="col-lg-4"></div>
            </div>

            <div className="row mt-6">
              <div className="col-lg-7 offset-lg-1">
                <div className="container-blue-neutral-900 p-5 rounded">
                  <div className="container-border-rounded-bn-500">
                    <div className="row align-items-center">
                      <div className="col-lg-5">
                        <p className="text-small text-secondary">Start date</p>
                      </div>

                      <div className="col-lg-7 mt-2 mt-lg-0">
                        <p className="text-subheader text-bold">
                          {claimdropData.claimdropStart.date}
                        </p>
                      </div>
                    </div>

                    <div className="row align-items-center mt-4">
                      <div className="col-lg-5">
                        <p className="text-small text-secondary">Vesting Duration</p>
                      </div>

                      <div className="col-lg-7 mt-2 mt-lg-0">
                        <p className="text-subheader text-bold">
                          {claimdropData.vestingDuration.valueString}
                        </p>
                      </div>
                    </div>

                    <div className="row align-items-center mt-4">
                      <div className="col-lg-5">
                        <div className="d-flex align-items-center">
                          <p className="text-small text-secondary">Claim Period</p>
                          <Tippy content={`some text.`}>
                            <span className="ms-2">
                              <Icon name="hint" size="small" color="gray" />
                            </span>
                          </Tippy>
                        </div>
                      </div>

                      <div className="col-lg-7 mt-2 mt-lg-0">
                        <p className="text-subheader text-bold">{claimdropData.claimPeriod}</p>
                      </div>
                    </div>

                    <hr />

                    <div className="row align-items-center mt-4">
                      <div className="col-lg-5">
                        <div className="d-flex align-items-center">
                          <p className="text-small text-secondary">Total Tokens Allocated</p>
                          <Tippy content={`some text.`}>
                            <span className="ms-2">
                              <Icon name="hint" size="small" color="gray" />
                            </span>
                          </Tippy>
                        </div>
                      </div>

                      <div className="col-lg-7 mt-2 mt-lg-0">
                        <div className="d-flex align-items-center">
                          <IconToken symbol="HELI" />
                          <p className="text-subheader text-bold ms-3">
                            {claimdropData.totalTokensAllocated}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="row align-items-center mt-4">
                      <div className="col-lg-5">
                        <div className="d-flex align-items-center">
                          <p className="text-small text-secondary">Total Tokens Claimed</p>
                          <Tippy content={`some text.`}>
                            <span className="ms-2">
                              <Icon name="hint" size="small" color="gray" />
                            </span>
                          </Tippy>
                        </div>
                      </div>

                      <div className="col-lg-7 mt-2 mt-lg-0">
                        <div className="d-flex align-items-center">
                          <IconToken symbol="HELI" />
                          <p className="text-subheader text-bold ms-3">
                            {claimdropData.totalTokensClaimed}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-lg-flex justify-content-between align-items-center mt-7">
                    <div>
                      <div className="d-flex align-items-center">
                        <p className="text-small text-secondary">Available to Claim</p>
                        <Tippy content={`some text.`}>
                          <span className="ms-2">
                            <Icon name="hint" size="small" color="gray" />
                          </span>
                        </Tippy>
                      </div>

                      <div className="d-flex align-items-center mt-3">
                        <IconToken symbol="HELI" />
                        <p className="text-headline text-secondary-300 text-bold ms-3">
                          {claimdropData.availableToClaim}
                        </p>
                      </div>
                    </div>

                    <Button
                      loading={loadingClaim}
                      onClick={handleButtonClaimClick}
                      size="small"
                      className="mt-5 mt-lg-0"
                    >
                      CLAIM
                    </Button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mt-5 mt-lg-0 ">
                <div className="container-blue-neutral-900 p-5 rounded height-100 d-flex justify-content-center align-items-center">
                  <div className="container-claim-progress">{renderClaimdropStatus()}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimDrop;
