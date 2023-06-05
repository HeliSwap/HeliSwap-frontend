import { useMemo, useEffect, useContext, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

import Tippy from '@tippyjs/react';
import numeral from 'numeral';
import { ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { GlobalContext } from '../providers/Global';

import { IClaimdropData, IClaimdropDataRaw } from '../interfaces/common';
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
// import { getDaysFromDurationMilliseconds, timestampToDate } from '../utils/timeUtils';
import {
  // formatBigNumberToMilliseconds,
  formatStringETHtoPriceFormatted,
} from '../utils/numberUtils';

import getErrorMessage from '../content/errors';

import ClaimDropABI from '../abi/ClaimDrop.json';

import claimdropsTestnet from '../claimdrops/testnet';
import claimdropsMainet from '../claimdrops/mainnet';
import { GET_CLAIMDROP_DATA } from '../GraphQL/Queries';

enum CLAIMDROP_STATE {
  NOT_STARTED,
  VESTING,
  POST_VESTING,
  ENDED,
}

const ClaimdropDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, connectorInstance, setShowConnectModal, isHashpackLoading } = connection;

  const { campaign } = useParams();
  const navigate = useNavigate();

  const claimdrops: { [key: string]: any } = {
    testnet: claimdropsTestnet,
    mainnet: claimdropsMainet,
  };

  const networkType = process.env.REACT_APP_NETWORK_TYPE as string;
  const claimdropsByNetwork = claimdrops[networkType];

  const foundLockdropData: IClaimdropData = useMemo(
    () =>
      claimdropsByNetwork.find((item: any) => item.claimdropAddress === campaign) ||
      ({} as IClaimdropData),
    [campaign, claimdropsByNetwork],
  );

  let claimDropContractAddress = '';
  let claimDropTokenAddress = '';

  const foundCampaign = claimdropsByNetwork.find((item: any) => item.claimdropAddress === campaign);
  if (foundCampaign) {
    claimDropContractAddress = foundCampaign.claimdropAddress;
    claimDropTokenAddress = foundCampaign.token;
  }

  const claimDropContract = useMemo(() => {
    const provider = getProvider();

    return new ethers.Contract(claimDropContractAddress, ClaimDropABI, provider);
  }, [claimDropContractAddress]);

  const defaultBNValue = {
    valueBN: ethers.BigNumber.from('0'),
    valueStringWei: '0',
    valueStringETH: '0.0',
  };

  const initialClaimdropData: IClaimdropData = {
    claimdropStart: {
      date: '',
      timestamp: 0,
    },
    claimdropEnd: {
      date: '',
      timestamp: 0,
    },
    expiryEnd: {
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
    totalAllocated: defaultBNValue,
    claimedOf: defaultBNValue,
    vestedTokensOf: defaultBNValue,
    claimable: defaultBNValue,
    extraTokensOf: defaultBNValue,
    totalAllocatedOf: defaultBNValue,
  };

  const [tokenData, setTokenData] = useState({} as ITokenData);
  const [campaignError, setCampaignError] = useState(false);
  const [loadingTokenData, setLoadingTokenData] = useState(true);
  const [contractDataError, setContractDataError] = useState(false);
  const [loadingContractData, setLoadingContractData] = useState(true);
  const [claimdropData, setClaimdropData] = useState<IClaimdropData>(initialClaimdropData);
  const [claimdropState, setClaimdropState] = useState(CLAIMDROP_STATE.NOT_STARTED);
  const [loadingClaim, setLoadingClaim] = useState(false);
  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [loadingAssociate, setLoadingAssociate] = useState(false);

  // const getContractData = useCallback(async () => {
  //   const formatBNTokenToString = (numberToFormat: ethers.BigNumber, decimals = 8) =>
  //     ethers.utils.formatUnits(numberToFormat, decimals);

  //   setLoadingContractData(true);

  //   try {
  //     const promisesArray = [
  //       claimDropContract.start(),
  //       claimDropContract.end(),
  //       claimDropContract.claimExtraTime(),
  //       claimDropContract.totalAllocated(),
  //     ];

  //     const [startBN, endBN, claimExtraTimeBN, totalAllocatedBN] = await Promise.all(promisesArray);

  //     let claimedOfBN = ethers.BigNumber.from(0);
  //     let vestedTokensOfBN = ethers.BigNumber.from(0);
  //     let claimableBN = ethers.BigNumber.from(0);
  //     let extraTokensOfBN = ethers.BigNumber.from(0);
  //     let totalAllocatedOfBN = ethers.BigNumber.from(0);

  //     if (userId) {
  //       const userAddress = idToAddress(userId);

  //       const userPromisesArray = [
  //         claimDropContract.claimedOf(userAddress),
  //         claimDropContract.vestedTokensOf(userAddress),
  //         claimDropContract.claimable(userAddress),
  //         claimDropContract.extraTokensOf(userAddress),
  //         claimDropContract.totalAllocatedOf(userAddress),
  //       ];

  //       [claimedOfBN, vestedTokensOfBN, claimableBN, extraTokensOfBN, totalAllocatedOfBN] =
  //         await Promise.all(userPromisesArray);
  //     }

  //     // Prepare contract data
  //     const startTimestamp = formatBigNumberToMilliseconds(startBN);
  //     const claimdropStart = {
  //       date: timestampToDate(startTimestamp),
  //       timestamp: startTimestamp,
  //     };

  //     const endTimestamp = formatBigNumberToMilliseconds(endBN);
  //     const claimdropEnd = {
  //       date: timestampToDate(endTimestamp),
  //       timestamp: endTimestamp,
  //     };

  //     const vestingPeriodMilliseconds = endTimestamp - startTimestamp;
  //     const { valueString: vestingPeriodString, valueNumeric: vestingPeriodDays } =
  //       getDaysFromDurationMilliseconds(vestingPeriodMilliseconds);

  //     const vestingPeriod = {
  //       valueString: vestingPeriodString,
  //       valueNumericDays: vestingPeriodDays,
  //       valueNumericMilliseconds: vestingPeriodMilliseconds,
  //     };

  //     const claimPeriodMilliseconds = formatBigNumberToMilliseconds(claimExtraTimeBN);
  //     const { valueString: claimPeriodString, valueNumeric: claimPeriodDays } =
  //       getDaysFromDurationMilliseconds(formatBigNumberToMilliseconds(claimExtraTimeBN));
  //     const claimPeriod = {
  //       valueString: claimPeriodString,
  //       valueNumericDays: claimPeriodDays,
  //       valueNumericMilliseconds: claimPeriodMilliseconds,
  //     };

  //     const expiryTimestamp = endTimestamp + claimPeriodMilliseconds;
  //     const expiryEnd = {
  //       date: timestampToDate(expiryTimestamp),
  //       timestamp: expiryTimestamp,
  //     };

  //     // Format token data
  //     const totalAllocated = {
  //       valueBN: totalAllocatedBN,
  //       valueStringWei: totalAllocatedBN.toString(),
  //       valueStringETH: formatBNTokenToString(totalAllocatedBN, tokenData.decimals),
  //     };

  //     const claimedOf = {
  //       valueBN: claimedOfBN,
  //       valueStringWei: claimedOfBN.toString(),
  //       valueStringETH: formatBNTokenToString(claimedOfBN, tokenData.decimals),
  //     };

  //     const vestedTokensOf = {
  //       valueBN: vestedTokensOfBN,
  //       valueStringWei: vestedTokensOfBN.toString(),
  //       valueStringETH: formatBNTokenToString(vestedTokensOfBN, tokenData.decimals),
  //     };

  //     const claimable = {
  //       valueBN: claimableBN,
  //       valueStringWei: claimableBN.toString(),
  //       valueStringETH: formatBNTokenToString(claimableBN, tokenData.decimals),
  //     };

  //     const extraTokensOf = {
  //       valueBN: extraTokensOfBN,
  //       valueStringWei: extraTokensOfBN.toString(),
  //       valueStringETH: formatBNTokenToString(extraTokensOfBN, tokenData.decimals),
  //     };

  //     const totalAllocatedOf = {
  //       valueBN: totalAllocatedOfBN,
  //       valueStringWei: totalAllocatedOfBN.toString(),
  //       valueStringETH: formatBNTokenToString(totalAllocatedOfBN, tokenData.decimals),
  //     };

  //     setClaimdropData({
  //       claimdropStart,
  //       claimdropEnd,
  //       expiryEnd,
  //       vestingPeriod,
  //       claimPeriod,
  //       totalAllocated,
  //       claimedOf,
  //       vestedTokensOf,
  //       claimable,
  //       extraTokensOf,
  //       totalAllocatedOf,
  //     });

  //     // Determine state
  //     const nowTimeStamp = Date.now();
  //     const vestingEndTimeStamp = claimdropStart.timestamp + vestingPeriod.valueNumericMilliseconds;
  //     const claimingEndTimeStamp = vestingEndTimeStamp + claimPeriod.valueNumericMilliseconds;

  //     const notStarted = nowTimeStamp < claimdropStart.timestamp;
  //     const vesting =
  //       nowTimeStamp >= claimdropStart.timestamp && nowTimeStamp < vestingEndTimeStamp;
  //     const postVesting =
  //       nowTimeStamp >= vestingEndTimeStamp && nowTimeStamp < claimingEndTimeStamp;
  //     const ended = nowTimeStamp > claimingEndTimeStamp;

  //     if (notStarted) {
  //       setClaimdropState(CLAIMDROP_STATE.NOT_STARTED);
  //     }

  //     if (vesting) {
  //       setClaimdropState(CLAIMDROP_STATE.VESTING);
  //     }

  //     if (postVesting) {
  //       setClaimdropState(CLAIMDROP_STATE.POST_VESTING);
  //     }

  //     if (ended) {
  //       setClaimdropState(CLAIMDROP_STATE.ENDED);
  //     }
  //   } catch (e) {
  //     console.error('Error on fetching contract data:', e);
  //     setContractDataError(true);
  //   } finally {
  //     setLoadingContractData(false);
  //   }
  // }, [userId, tokenData.decimals, claimDropContract]);

  const getContractDataFound = useCallback(async () => {
    const formatBNTokenToString = (numberToFormat: ethers.BigNumber, decimals = 8) =>
      ethers.utils.formatUnits(numberToFormat, decimals);

    setLoadingContractData(true);

    try {
      let claimedOfBN = ethers.BigNumber.from(0);
      let claimableBN = ethers.BigNumber.from(0);
      let totalAllocatedOfBN = ethers.BigNumber.from(0);

      if (userId) {
        const userAddress = idToAddress(userId);

        const heliSwapAPIUrl = process.env.REACT_APP_DROP_POLLER_URI as string;
        const variables = {
          address: userAddress,
          claimDropAddress: claimDropContractAddress,
        };

        const client = new GraphQLClient(heliSwapAPIUrl);
        const response = await client.request<IClaimdropDataRaw>(GET_CLAIMDROP_DATA, variables);

        const {
          getClaimDropUserInfo: { claimable, claimed, totalAllocated },
        } = response;

        if (claimable && claimed && totalAllocated) {
          claimableBN = ethers.BigNumber.from(claimable);
          claimedOfBN = ethers.BigNumber.from(claimed);
          totalAllocatedOfBN = ethers.BigNumber.from(totalAllocated);
        }
      }

      const claimedOf = {
        valueBN: claimedOfBN,
        valueStringWei: claimedOfBN.toString(),
        valueStringETH: formatBNTokenToString(claimedOfBN, tokenData.decimals),
      };

      const claimable = {
        valueBN: claimableBN,
        valueStringWei: claimableBN.toString(),
        valueStringETH: formatBNTokenToString(claimableBN, tokenData.decimals),
      };

      const totalAllocatedOf = {
        valueBN: totalAllocatedOfBN,
        valueStringWei: totalAllocatedOfBN.toString(),
        valueStringETH: formatBNTokenToString(totalAllocatedOfBN, tokenData.decimals),
      };

      setClaimdropData({
        ...foundLockdropData,
        claimedOf,
        claimable,
        totalAllocatedOf,
      });

      // Determine state
      const nowTimeStamp = Date.now();
      const vestingEndTimeStamp =
        foundLockdropData.claimdropStart.timestamp +
        foundLockdropData.vestingPeriod.valueNumericMilliseconds;
      const claimingEndTimeStamp =
        vestingEndTimeStamp + foundLockdropData.claimPeriod.valueNumericMilliseconds;

      const notStarted = nowTimeStamp < foundLockdropData.claimdropStart.timestamp;
      const vesting =
        nowTimeStamp >= foundLockdropData.claimdropStart.timestamp &&
        nowTimeStamp < vestingEndTimeStamp;
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
      setContractDataError(true);
    } finally {
      setLoadingContractData(false);
    }
  }, [userId, tokenData.decimals, foundLockdropData, claimDropContractAddress]);

  const checkTokenAssociation = async (userId: string) => {
    const tokens = await getUserAssociatedTokens(userId);
    setUserAssociatedTokens(tokens);
  };

  // Handlers
  const handleButtonClaimClick = async () => {
    setLoadingClaim(true);

    try {
      const receipt = await sdk.claimLP(
        connectorInstance,
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

      await getContractDataFound();
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
        connectorInstance,
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

  useEffect(() => {
    if (claimDropTokenAddress === '' || claimDropContractAddress === '') {
      setLoadingContractData(true);
      setCampaignError(true);
    }
  }, [claimDropTokenAddress, claimDropContractAddress]);

  useEffect(() => {
    const getTokenData = async () => {
      try {
        const result = await getHTSTokenInfo(addressToId(claimDropTokenAddress as string));
        if (Object.keys(result).length > 0) {
          setTokenData(result);
        } else {
          setCampaignError(true);
        }
      } catch (e) {
        console.log('e', e);
        setCampaignError(true);
      } finally {
        setLoadingTokenData(false);
      }
    };

    claimDropTokenAddress !== '' && getTokenData();
  }, [claimDropTokenAddress]);

  // Get contract data
  useEffect(() => {
    claimDropTokenAddress !== '' && claimDropContract && getContractDataFound();
  }, [claimDropTokenAddress, claimDropContract, getContractDataFound]);

  // Check for associations
  useEffect(() => {
    userId && checkTokenAssociation(userId);
  }, [userId]);

  // Helpers
  const getTokenIsAssociated = () => userAssociatedTokens?.includes(addressToId(tokenData.address));

  const getClaimedPercentage = () => {
    return Number(claimedOf.valueStringETH) > 0
      ? (
          (Number(claimedOf.valueStringETH) / Number(totalAllocatedOf.valueStringETH)) *
          100
        ).toFixed(2)
      : '0';
  };

  // Renders
  const renderClaimdropStatus = () => {
    const { claimdropStart, vestingPeriod } = claimdropData;

    if (claimdropState === CLAIMDROP_STATE.NOT_STARTED)
      return <p className="text-small text-bold text-uppercase">Not started</p>;

    if (claimdropState === CLAIMDROP_STATE.ENDED)
      return <p className="text-small text-bold text-uppercase">Ended</p>;

    const millisecondsPast = Date.now() - claimdropStart.timestamp;

    const totalMillisecondsPeriod = vestingPeriod.valueNumericMilliseconds;
    const percentagePast = (millisecondsPast / totalMillisecondsPeriod) * 100;

    return (
      <>
        <p className="text-secondary text-uppercase text-main">Vested Tokens (in%)</p>
        <p className="text-title text-bold text-uppercase">
          {percentagePast >= 100 ? 100 : percentagePast.toFixed(2)}%
        </p>
        <div className="progress mt-3">
          <div
            className="progress-bar bg-claimdrop"
            role="progressbar"
            aria-label="Success example"
            style={{ width: `${percentagePast.toFixed(2)}%` }}
          ></div>
        </div>
      </>
    );
  };

  const {
    claimdropStart,
    expiryEnd,
    vestingPeriod,
    claimPeriod,
    totalAllocatedOf,
    claimedOf,
    claimable,
    claimdropTitle,
    claimdropDescription,
  } = claimdropData;

  // Checks
  const canClaim =
    claimdropState > CLAIMDROP_STATE.NOT_STARTED && claimdropState < CLAIMDROP_STATE.ENDED;
  const haveTokensAllocated = Number(totalAllocatedOf.valueStringETH) > 0;
  const haveTokensToClaim = Number(claimable.valueStringETH) > 0;
  const claimButtonDisabled = !haveTokensToClaim;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        {!campaignError ? (
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
                    <h1 className="text-subheader">{claimdropTitle}</h1>
                  </div>

                  <p className="text-main text-gray mt-5">{claimdropDescription}</p>
                </div>

                <div className="col-lg-4"></div>
              </div>

              {contractDataError ? (
                <div className="row mt-6">
                  <div className="col-6 offset-3">
                    <div className="alert alert-warning my-5">
                      Network is busy, please try again later...
                    </div>
                  </div>
                </div>
              ) : userId && !isHashpackLoading ? (
                haveTokensAllocated ? (
                  <div className="row mt-6">
                    <div className="col-lg-7 offset-lg-1">
                      <div className="container-blue-neutral-900 p-5 rounded">
                        <div className="container-border-rounded-bn-500">
                          <div className="row align-items-center">
                            <div className="col-lg-5">
                              <div className="d-flex align-items-center">
                                <p className="text-small text-secondary">Start date</p>
                                <Tippy
                                  content={`This is when the vesting period starts. If the date lies in the future, this specific claim drop is still within the cliff period.`}
                                >
                                  <span className="ms-2">
                                    <Icon name="hint" size="small" color="gray" />
                                  </span>
                                </Tippy>
                              </div>
                            </div>

                            <div className="col-lg-7 mt-2 mt-lg-0">
                              <p className="text-subheader text-bold">{claimdropStart.date}</p>
                            </div>
                          </div>

                          <div className="row align-items-center mt-4">
                            <div className="col-lg-5">
                              <div className="d-flex align-items-center">
                                <p className="text-small text-secondary">Expiry date</p>
                                <Tippy
                                  content={`IMPORTANT: After the Claimdrop has fully vested, there is a limited time where tokens can be claimed. When this day expires, you forfeit all unclaimed tokens of this claimdrop.`}
                                >
                                  <span className="ms-2">
                                    <Icon name="hint" size="small" color="gray" />
                                  </span>
                                </Tippy>
                              </div>
                            </div>

                            <div className="col-lg-7 mt-2 mt-lg-0">
                              <p className="text-subheader text-bold">{expiryEnd.date}</p>
                            </div>
                          </div>

                          <div className="row align-items-center mt-4">
                            <div className="col-lg-5">
                              <div className="d-flex align-items-center">
                                <p className="text-small text-secondary">Vesting Duration</p>
                                <Tippy
                                  content={`This is the period over which the allocated tokens vest linearly.`}
                                >
                                  <span className="ms-2">
                                    <Icon name="hint" size="small" color="gray" />
                                  </span>
                                </Tippy>
                              </div>
                            </div>

                            <div className="col-lg-7 mt-2 mt-lg-0">
                              <p className="text-subheader text-bold">
                                {vestingPeriod.valueString}
                              </p>
                            </div>
                          </div>

                          <div className="row align-items-center mt-4">
                            <div className="col-lg-5">
                              <div className="d-flex align-items-center">
                                <p className="text-small text-secondary">Extra Claim Period</p>
                                <Tippy
                                  content={`After the vesting period expired, and all 100% of tokens are available to claim, we give another courtesy period to claim expired tokens. When this date is reached, the right for unclaimed tokens is forfeited.`}
                                >
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
                                <Tippy
                                  content={`The Amount of tokens that have been allocated to you for this claimdrop.`}
                                >
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
                                <Tippy
                                  content={`The amount of tokens that you have already claimed from the claimdrop.`}
                                >
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

                          <div className="row align-items-center mt-4">
                            <div className="col-lg-5">
                              <div className="d-flex align-items-center">
                                <p className="text-small text-secondary">Claimed percentage</p>
                              </div>
                            </div>

                            <div className="col-lg-7 mt-2 mt-lg-0">
                              <p className="text-subheader text-bold">{getClaimedPercentage()}%</p>
                            </div>
                          </div>
                        </div>

                        {canClaim ? (
                          <div className="d-lg-flex justify-content-between align-items-end mt-7">
                            <div>
                              <div className="d-flex align-items-center">
                                <p className="text-small text-secondary">Available to Claim</p>
                                <Tippy
                                  content={`The tokens that have vested since you last claimed and are currently available for claiming. You can repeat the claiming until 100% of your allocation has vested and been claimed.`}
                                >
                                  <span className="ms-2">
                                    <Icon name="hint" size="small" color="gray" />
                                  </span>
                                </Tippy>
                              </div>

                              <div className="d-flex align-items-center mt-3">
                                <IconToken symbol={tokenData.symbol} />
                                <p className="text-headline text-secondary-300 text-bold ms-3">
                                  {formatStringETHtoPriceFormatted(claimable.valueStringETH, 2)}
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
                        <div className="w-100 text-center">{renderClaimdropStatus()}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row mt-6">
                    <div className="col-6 offset-3">
                      <div className="alert alert-warning text-center">
                        You are not eligible for this claimdrop.
                      </div>
                    </div>
                  </div>
                )
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
              <p className="alert-message">Something went wrong! Cannot get claimdrop...</p>
            </div>
          </div>
        )}
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default ClaimdropDetails;
