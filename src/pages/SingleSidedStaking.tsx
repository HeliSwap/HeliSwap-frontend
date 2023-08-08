import { useCallback, useContext, useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

import { GlobalContext } from '../providers/Global';

import { IPoolExtendedData, ITokenData, TokenType } from '../interfaces/tokens';
import { ISSSData } from '../interfaces/dao';

import Icon from '../components/Icon';
import IconToken from '../components/IconToken';
import Button from '../components/Button';
import ToasterWrapper from '../components/ToasterWrapper';
import SingleSidedStakingActions from '../components/SingleSidedStakingActions';
import Modal from '../components/Modal';
import ConfirmTransactionModalContent from '../components/Modals/ConfirmTransactionModalContent';
import Confirmation from '../components/Confirmation';
import Loader from '../components/Loader';
import SSSFAQ from '../components/SSSFAQ';

import {
  formatBigNumberToStringETH,
  formatContractAmount,
  formatContractDuration,
  formatContractNumberPercentage,
  formatContractTimestamp,
  formatStringETHtoPriceFormatted,
  formatStringToPrice,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import {
  addressToId,
  getTokenBalance,
  getUserAssociatedTokens,
  idToAddress,
} from '../utils/tokenUtils';

import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useTokensByListIds from '../hooks/useTokensByListIds';
import useHELITokenContract from '../hooks/useHELITokenContract';
import useRewardsContract from '../hooks/useRewardsContract';
import useKernelContract from '../hooks/useKernelContract';
import useSSSContract from '../hooks/useSSSContract';

import getErrorMessage from '../content/errors';

import { useQueryOptions, useQueryOptionsPoolsFarms } from '../constants';
import { renderSSSEndDate } from '../utils/farmUtils';
import { timestampToDateTime } from '../utils/timeUtils';

const SingleSidedStaking = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted, hbarPrice } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal, connected } =
    connection;

  const kernelContract = useKernelContract();
  const tokenContract = useHELITokenContract();
  const rewardsContract = useRewardsContract();
  const sssContract = useSSSContract();

  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const heliPoolTokens = [
    process.env.REACT_APP_HELI_TOKEN_ADDRESS as string,
    process.env.REACT_APP_WHBAR_ADDRESS as string,
  ];

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPoolsFarms,
    true,
    tokensWhitelistedAddresses,
  );

  const heliPool =
    pools.find(
      pool => heliPoolTokens.includes(pool.token0) && heliPoolTokens.includes(pool.token1),
    ) || ({} as IPoolExtendedData);

  let heliPrice = 0;

  if (heliPool) {
    const { token0AmountFormatted, token1AmountFormatted, token0 } = heliPool;
    const hbarTokenAmount =
      token0 === process.env.REACT_APP_WHBAR_ADDRESS
        ? token0AmountFormatted
        : token1AmountFormatted;
    const heliTokenAmount =
      token0 === process.env.REACT_APP_HELI_TOKEN_ADDRESS
        ? token0AmountFormatted
        : token1AmountFormatted;
    const heliForHbar = Number(heliTokenAmount) / Number(hbarTokenAmount);
    heliPrice = hbarPrice / heliForHbar;
  }

  const [heliBalance, setHeliBalance] = useState('0');
  const [heliStaked, setHeliStaked] = useState('0');
  const [heliStakedUSD, setHeliStakedUSD] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');
  const [totalStakedUSD, setTotalStakedUSD] = useState('0');
  const [heliLocked, setHeliLocked] = useState('0');
  const [heliLockedUSD, setHeliLockedUSD] = useState('0');
  const [amountToLock, setAmountToLock] = useState('0');
  const [sssData, setSssDdata] = useState({} as ISSSData);
  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [campaignEndDate, setCampaignEndDate] = useState(0);

  const [loadingClaim, setLoadingClaim] = useState(false);
  const [loadingClaimLocked, setLoadingClaimLocked] = useState(false);
  const [loadingAssociate, setLoadingAssociate] = useState(false);
  const [userRewardsBalance, setUserRewardsBalance] = useState('0');
  const [loadingSSSData, setLoadingSSSData] = useState(true);

  const [showHarvestModal, setShowHarvestModal] = useState(false);

  const userRewardsAddresses = [process.env.REACT_APP_HELI_TOKEN_ADDRESS as string];

  // Get selected tokens to check for assosiations
  const { tokens: userRewardsData } = useTokensByListIds(userRewardsAddresses, useQueryOptions);

  const getHeliStaked = useCallback(async () => {
    try {
      const balanceBN = await kernelContract.balanceOf(idToAddress(userId));
      const totalStakedBN = await kernelContract.heliStaked();

      setHeliStaked(formatBigNumberToStringETH(balanceBN));
      setTotalStaked(formatBigNumberToStringETH(totalStakedBN));
    } catch (error) {
      console.error(error);
    }
  }, [kernelContract, userId]);

  const getUserRewardsBalance = useCallback(async () => {
    try {
      const balanceBN = await rewardsContract.owed(idToAddress(userId));
      const decimals = await tokenContract.decimals();
      const balance = ethers.utils.formatUnits(balanceBN, decimals);

      const pull = await rewardsContract.pullFeature();
      const endDate = formatContractTimestamp(pull.endTs);
      // const totalDuration = formatContractDuration(pull.totalDuration);

      setCampaignEndDate(endDate.inMilliSeconds);
      setUserRewardsBalance(balance);
    } catch (error) {
      console.error(error);
    }
  }, [rewardsContract, tokenContract, userId]);

  const calculateHeliPrice = useCallback(
    (heliAmount: string) => {
      const heliAmountNum = Number(heliAmount);
      const calculatedHeliPrice = heliAmountNum * heliPrice;

      return calculatedHeliPrice.toString();
    },
    [heliPrice],
  );

  // Handlers
  const handleAssociateClick = async (token: ITokenData) => {
    setLoadingAssociate(true);

    try {
      const receipt = await sdk.associateToken(connectorInstance, userId, token.hederaId);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        const tokens = await getUserAssociatedTokens(userId);
        setUserAssociatedTokens(tokens);
      }
    } catch (err) {
      console.error(err);
      toast('Error on associate');
    } finally {
      setLoadingAssociate(false);
    }
  };

  const handleClaimClick = async () => {
    setLoadingClaim(true);
    try {
      const rewardsAddress = process.env.REACT_APP_REWARDS_ADDRESS as string;
      const tx = await sdk.claim(connectorInstance, rewardsAddress, userId);
      await tx.wait();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingClaim(false);
      setShowHarvestModal(false);
      setUserRewardsBalance('0');
    }
  };

  const handleClaimButtonClick = async () => {
    setLoadingClaimLocked(true);
    const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
    try {
      const tx = await sdk.claimLock(connectorInstance, kernelAddress, userId);
      await tx.wait();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingClaimLocked(false);
    }
  };

  const getStakingTokenBalance = async (userId: string) => {
    const stakingTokenBalance =
      (await getTokenBalance(userId, {
        decimals: 8,
        hederaId: addressToId(process.env.REACT_APP_HELI_TOKEN_ADDRESS as string),
        symbol: 'HELI',
        type: TokenType.HTS,
        name: '',
        address: '',
      })) || '0';
    setHeliBalance(stakingTokenBalance);
  };

  const getTokenIsAssociated = (token: ITokenData) => {
    const notHTS =
      Object.keys(token).length === 0 ||
      token.type === TokenType.HBAR ||
      token.type === TokenType.ERC20;
    return notHTS || userAssociatedTokens?.includes(token.hederaId);
  };

  const updateStakedHeli = (staked: string, action: string) => {
    setHeliStaked(prev => {
      let newStaked;
      if (action === 'add') {
        newStaked = ethers.utils.parseUnits(prev, 8).add(ethers.utils.parseUnits(staked, 8));
      } else {
        newStaked = ethers.utils.parseUnits(prev, 8).sub(ethers.utils.parseUnits(staked, 8));
      }
      return formatBigNumberToStringETH(newStaked);
    });
  };

  const updateTotalStakedHeli = (staked: string, action: string) => {
    setTotalStaked(prev => {
      let newStaked;
      if (action === 'add') {
        newStaked = ethers.utils.parseUnits(prev, 8).add(ethers.utils.parseUnits(staked, 8));
      } else {
        newStaked = ethers.utils.parseUnits(prev, 8).sub(ethers.utils.parseUnits(staked, 8));
      }
      return formatBigNumberToStringETH(newStaked);
    });
  };

  const updateLockedHeli = (locked: string, action: string) => {
    setHeliLocked(prev => {
      let newLocked;
      if (action === 'add') {
        newLocked = ethers.utils.parseUnits(prev, 8).add(ethers.utils.parseUnits(locked, 8));
      } else {
        newLocked = ethers.utils.parseUnits(prev, 8).sub(ethers.utils.parseUnits(locked, 8));
      }
      return formatBigNumberToStringETH(newLocked);
    });
  };

  // Check for associations
  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);

  useEffect(() => {
    userId && heliPrice && Object.keys(kernelContract).length && getHeliStaked();
  }, [kernelContract, userId, getHeliStaked, heliPrice]);

  useEffect(() => {
    tokenContract && Object.keys(rewardsContract).length && userId && getUserRewardsBalance();
  }, [tokenContract, rewardsContract, userId, getUserRewardsBalance]);

  useEffect(() => {
    userId && getStakingTokenBalance(userId);
  }, [userId]);

  useEffect(() => {
    const getSSSData = async () => {
      setLoadingSSSData(true);

      try {
        const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS;

        const promisesArray = [
          sssContract.totalDeposited(),
          sssContract.rewardsPercentage(),
          sssContract.positions(kernelAddress, idToAddress(userId)),
          sssContract.claimable(kernelAddress, idToAddress(userId)),
          sssContract.totalRewards(kernelAddress, idToAddress(userId)),
        ];

        const [totalDeposited, rewardsPercentage, positions, claimable, totalRewards] =
          await Promise.all(promisesArray);

        const { amount, duration, expiration, rewardsNotClaimed, rewardsPending } = positions;

        const sssData = {
          rewardsPercentage: formatContractNumberPercentage(rewardsPercentage),
          totalDeposited: formatContractAmount(totalDeposited),
          totalRewards: formatContractAmount(totalRewards),
          claimable: formatContractAmount(claimable),
          position: {
            amount: formatContractAmount(amount),
            duration: formatContractDuration(duration),
            expiration: formatContractTimestamp(expiration),
            rewardsNotClaimed: formatContractAmount(rewardsNotClaimed),
            rewardsPending: formatContractAmount(rewardsPending),
          },
        };

        // console.log('sssData', sssData);

        setSssDdata(sssData);
        setHeliLocked(sssData.position.amount.inETH);
      } catch (error) {
        console.error(`Error getting SSS data: ${error}`);
      } finally {
        setLoadingSSSData(false);
      }
    };

    userId && Object.keys(sssContract).length && getSSSData();
  }, [sssContract, userId]);

  useEffect(() => {
    setAmountToLock((Number(heliStaked) - Number(heliLocked)).toString());
  }, [heliLocked, heliStaked]);

  useEffect(() => {
    heliPrice && heliStaked && setHeliStakedUSD(calculateHeliPrice(heliStaked));
  }, [heliPrice, heliStaked, calculateHeliPrice]);

  useEffect(() => {
    heliPrice && totalStaked && setTotalStakedUSD(calculateHeliPrice(totalStaked));
  }, [heliPrice, totalStaked, calculateHeliPrice]);

  useEffect(() => {
    heliPrice && heliLocked && setHeliLockedUSD(calculateHeliPrice(heliLocked));
  }, [heliPrice, heliLocked, calculateHeliPrice]);

  const hasUserStaked = sssData && sssData.totalDeposited && sssData.totalDeposited.inETH !== '0';
  const haveFarm = Object.keys(sssData).length !== 0;
  const hasUserLockedTokens =
    sssData && sssData.position && sssData.position.expiration.inMilliSeconds > Date.now();

  const tokensToAssociate = userRewardsData?.filter(token => !getTokenIsAssociated(token));

  return isHashpackLoading ? (
    <Loader />
  ) : loadingSSSData ? (
    <Loader />
  ) : (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <h1 className="text-headline text-light mb-4">Single Sided Staking - Phase 2</h1>

        <p className="text-small mb-4 mb-lg-6">
          Phase 1 is a standard Single Sided Staking pool. Phase 2 will involve the same mechanism,
          but with advanced features like lockup periods. In Phase 2, staked tokens will also earn
          voting power for the HeliSwap DAO. Phase 2 will follow a few weeks after Phase 1 and we
          will update the community well in advance to make sure everyone can migrate their
          liquidity on time.
        </p>

        {haveFarm ? (
          <div className="row">
            <div className="col-md-7">
              <div className="container-blue-neutral-800 rounded p-4 p-lg-5">
                <div className="d-md-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center">
                    <IconToken size={'large'} symbol={'HELI'} />
                    <p className="text-subheader text-light ms-3">HELI</p>
                  </div>

                  <div className="container-campaign-status mt-4 mt-md-0 d-flex align-items-center">
                    {renderSSSEndDate(campaignEndDate)}
                  </div>
                </div>

                <div className="container-border-rounded-bn-500 mt-4 mt-lg-6">
                  <div className="row">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Total Staked</span>
                        <Tippy content="The total amount of staked tokens in this single sided staking pool, denominated in $USD.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-8 d-md-flex align-items-center">
                      <p className="text-subheader text-numeric">
                        {formatStringToPrice(stripStringToFixedDecimals(totalStakedUSD, 2))}
                      </p>
                      <p className="d-flex align-items-center ms-md-3 mt-2">
                        <span className="text-secondary text-main">
                          {formatStringETHtoPriceFormatted(totalStaked)}
                        </span>

                        <IconToken className="ms-3" symbol="HELI" />
                      </p>
                    </div>
                  </div>

                  {connected && !isHashpackLoading ? (
                    <>
                      <hr className="my-5" />

                      <div className="row mt-4">
                        <div className="col-6 col-md-4 d-flex align-items-center">
                          <p className="d-flex align-items-center">
                            <span className="text-secondary text-small">Staked HELI Tokens</span>
                            <Tippy content="The amount of your staked tokens in $USD, as well as staked tokens count.">
                              <span className="ms-2">
                                <Icon name="hint" color="gray" size="small" />
                              </span>
                            </Tippy>
                          </p>
                        </div>
                        <div className="col-6 col-md-8 d-md-flex align-items-center">
                          <p className="text-subheader text-numeric">
                            {formatStringToPrice(stripStringToFixedDecimals(heliStakedUSD, 2))}
                          </p>
                          <p className="d-flex align-items-center ms-md-3 mt-2">
                            <span className="text-secondary text-main">
                              {formatStringETHtoPriceFormatted(heliStaked)}
                            </span>

                            <IconToken className="ms-3" symbol="HELI" />
                          </p>
                        </div>
                      </div>

                      {hasUserLockedTokens ? (
                        <>
                          <hr className="my-5" />

                          <div className="row mt-4">
                            <div className="col-6 col-md-4 d-flex align-items-center">
                              <p className="d-flex align-items-center">
                                <span className="text-secondary text-small">APR from locking</span>
                                <Tippy content="Your annual rate of return, expressed as a percentage. Interest paid in previous periods is not accounted for.">
                                  <span className="ms-2">
                                    <Icon name="hint" color="gray" size="small" />
                                  </span>
                                </Tippy>
                              </p>
                            </div>
                            <div className="col-6 col-md-4">
                              <p className="text-subheader text-numeric">
                                {sssData.rewardsPercentage}%
                              </p>
                            </div>
                          </div>

                          <div className="row mt-4">
                            <div className="col-6 col-md-4 d-flex align-items-center">
                              <p className="d-flex align-items-center">
                                <span className="text-secondary text-small">
                                  Locked HELI Tokens
                                </span>
                                <Tippy content="The amount of your staked tokens in $USD, as well as staked tokens count.">
                                  <span className="ms-2">
                                    <Icon name="hint" color="gray" size="small" />
                                  </span>
                                </Tippy>
                              </p>
                            </div>
                            <div className="col-6 col-md-8 d-md-flex align-items-center">
                              <p className="text-subheader text-numeric">
                                {formatStringToPrice(stripStringToFixedDecimals(heliLockedUSD, 2))}
                              </p>
                              <p className="d-flex align-items-center ms-md-3 mt-2">
                                <span className="text-secondary text-main">
                                  {formatStringETHtoPriceFormatted(heliLocked)}
                                </span>

                                <IconToken className="ms-3" symbol="HELI" />
                              </p>
                            </div>
                          </div>

                          <div className="row mt-4">
                            <div className="col-6 col-md-4 d-flex align-items-center">
                              <p className="d-flex align-items-center">
                                <span className="text-secondary text-small">Locked until</span>
                                <Tippy content="The amount of your staked tokens in $USD, as well as staked tokens count.">
                                  <span className="ms-2">
                                    <Icon name="hint" color="gray" size="small" />
                                  </span>
                                </Tippy>
                              </p>
                            </div>
                            <div className="col-6 col-md-8 d-md-flex align-items-center">
                              <p className="text-main">
                                {timestampToDateTime(sssData.position.expiration.inMilliSeconds)}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </div>

                <div className="container-blue-neutral rounded p-4 p-lg-5 mt-4 mt-lg-5">
                  {connected && !isHashpackLoading ? (
                    hasUserStaked ? (
                      <>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-center">
                            <p className="text-small text-bold">Pending rewards</p>
                            <Tippy
                              content={`Your pending rewards are calculated in real time. The amount shown is a time-sensitive estimation, and might slightly differ from the actual amount. Before and after actions are taken, it takes 5-10 secs for the amounts to update.`}
                            >
                              <span className="ms-2">
                                <Icon name="hint" />
                              </span>
                            </Tippy>
                          </div>
                        </div>

                        <div className="mt-5">
                          <p className="text-title text-success text-numeric">
                            {/* {userRewardsBalance} */}
                          </p>

                          <hr className="my-4" />

                          <div className="d-flex justify-content-between align-items-center  mt-4">
                            <p className="text-main d-flex justify-content-between align-items-center mt-4">
                              <span className="d-flex align-items-center">
                                <IconToken symbol={'HELI'} />
                                <span className="text-numeric ms-3">{userRewardsBalance}</span>
                                <span className="ms-3 text-secondary">{'HELI'}</span>
                              </span>
                            </p>

                            <div className="d-flex justify-content-end">
                              {tokensToAssociate && tokensToAssociate?.length > 0 ? (
                                tokensToAssociate.map((token, index) => (
                                  <Button
                                    key={index}
                                    loading={loadingAssociate}
                                    onClick={() => handleAssociateClick(token)}
                                    size="small"
                                    type="primary"
                                  >
                                    {`Associate ${token.symbol}`}
                                  </Button>
                                ))
                              ) : (
                                <Button
                                  disabled={Number(userRewardsBalance) === 0}
                                  loading={loadingClaim}
                                  onClick={() => setShowHarvestModal(true)}
                                  size="small"
                                  type="primary"
                                >
                                  Claim
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-4">
                          <p className="text-main d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center">
                              <IconToken symbol={'HELI'} />
                              <span className="text-numeric ms-3">{sssData.claimable.inETH}</span>
                              <span className="ms-3 text-secondary">{'HELI'}</span>
                            </span>
                          </p>

                          <Button
                            className="ms-3"
                            disabled={Number(sssData.claimable.inETH) === 0}
                            loading={loadingClaimLocked}
                            size="small"
                            onClick={handleClaimButtonClick}
                          >
                            Claim
                          </Button>
                        </div>

                        {showHarvestModal ? (
                          <Modal
                            show={showHarvestModal}
                            closeModal={() => setShowHarvestModal(false)}
                          >
                            <ConfirmTransactionModalContent
                              modalTitle="Harvest Pending Rewards"
                              closeModal={() => setShowHarvestModal(false)}
                              confirmTansaction={handleClaimClick}
                              confirmButtonLabel="Confirm"
                              isLoading={loadingClaim}
                            >
                              {loadingClaim ? (
                                <Confirmation confirmationText={'Harvesting reward tokens'} />
                              ) : (
                                <>
                                  <div className="text-small">Estimated pending rewards:</div>
                                  <div className="d-flex justify-content-between align-items-center mt-4">
                                    <div className="d-flex align-items-center">
                                      <IconToken symbol={'HELI'} />
                                      <span className="text-main ms-3">{'HELI'}</span>
                                    </div>

                                    <div className="text-main text-numeric">
                                      {userRewardsBalance}
                                    </div>
                                  </div>
                                </>
                              )}
                            </ConfirmTransactionModalContent>
                          </Modal>
                        ) : null}
                      </>
                    ) : (
                      <div>
                        <p className="text-small text-bold text-center my-5">
                          Stake Your HELI Tokens and Earn Rewards
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <Button
                        size="small"
                        disabled={isHashpackLoading}
                        onClick={() => setShowConnectModal(true)}
                      >
                        Connect wallet
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <SingleSidedStakingActions
              hasUserStaked={hasUserStaked}
              stakingTokenBalance={heliBalance}
              heliStaked={heliStaked}
              amountToLock={amountToLock}
              sssData={sssData}
              loadingAssociate={loadingAssociate}
              tokensToAssociate={tokensToAssociate || []}
              handleAssociateClick={handleAssociateClick}
              getStakingTokenBalance={getStakingTokenBalance}
              updateStakedHeli={updateStakedHeli}
              updateLockedHeli={updateLockedHeli}
              updateTotalStakedHeli={updateTotalStakedHeli}
              hasUserLockedTokens={hasUserLockedTokens}
            />
          </div>
        ) : (
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="alert alert-warning d-flex align-items-center">
                <Icon color="warning" name="warning" />
                <p className="ms-3">This farm does not exist</p>
              </div>
            </div>
          </div>
        )}

        <SSSFAQ />
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default SingleSidedStaking;
