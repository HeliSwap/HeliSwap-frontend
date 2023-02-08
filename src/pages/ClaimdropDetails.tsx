import { useMemo, useEffect, useContext, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

import Tippy from '@tippyjs/react';
import numeral from 'numeral';
import { ethers } from 'ethers';

import { GlobalContext } from '../providers/Global';

import { IClaimdropData } from '../interfaces/common';
import { ITokenData } from '../interfaces/tokens';

import Button from '../components/Button';
import Icon from '../components/Icon';
import IconToken from '../components/IconToken';
import Loader from '../components/Loader';
import ToasterWrapper from '../components/ToasterWrapper';

import {
  addressToId,
  getHTSTokenInfo,
  getProvider,
  getUserAssociatedTokens,
  idToAddress,
} from '../utils/tokenUtils';
import { getDaysFromDurationMilliseconds, timestampToDate } from '../utils/timeUtils';
import { formatBigNumberToMilliseconds } from '../utils/numberUtils';

import getErrorMessage from '../content/errors';

import ClaimDropABI from '../abi/ClaimDrop.json';

enum CLAIMDROP_STATE {
  NOT_STARTED,
  VESTING,
  POST_VESTING,
  ENDED,
}

const ClaimdropDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance, setShowConnectModal, isHashpackLoading } =
    connection;

  const { token } = useParams();
  const navigate = useNavigate();

  const claimDropContractAddress = process.env.REACT_APP_CLAIMDROP_ADDRESS;

  const claimDropContract = useMemo(() => {
    const provider = getProvider();

    return new ethers.Contract(claimDropContractAddress as string, ClaimDropABI, provider);
  }, [claimDropContractAddress]);

  const initialClaimdropData: IClaimdropData = {
    claimdropStart: {
      date: '',
      timestamp: 0,
    },
    claimdropEnd: {
      date: '',
      timestamp: 0,
    },
    vestingPeriod: {
      valueNumericDays: 0,
      valueNumericMilliseconds: 0,
      valueString: '',
    },
    claimPeriod: {
      valueNumericDays: 0,
      valueNumericMilliseconds: 0,
      valueString: '',
    },
    totalAllocated: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    claimedOf: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    vestedTokensOf: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    claimable: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    extraTokensOf: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
    totalAllocatedOf: {
      valueBN: ethers.BigNumber.from(0),
      valueStringWei: '',
      valueStringETH: '',
    },
  };

  const [tokenData, setTokenData] = useState({} as ITokenData);
  const [tokenError, setTokenError] = useState(false);
  const [loadingTokenData, setLoadingTokenData] = useState(true);
  const [loadingContractData, setLoadingContractData] = useState(true);
  const [claimdropData, setClaimdropData] = useState<IClaimdropData>(initialClaimdropData);
  const [claimdropState, setClaimdropState] = useState(CLAIMDROP_STATE.NOT_STARTED);
  const [loadingClaim, setLoadingClaim] = useState(false);
  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [loadingAssociate, setLoadingAssociate] = useState(false);

  const getContractData = useCallback(async () => {
    const formatBNTokenToString = (numberToFormat: ethers.BigNumber, decimals = 8) =>
      ethers.utils.formatUnits(numberToFormat, decimals);

    setLoadingContractData(true);

    try {
      const promisesArray = [
        claimDropContract.start(),
        claimDropContract.end(),
        // claimDropContract.cliffEnd(),
        claimDropContract.claimExtraTime(),
        claimDropContract.totalAllocated(),
      ];

      const [
        startBN,
        endBN,
        // cliffEndBN,
        claimExtraTimeBN,
        totalAllocatedBN,
      ] = await Promise.all(promisesArray);

      let claimedOfBN = ethers.BigNumber.from(0);
      let vestedTokensOfBN = ethers.BigNumber.from(0);
      let claimableBN = ethers.BigNumber.from(0);
      let extraTokensOfBN = ethers.BigNumber.from(0);
      let totalAllocatedOfBN = ethers.BigNumber.from(0);

      if (userId) {
        const userAddress = idToAddress(userId);

        const userPromisesArray = [
          claimDropContract.claimedOf(userAddress),
          claimDropContract.vestedTokensOf(userAddress),
          claimDropContract.claimable(userAddress),
          claimDropContract.extraTokensOf(userAddress),
          claimDropContract.totalAllocatedOf(userAddress),
        ];

        [claimedOfBN, vestedTokensOfBN, claimableBN, extraTokensOfBN, totalAllocatedOfBN] =
          await Promise.all(userPromisesArray);
      }

      // Prepare contract data
      const startTimestamp = formatBigNumberToMilliseconds(startBN);
      const claimdropStart = {
        date: timestampToDate(startTimestamp),
        timestamp: startTimestamp,
      };

      const endTimestamp = formatBigNumberToMilliseconds(endBN);
      const claimdropEnd = {
        date: timestampToDate(endTimestamp),
        timestamp: endTimestamp,
      };

      const vestingPeriodMilliseconds = endTimestamp - startTimestamp;
      const { valueString: vestingPeriodString, valueNumeric: vestingPeriodDays } =
        getDaysFromDurationMilliseconds(vestingPeriodMilliseconds);

      const vestingPeriod = {
        valueString: vestingPeriodString,
        valueNumericDays: vestingPeriodDays,
        valueNumericMilliseconds: vestingPeriodMilliseconds,
      };

      const claimPeriodMilliseconds = formatBigNumberToMilliseconds(claimExtraTimeBN);
      const { valueString: claimPeriodString, valueNumeric: claimPeriodDays } =
        getDaysFromDurationMilliseconds(formatBigNumberToMilliseconds(claimExtraTimeBN));
      const claimPeriod = {
        valueString: claimPeriodString,
        valueNumericDays: claimPeriodDays,
        valueNumericMilliseconds: claimPeriodMilliseconds,
      };

      // Format token data
      const totalAllocated = {
        valueBN: totalAllocatedBN,
        valueStringWei: totalAllocatedBN.toString(),
        valueStringETH: formatBNTokenToString(totalAllocatedBN, tokenData.decimals),
      };

      const claimedOf = {
        valueBN: claimedOfBN,
        valueStringWei: claimedOfBN.toString(),
        valueStringETH: formatBNTokenToString(claimedOfBN, tokenData.decimals),
      };

      const vestedTokensOf = {
        valueBN: vestedTokensOfBN,
        valueStringWei: vestedTokensOfBN.toString(),
        valueStringETH: formatBNTokenToString(vestedTokensOfBN, tokenData.decimals),
      };

      const claimable = {
        valueBN: claimableBN,
        valueStringWei: claimableBN.toString(),
        valueStringETH: formatBNTokenToString(claimableBN, tokenData.decimals),
      };

      const extraTokensOf = {
        valueBN: extraTokensOfBN,
        valueStringWei: extraTokensOfBN.toString(),
        valueStringETH: formatBNTokenToString(extraTokensOfBN, tokenData.decimals),
      };

      const totalAllocatedOf = {
        valueBN: totalAllocatedOfBN,
        valueStringWei: totalAllocatedOfBN.toString(),
        valueStringETH: formatBNTokenToString(totalAllocatedOfBN, tokenData.decimals),
      };

      setClaimdropData({
        claimdropStart,
        claimdropEnd,
        vestingPeriod,
        claimPeriod,
        totalAllocated,
        claimedOf,
        vestedTokensOf,
        claimable,
        extraTokensOf,
        totalAllocatedOf,
      });

      // Determine state
      const nowTimeStamp = Date.now();
      const vestingEndTimeStamp = claimdropStart.timestamp + vestingPeriod.valueNumericMilliseconds;
      const claimingEndTimeStamp = vestingEndTimeStamp + claimPeriod.valueNumericMilliseconds;

      const notStarted = nowTimeStamp < claimdropStart.timestamp;
      const vesting =
        nowTimeStamp >= claimdropStart.timestamp && nowTimeStamp < vestingEndTimeStamp;
      const postVesting =
        nowTimeStamp >= vestingEndTimeStamp && nowTimeStamp < claimingEndTimeStamp;
      const ended = nowTimeStamp > claimingEndTimeStamp;

      if (notStarted) {
        setClaimdropState(CLAIMDROP_STATE.NOT_STARTED);
      }

      if (vesting) {
        setClaimdropState(CLAIMDROP_STATE.VESTING);
      }

      if (postVesting) {
        setClaimdropState(CLAIMDROP_STATE.POST_VESTING);
      }

      if (ended) {
        setClaimdropState(CLAIMDROP_STATE.ENDED);
      }
    } catch (e) {
      console.error('Error on fetching contract data:', e);
    } finally {
      setLoadingContractData(false);
    }
  }, [userId, tokenData.decimals, claimDropContract]);

  const checkTokenAssociation = async (userId: string) => {
    const tokens = await getUserAssociatedTokens(userId);
    setUserAssociatedTokens(tokens);
  };

  // Handlers
  const handleButtonClaimClick = async () => {
    setLoadingClaim(true);

    try {
      const receipt = await sdk.claimLP(
        hashconnectConnectorInstance,
        claimDropContractAddress as string,
        userId,
      );

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens were claimed.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }

      await getContractData();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingClaim(false);
    }
  };

  const handleBackClick = () => {
    navigate('/claimdrop');
  };

  const handleAssociateClick = async () => {
    setLoadingAssociate(true);

    try {
      const receipt = await sdk.associateToken(
        hashconnectConnectorInstance,
        userId,
        addressToId(tokenData.address),
      );

      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }

      await checkTokenAssociation(userId);
    } catch (err) {
      console.error(err);
      toast('Error on associate');
    } finally {
      setLoadingAssociate(false);
    }
  };

  // Get token info
  useEffect(() => {
    const getTokenData = async () => {
      try {
        const result = await getHTSTokenInfo(addressToId(token as string));
        if (Object.keys(result).length > 0) {
          setTokenData(result);
        } else {
          setTokenError(true);
        }
      } catch (e) {
        console.log('e', e);
        setTokenError(true);
      } finally {
        setLoadingTokenData(false);
      }
    };

    token && getTokenData();
  }, [token]);

  // Get contract data
  useEffect(() => {
    claimDropContract && getContractData();
  }, [claimDropContract, getContractData]);

  // Check for associations
  useEffect(() => {
    userId && checkTokenAssociation(userId);
  }, [userId]);

  // Helpers
  const getTokenIsAssociated = () => userAssociatedTokens?.includes(addressToId(tokenData.address));

  // Renders
  const renderClaimdropStatus = () => {
    const { claimdropStart, vestingPeriod } = claimdropData;

    if (claimdropState === CLAIMDROP_STATE.NOT_STARTED)
      return <p className="text-small text-bold text-uppercase">Not started</p>;

    if (claimdropState === CLAIMDROP_STATE.ENDED)
      return <p className="text-small text-bold text-uppercase">Ended</p>;

    const millisecondsPast = Date.now() - claimdropStart.timestamp;
    const daysPast = Math.ceil(millisecondsPast / 1000 / 3600 / 24);

    return (
      <p className="text-small text-bold text-uppercase">
        Day {daysPast}/{vestingPeriod.valueNumericDays}
      </p>
    );
  };

  const { claimdropStart, vestingPeriod, claimPeriod, totalAllocatedOf, claimedOf, claimable } =
    claimdropData;

  // Checks
  const canClaim =
    claimdropState > CLAIMDROP_STATE.NOT_STARTED && claimdropState < CLAIMDROP_STATE.ENDED;
  const haveTokensToClaim = Number(claimable.valueBN.toString()) > 0;
  const claimButtonDisabled = !haveTokensToClaim;

  console.log(claimdropData);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        {!tokenError ? (
          loadingContractData || loadingTokenData ? (
            <div className="d-flex justify-content-center my-6">
              <Loader />
            </div>
          ) : (
            <>
              <div className="row">
                <div className="col-lg-7 offset-lg-1">
                  <div className="d-flex align-items-center mb-5">
                    <span className="cursor-pointer me-3" onClick={handleBackClick}>
                      <Icon name="arrow-left" />
                    </span>
                    <h1 className="text-subheader">
                      Claim Drop - <span className="text-bold">{tokenData.symbol} Holders</span>
                    </h1>
                  </div>

                  <p className="text-main text-gray mt-5">
                    You may have received claimable token rewards from the HeliSwap Airdrop.
                    Claiming your airdrop will forfeit a portion of your balance. Your total
                    claimable amount will rise whenever someone forfeits a portion of their reward.
                  </p>
                </div>

                <div className="col-lg-4"></div>
              </div>

              {userId && !isHashpackLoading ? (
                <div className="row mt-6">
                  <div className="col-lg-7 offset-lg-1">
                    <div className="container-blue-neutral-900 p-5 rounded">
                      <div className="container-border-rounded-bn-500">
                        <div className="row align-items-center">
                          <div className="col-lg-5">
                            <p className="text-small text-secondary">Start date</p>
                          </div>

                          <div className="col-lg-7 mt-2 mt-lg-0">
                            <p className="text-subheader text-bold">{claimdropStart.date}</p>
                          </div>
                        </div>

                        <div className="row align-items-center mt-4">
                          <div className="col-lg-5">
                            <p className="text-small text-secondary">Vesting Duration</p>
                          </div>

                          <div className="col-lg-7 mt-2 mt-lg-0">
                            <p className="text-subheader text-bold">{vestingPeriod.valueString}</p>
                          </div>
                        </div>

                        <div className="row align-items-center mt-4">
                          <div className="col-lg-5">
                            <div className="d-flex align-items-center">
                              <p className="text-small text-secondary">Extra Claim Period</p>
                              <Tippy content={`some text.`}>
                                <span className="ms-2">
                                  <Icon name="hint" size="small" color="gray" />
                                </span>
                              </Tippy>
                            </div>
                          </div>

                          <div className="col-lg-7 mt-2 mt-lg-0">
                            <p className="text-subheader text-bold">{claimPeriod.valueString}</p>
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
                              <IconToken symbol={tokenData.symbol} />
                              <p className="text-subheader text-bold ms-3">
                                {numeral(totalAllocatedOf.valueStringETH).format('0,0.00')}
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
                              <IconToken symbol={tokenData.symbol} />
                              <p className="text-subheader text-bold ms-3">
                                {numeral(claimedOf.valueStringETH).format('0,0.00')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {canClaim ? (
                        <div className="d-lg-flex justify-content-between align-items-end mt-7">
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
                              <IconToken symbol={tokenData.symbol} />
                              <p className="text-headline text-secondary-300 text-bold ms-3">
                                {claimable.valueStringETH}
                              </p>
                            </div>
                          </div>

                          {}

                          {getTokenIsAssociated() ? (
                            <Button
                              disabled={claimButtonDisabled}
                              loading={loadingClaim}
                              onClick={handleButtonClaimClick}
                              size="small"
                              className="mt-5 mt-lg-0"
                            >
                              CLAIM
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              className="mt-5 mt-lg-0"
                              loading={loadingAssociate}
                              onClick={handleAssociateClick}
                            >
                              {`Associate ${tokenData.symbol}`}
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="col-lg-4 mt-5 mt-lg-0 ">
                    <div className="container-blue-neutral-900 p-5 rounded height-100 d-flex justify-content-center align-items-center">
                      <div className="container-claim-progress">{renderClaimdropStatus()}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row mt-5">
                  <div className="col-lg-3 offset-lg-3">
                    <div className="d-grid mt-4">
                      <Button
                        disabled={isHashpackLoading}
                        onClick={() => setShowConnectModal(true)}
                      >
                        Connect wallet
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          <div className="d-flex justify-content-center my-6">
            <div className="alert alert-danger d-inline-flex align-items-center mt-5" role="alert">
              <Icon className="me-3 alert-icon" name="warning" color="danger" />
              <p className="alert-message">Something went wrong! Cannot get token...</p>
            </div>
          </div>
        )}
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default ClaimdropDetails;
