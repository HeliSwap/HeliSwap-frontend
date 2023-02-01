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
} from '../utils/tokenUtils';
import { getDaysFromDurationMilliseconds, timestampToDate } from '../utils/timeUtils';
import { formatBigNumberToMilliseconds } from '../utils/numberUtils';

import getErrorMessage from '../content/errors';

// TODO: needs to be changed with the claim drop ABI
import ClaimDropABI from '../abi/LockDrop.json';

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
    totalTokensAllocated: '',
    totalTokensClaimed: '',
    availableToClaim: '',
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
    const formatBNTokenToString = (numberToFormat: ethers.BigNumber) =>
      numeral(ethers.utils.formatUnits(numberToFormat, tokenData.decimals)).format();

    setLoadingContractData(true);
    console.log('userId', userId);

    // Contract data
    const startDateBN = ethers.BigNumber.from(1673697600);
    const vestingPeriodBN = ethers.BigNumber.from(2592000); // 30 Days
    const claimPeriodBN = ethers.BigNumber.from(2592000 * 2);
    const totalTokensAllocatedBN = ethers.BigNumber.from(3_000_000_000_000_00);
    const totalTokensClaimedBN = ethers.BigNumber.from(2_000_000_000_000_00);
    const availableToClaimBN = ethers.BigNumber.from(10_000_000_00);

    // Prepare contract data
    const startTimestamp = formatBigNumberToMilliseconds(startDateBN);
    const claimdropStart = {
      date: timestampToDate(startTimestamp),
      timestamp: startTimestamp,
    };

    const vestingPeriodMilliseconds = formatBigNumberToMilliseconds(vestingPeriodBN);
    const { valueString: vestingPeriodString, valueNumeric: vestingPeriodDays } =
      getDaysFromDurationMilliseconds(vestingPeriodMilliseconds);

    const vestingPeriod = {
      valueString: vestingPeriodString,
      valueNumericDays: vestingPeriodDays,
      valueNumericMilliseconds: vestingPeriodMilliseconds,
    };

    const claimPeriodMilliseconds = formatBigNumberToMilliseconds(claimPeriodBN);
    const { valueString: claimPeriodString, valueNumeric: claimPeriodDays } =
      getDaysFromDurationMilliseconds(formatBigNumberToMilliseconds(claimPeriodBN));
    const claimPeriod = {
      valueString: claimPeriodString,
      valueNumericDays: claimPeriodDays,
      valueNumericMilliseconds: claimPeriodMilliseconds,
    };

    const totalTokensAllocated = formatBNTokenToString(totalTokensAllocatedBN);
    const totalTokensClaimed = formatBNTokenToString(totalTokensClaimedBN);
    const availableToClaim = formatBNTokenToString(availableToClaimBN);

    setClaimdropData({
      claimdropStart,
      vestingPeriod,
      claimPeriod,
      totalTokensAllocated,
      totalTokensClaimed,
      availableToClaim,
    });

    // Determine state
    const nowTimeStamp = Date.now();
    const vestingEndTimeStamp = claimdropStart.timestamp + vestingPeriod.valueNumericMilliseconds;
    const claimingEndTimeStamp = vestingEndTimeStamp + claimPeriod.valueNumericMilliseconds;

    const notStarted = nowTimeStamp < claimdropStart.timestamp;
    const vesting = nowTimeStamp >= claimdropStart.timestamp && nowTimeStamp < vestingEndTimeStamp;
    const postVesting = nowTimeStamp >= vestingEndTimeStamp && nowTimeStamp < claimingEndTimeStamp;
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

    try {
    } catch (e) {
      console.error('Error on fetching contract data:', e);
    } finally {
      setLoadingContractData(false);
    }
  }, [userId, tokenData.decimals]);

  const checkTokenAssociation = async (userId: string) => {
    const tokens = await getUserAssociatedTokens(userId);
    setUserAssociatedTokens(tokens);
  };

  // Handlers
  const handleButtonClaimClick = () => {
    setLoadingClaim(true);
    setLoadingClaim(false);
    getContractData();
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

  // Checks
  const canClaim =
    claimdropState > CLAIMDROP_STATE.NOT_STARTED && claimdropState < CLAIMDROP_STATE.ENDED;
  const haveTokensToClaim = Number(claimdropData.availableToClaim) > 0;
  const claimButtonDisabled = !haveTokensToClaim;

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
                              {claimdropData.vestingPeriod.valueString}
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
                            <p className="text-subheader text-bold">
                              {claimdropData.claimPeriod.valueString}
                            </p>
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
                              <IconToken symbol={tokenData.symbol} />
                              <p className="text-subheader text-bold ms-3">
                                {claimdropData.totalTokensClaimed}
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
                                {claimdropData.availableToClaim}
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
