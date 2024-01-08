import { useCallback, useContext, useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import axios from 'axios';

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
  formatHeliStringToPrice,
  formatStringETHtoPriceFormatted,
  formatStringToPercentage,
  formatStringToPrice,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import {
  addressToId,
  getTokenBalance,
  getUserAssociatedTokens,
  idToAddress,
} from '../utils/tokenUtils';
import { renderSSSEndDate } from '../utils/farmUtils';
import {
  formatTimeNumber,
  getCountdownReturnValues,
  timestampToDateTime,
} from '../utils/timeUtils';

import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useTokensByListIds from '../hooks/useTokensByListIds';
import useHELITokenContract from '../hooks/useHELITokenContract';
import useRewardsContract from '../hooks/useRewardsContract';
import useKernelContract from '../hooks/useKernelContract';
import useSSSContract from '../hooks/useSSSContract';

import getErrorMessage from '../content/errors';

import { useQueryOptions, useQueryOptionsPoolsFarms } from '../constants';

export enum StakingStatus {
  IDLE,
  DEPOSIT,
  LOCK,
}

const SingleSidedStaking = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted, hbarPrice } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal } = connection;

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

  const [stakingStatus, setStakingStatus] = useState(StakingStatus.IDLE);
  const [heliBalance, setHeliBalance] = useState('0');
  const [heliStaked, setHeliStaked] = useState('0');
  const [heliStakedUSD, setHeliStakedUSD] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');
  const [totalStakedUSD, setTotalStakedUSD] = useState('0');
  const [heliLocked, setHeliLocked] = useState('0');
  const [heliLockedUSD, setHeliLockedUSD] = useState('0');
  const [votingPower, setVotingPower] = useState('0');
  const [amountToLock, setAmountToLock] = useState('0');
  const [sssData, setSssDdata] = useState({} as ISSSData);
  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [campaignEndDate, setCampaignEndDate] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [dynamicAPR, setDynamicAPR] = useState(0);
  const [totalRewardsAmount, setTotalRewadsAmount] = useState('0');
  const [countDown, setCountDown] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const [loadingClaim, setLoadingClaim] = useState(false);
  const [loadingClaimLocked, setLoadingClaimLocked] = useState(false);
  const [loadingAssociate, setLoadingAssociate] = useState(false);
  const [userRewardsBalance, setUserRewardsBalance] = useState('0');
  const [loadingSSSData, setLoadingSSSData] = useState(true);
  const [loadingKernelData, setLoadingKernelData] = useState(true);
  const [hasUserLockedTokens, setHasUserLockedTokens] = useState(false);
  const [generalError, setGeneralError] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const [showHarvestModal, setShowHarvestModal] = useState(false);

  const userRewardsAddresses = [process.env.REACT_APP_HELI_TOKEN_ADDRESS as string];

  // Get selected tokens to check for assosiations
  const { tokens: userRewardsData } = useTokensByListIds(userRewardsAddresses, useQueryOptions);

  const getUserRewardsBalance = useCallback(async () => {
    try {
      const decimals = await tokenContract.decimals();
      const rewardsBN = await rewardsContract.callStatic.claim({
        from: idToAddress(userId),
      });
      const rewards = ethers.utils.formatUnits(rewardsBN, decimals);

      setUserRewardsBalance(rewards);
    } catch (error) {
      console.error(error);
      setGeneralError(true);
    }
  }, [rewardsContract, tokenContract, userId]);

  const getCampaignData = useCallback(async () => {
    try {
      // const pull = await rewardsContract.pullFeature();
      // const endDate = formatContractTimestamp(pull.endTs);
      // const totalDuration = formatContractDuration(pull.totalDuration);
      // const totalAmount = formatContractAmount(pull.totalAmount);

      // console.log('pull.endTs', pull.endTs.toString());
      // console.log('pull.totalDuration', pull.totalDuration.toString());
      // console.log('pull.totalAmount', pull.totalAmount.toString());

      const endDate = formatContractTimestamp(ethers.BigNumber.from('1725017519'));
      const totalDuration = formatContractDuration(ethers.BigNumber.from('31536000'));
      const totalAmount = formatContractAmount(ethers.BigNumber.from('364000000000000'));

      setCampaignEndDate(endDate.inMilliSeconds);
      setTotalDuration(totalDuration.inMilliSeconds);
      setTotalRewadsAmount(totalAmount.inETH);
    } catch (error) {
      console.error(error);
      setGeneralError(true);
    }
  }, []);

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
        setHasUserLockedTokens(true);
      } else {
        newLocked = ethers.utils.parseUnits(prev, 8).sub(ethers.utils.parseUnits(locked, 8));
      }
      return formatBigNumberToStringETH(newLocked);
    });
  };

  const updateVotingPower = (votingPower: string, action: string) => {
    setVotingPower(prev => {
      let newVotingPower;
      if (action === 'add') {
        newVotingPower = ethers.utils
          .parseUnits(prev, 8)
          .add(ethers.utils.parseUnits(votingPower, 8));
      } else {
        newVotingPower = ethers.utils
          .parseUnits(prev, 8)
          .sub(ethers.utils.parseUnits(votingPower, 8));
      }
      return formatBigNumberToStringETH(newVotingPower);
    });
  };

  // Check for associations
  /*
  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);



  useEffect(() => {
    tokenContract &&
      Object.keys(rewardsContract).length &&
      userId &&
      Number(heliStaked) > 0 &&
      getUserRewardsBalance();
  }, [tokenContract, rewardsContract, userId, getUserRewardsBalance, heliStaked]);

  useEffect(() => {
    tokenContract && Object.keys(rewardsContract).length && getCampaignData();
  }, [tokenContract, rewardsContract, getCampaignData]);

  useEffect(() => {
    userId && getStakingTokenBalance(userId);
  }, [userId]);

  useEffect(() => {
    const getSSSData = async () => {
      setLoadingSSSData(true);

      try {
        const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS;

        const promisesArray = [
          // sssContract.rewardsPercentage(),
          // sssContract.maxSupply(),
          // sssContract.expirationDate(),
          sssContract.totalDeposited(),
          sssContract.positions(kernelAddress, idToAddress(userId)),
          sssContract.claimable(kernelAddress, idToAddress(userId)),
          sssContract.totalRewards(kernelAddress, idToAddress(userId)),
        ];

        const [
          // rewardsPercentage,
          // maxSupply,
          // expirationDate,
          totalDeposited,
          positions,
          claimable,
          totalRewards,
        ] = await Promise.all(promisesArray);

        // console.log('rewardsPercentage', rewardsPercentage.toString());
        // console.log('maxSupply', maxSupply.toString());
        // console.log('expirationDate', expirationDate.toString());

        const rewardsPercentage = ethers.BigNumber.from('150000000000000000');
        const maxSupply = ethers.BigNumber.from('1500000000000000');
        const expirationDate = ethers.BigNumber.from('1725019604');

        const { amount, duration, expiration, rewardsNotClaimed, rewardsPending } = positions;

        const sssData = {
          rewardsPercentage: formatContractNumberPercentage(rewardsPercentage),
          totalDeposited: formatContractAmount(totalDeposited),
          maxSupply: formatContractAmount(maxSupply),
          totalRewards: formatContractAmount(totalRewards),
          claimable: formatContractAmount(claimable),
          expirationDate: formatContractTimestamp(expirationDate),
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
        setGeneralError(true);
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

  useEffect(() => {
    sssData &&
      sssData.position &&
      setHasUserLockedTokens(sssData.position.expiration.inMilliSeconds > Date.now());
  }, [sssData]);

  useEffect(() => {
    if (sssData && sssData.position && sssData.position.expiration) {
      const timeLeft = sssData.position.expiration.inMilliSeconds - Date.now();
      setCountDown(timeLeft);
    }
  }, [sssData]);

  useEffect(() => {
    if (
      campaignEndDate > Date.now() &&
      totalDuration > 0 &&
      Number(totalStaked) > 0 &&
      Number(totalRewardsAmount) > 0
    ) {
      const dynamicAPR =
        (Number(totalRewardsAmount) / Number(totalStaked) / (totalDuration / 1000)) *
        (365 * 24 * 60 * 60) *
        100;
      setDynamicAPR(dynamicAPR);
    }
  }, [totalDuration, totalStaked, totalRewardsAmount, campaignEndDate]);

  useEffect(() => {
    sssData &&
      sssData.position &&
      sssData.position.expiration.inMilliSeconds &&
      setLockedUntil(sssData.position.expiration.inMilliSeconds);
  }, [sssData]);

  useEffect(() => {
    if (sssData && sssData.position) {
      if (Number(heliStaked) > 0) {
        setStakingStatus(StakingStatus.DEPOSIT);

        if (sssData.position.expiration.inMilliSeconds >= Date.now()) {
          setStakingStatus(StakingStatus.LOCK);
        }
      }
    }
  }, [heliStaked, sssData]);
  */

  useEffect(() => {
    const getVotingPowerByAddress = async () => {
      const uniqueAddresses = [
        '0x00000000000000000000000000000000002f810d',
        '0x00000000000000000000000000000000000d9cb8',
        '0x00000000000000000000000000000000000da2af',
        '0x0000000000000000000000000000000000111203',
        '0x0000000000000000000000000000000000305df5',
        '0x00000000000000000000000000000000001d1495',
        '0x000000000000000000000000000000000017443f',
        '0x000000000000000000000000000000000004ea83',
        '0x0000000000000000000000000000000000037a73',
        '0x00000000000000000000000000000000002037a6',
        '0x00000000000000000000000000000000001c413f',
        '0x00000000000000000000000000000000002eafc4',
        '0x000000000000000000000000000000000019915e',
        '0x000000000000000000000000000000000015a4bf',
        '0x000000000000000000000000000000000032130d',
        '0x00000000000000000000000000000000003550d6',
        '0x00000000000000000000000000000000000d85fa',
        '0x0000000000000000000000000000000000171332',
        '0x000000000000000000000000000000000032bc85',
        '0x000000000000000000000000000000000022667f',
        '0x0000000000000000000000000000000000143d1c',
        '0x00000000000000000000000000000000001104a1',
        '0x000000000000000000000000000000000011f5b9',
        '0x000000000000000000000000000000000007c64e',
        '0x00000000000000000000000000000000000f8c0e',
        '0x00000000000000000000000000000000000d19d4',
        '0x0000000000000000000000000000000000197998',
        '0x00000000000000000000000000000000000ebf2c',
        '0x000000000000000000000000000000000000d366',
        '0x00000000000000000000000000000000001c9274',
        '0x000000000000000000000000000000000014827d',
        '0x0000000000000000000000000000000000211821',
        '0x0000000000000000000000000000000000137ae3',
        '0x00000000000000000000000000000000003bac38',
        '0x00000000000000000000000000000000001e2d26',
        '0x0000000000000000000000000000000000114eda',
        '0x00000000000000000000000000000000000b018d',
        '0x0000000000000000000000000000000000214118',
        '0x0000000000000000000000000000000000115eba',
        '0x00000000000000000000000000000000000ad16e',
        '0x00000000000000000000000000000000000d6eae',
        '0x00000000000000000000000000000000000ae0c6',
        '0x00000000000000000000000000000000001708d6',
        '0x00000000000000000000000000000000003a700c',
        '0x00000000000000000000000000000000002db3db',
        '0x0000000000000000000000000000000000388e64',
        '0x0000000000000000000000000000000000312fe3',
        '0x000000000000000000000000000000000010ce46',
        '0x00000000000000000000000000000000001a535d',
        '0x00000000000000000000000000000000000b9dae',
        '0x00000000000000000000000000000000000ce22e',
        '0x00000000000000000000000000000000001f466a',
        '0x00000000000000000000000000000000001544f7',
        '0x00000000000000000000000000000000003bb442',
        '0x00000000000000000000000000000000001042b0',
        '0x000000000000000000000000000000000034f70a',
        '0x00000000000000000000000000000000003bb4c0',
        '0x000000000000000000000000000000000012b3f4',
        '0x000000000000000000000000000000000032c61c',
        '0x00000000000000000000000000000000003bbe0a',
        '0x0000000000000000000000000000000000154c36',
        '0x000000000000000000000000000000000019f458',
        '0x00000000000000000000000000000000003171ba',
        '0x00000000000000000000000000000000003ad08e',
        '0x000000000000000000000000000000000014626c',
        '0x00000000000000000000000000000000002c5db6',
        '0x00000000000000000000000000000000000cd470',
        '0x0000000000000000000000000000000000165e23',
        '0x000000000000000000000000000000000016192f',
        '0x00000000000000000000000000000000000ccf04',
        '0x000000000000000000000000000000000011fe64',
        '0x00000000000000000000000000000000001dfbc0',
        '0x00000000000000000000000000000000003aaf4e',
        '0x00000000000000000000000000000000000cbf36',
        '0x00000000000000000000000000000000002dbd33',
        '0x000000000000000000000000000000000016d94e',
        '0x00000000000000000000000000000000000cf00e',
        '0x000000000000000000000000000000000015f3ad',
        '0x00000000000000000000000000000000001e67e3',
        '0x00000000000000000000000000000000002cf878',
        '0x00000000000000000000000000000000003c33d5',
        '0x00000000000000000000000000000000002109fc',
        '0x00000000000000000000000000000000000dc11a',
        '0x00000000000000000000000000000000003c8e38',
        '0x00000000000000000000000000000000001157f3',
        '0x00000000000000000000000000000000002e6d8c',
        '0x00000000000000000000000000000000001ea4c8',
        '0x00000000000000000000000000000000000fc2eb',
        '0x0000000000000000000000000000000000158720',
        '0x00000000000000000000000000000000001f00f4',
        '0x00000000000000000000000000000000003c8316',
        '0x0000000000000000000000000000000000392cda',
        '0x00000000000000000000000000000000002e653e',
        '0x000000000000000000000000000000000014299f',
        '0x0000000000000000000000000000000000162c32',
        '0x0000000000000000000000000000000000109640',
        '0x0000000000000000000000000000000000319035',
        '0x00000000000000000000000000000000003fe4de',
        '0x00000000000000000000000000000000003fc577',
        '0x00000000000000000000000000000000003f64a9',
      ];

      const promisesArray = uniqueAddresses.map((address: string) =>
        kernelContract.votingPower(address),
      );

      const results = await Promise.all(promisesArray);

      results.forEach((result, index) => {
        if (Number(formatStringWeiToStringEther(result.toString(), 8)) > 0) {
          console.log(
            `${uniqueAddresses[index]} => ${formatStringWeiToStringEther(result.toString(), 8)}`,
          );
        }
      });
    };

    kernelContract && getVotingPowerByAddress();
  }, [kernelContract]);

  const hasUserStaked = sssData && sssData.totalDeposited && sssData.totalDeposited.inETH !== '0';
  const tokensToAssociate = userRewardsData?.filter(token => !getTokenIsAssociated(token));

  return isHashpackLoading ? (
    <Loader />
  ) : (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <h1 className="text-headline text-light mb-4">Single Sided Staking - Phase 2</h1>

        <p className="text-small mb-4">
          On HeliSwap, you can stake your $HELI tokens into the pool below and earn APR on your
          stake - and even lock up your position for a certain amount of time for extra APR - but
          most importantly: Participating grants you voting rights within the HeliSwap DAO allowing
          active participation in the community. Please look at all the tips and be careful before
          locking your tokens longer than you are comfortable with.
        </p>

        {!userId ? (
          <div className="text-center">
            <Button
              size="small"
              disabled={isHashpackLoading}
              onClick={() => setShowConnectModal(true)}
            >
              Connect wallet
            </Button>
          </div>
        ) : loadingSSSData || loadingKernelData ? (
          <Loader />
        ) : generalError ? (
          <div className="d-flex justify-content-center">
            <div className="alert alert-warning my-5">
              Something went wrong, please try again later...
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-7">
              <div className="container-blue-neutral-800 rounded p-4 p-lg-5">
                <div className="d-md-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={'HELI'} />
                    <p className="text-subheader text-light ms-3">Staking</p>
                    {stakingStatus === StakingStatus.DEPOSIT ? (
                      <Tippy
                        content={`Your Single Sided Staking position is unlocked. You may stake and unstake your
                      $HELI as you please.`}
                      >
                        <span className="ms-2">
                          <Icon size="small" name="hint" />
                        </span>
                      </Tippy>
                    ) : null}
                  </div>

                  <div className="container-campaign-status mt-4 mt-md-0 d-flex align-items-center">
                    {renderSSSEndDate(campaignEndDate)}
                  </div>
                </div>

                <div className="container-border-rounded-bn-500 mt-5">
                  <p className="text-main text-bold mb-4">Total position</p>
                  <div className="row">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">APR</span>
                        <Tippy content="The annual rate of return (APR) of your dynamic staked $HELI position. This APR may change dynamically as people stake and unstake into SSS. The Lock time of users does not affect this APR.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-8">
                      <div className="d-flex align-items-center">
                        <p className="text-subheader text-numeric">
                          {formatStringToPercentage(
                            stripStringToFixedDecimals(
                              dynamicAPR > 0 ? (dynamicAPR - 1).toString() : dynamicAPR.toString(),
                              2,
                            ),
                          )}{' '}
                          {dynamicAPR > 0 ? '+ 1.00%' : null}
                        </p>
                        {dynamicAPR > 0 ? (
                          <Tippy content="The single sided mechanism is complex and calls several contracts at once, which may lead to an increased transaction cost. To compensate users and to let everyone use the product at ease, this Transaction Offset APR was added.">
                            <span className="ms-2">
                              <Icon name="hint" />
                            </span>
                          </Tippy>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Total Staked</span>
                        <Tippy content="The Total Amount of $HELI staked into Dynamic Staking expressed in Token amount and $Dollar Amount.">
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
                          {formatHeliStringToPrice(totalStaked)}
                        </span>

                        <IconToken className="ms-3" symbol="HELI" />
                      </p>
                    </div>
                  </div>

                  <hr className="my-5" />

                  <p className="text-main text-bold my-4">Your position</p>
                  <div className="row">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Staked HELI Tokens</span>
                        <Tippy content="Your personal amount of $HELI staked into the Single Sided Staking Pool, expressed in Tokens and $Dollar Amount.">
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
                          {formatHeliStringToPrice(heliStaked)}
                        </span>

                        <IconToken className="ms-3" symbol="HELI" />
                      </p>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Voting power</span>
                        <Tippy content="Your total voting power for the HeliSwap DAO. It is derived from your stake in the Dynamic Yield Farm as well as additional voting power granted by an actively locked position.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-8">
                      <p className="text-subheader text-numeric">
                        {formatStringETHtoPriceFormatted(votingPower)}{' '}
                      </p>
                      {hasUserLockedTokens ? (
                        <p className="d-flex align-items-center mt-2">
                          <span className="text-secondary text-main">
                            ({formatStringETHtoPriceFormatted(heliStaked)} +{' '}
                            {formatStringETHtoPriceFormatted(
                              (Number(votingPower) - Number(heliStaked)).toString(),
                            )}{' '}
                            from lock)
                          </span>
                        </p>
                      ) : null}
                      {shouldRefresh ? (
                        <p className="d-flex align-items-center ms-2 mt-3">
                          <Icon size="small" name="warning" color="warning" />
                          <span className="text-micro text-warning ms-2">
                            Please refresh the page for more accurate data
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="container-blue-neutral rounded p-4 p-lg-5 mt-4 mt-lg-5">
                  {hasUserStaked ? (
                    <>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center">
                          <p className="text-small text-bold">Staking rewards</p>
                          <Tippy
                            content={`Your earned rewards from single sided staking (excluding lock). They can be claimed any time.`}
                          >
                            <span className="ms-2">
                              <Icon name="hint" />
                            </span>
                          </Tippy>
                        </div>
                      </div>

                      <div>
                        <hr className="my-4" />

                        <div className="d-flex justify-content-between align-items-center">
                          <p className="text-main d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center">
                              <IconToken symbol={'HELI'} />
                              <span className="text-numeric ms-3">{userRewardsBalance}</span>
                              <span className="ms-3 text-secondary">{'HELI'}</span>
                              <Tippy
                                content={`The reward is updated (at least) once every 24 hours. When you just started your position, it is normal to see 0.0 for up to 24 hours. This does not effect the rewards you earned.`}
                              >
                                <span className="ms-2">
                                  <Icon color="gray" size="small" name="hint" />
                                </span>
                              </Tippy>
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

                                  <div className="text-main text-numeric">{userRewardsBalance}</div>
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
                  )}
                </div>

                <div className="d-flex align-items-center mt-5 mb-3">
                  <Icon name={hasUserLockedTokens ? 'lock' : 'unlock'} />
                  <p className="text-subheader text-light ms-3">Lock</p>

                  {stakingStatus === StakingStatus.LOCK ? (
                    <Tippy
                      content={`Your Single Sided Staking position is locked. While you wait for lock to
                      expire, you may still add more tokens to the existing lock or incearse the
                      lock for extra APR.`}
                    >
                      <span className="ms-2">
                        <Icon size="small" name="hint" />
                      </span>
                    </Tippy>
                  ) : null}
                </div>
                <div className="container-border-rounded-bn-500 mt-4">
                  <div className="row">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">APR from locking</span>
                        <Tippy content="The Extra APR you gain from locking your tokens. This is a static APR and does not change depending on Lock participants.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-4">
                      <p className="text-subheader text-numeric">{sssData.rewardsPercentage}%</p>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Total lockable tokens</span>
                        <Tippy content="There is a limit to the maximum HELI that can be locked at the same time. This includes all locked tokens from all participants. This gives an indication of how many tokens may still be locked.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-8 d-md-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-subheader text-numeric">
                          {formatStringToPrice(sssData.totalDeposited.inETH)}/
                          {formatStringToPrice(sssData.maxSupply.inETH)}
                        </span>

                        <IconToken className="ms-3" symbol="HELI" />
                      </p>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Locked HELI Tokens</span>
                        <Tippy content="The Amount of $HELI Tokens you have locked. While a lock is active, this number will always resemble the “Staked HELI Tokens”.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-8 d-md-flex align-items-center">
                      <p className="text-subheader text-numeric">
                        {hasUserLockedTokens
                          ? formatStringToPrice(stripStringToFixedDecimals(heliLockedUSD, 2))
                          : formatStringToPrice(stripStringToFixedDecimals('0', 2))}
                      </p>
                      <p className="d-flex align-items-center ms-md-3 mt-2">
                        <span className="text-secondary text-main">
                          {hasUserLockedTokens
                            ? formatStringETHtoPriceFormatted(heliLocked)
                            : formatStringETHtoPriceFormatted('0')}
                        </span>

                        <IconToken className="ms-3" symbol="HELI" />
                      </p>
                    </div>
                  </div>

                  {hasUserLockedTokens ? (
                    <>
                      <div className="row mt-4">
                        <div className="col-6 col-md-4 d-flex align-items-center">
                          <p className="d-flex align-items-center">
                            <span className="text-secondary text-small">Locked until</span>
                            <Tippy content="The exact date and time your position is locked for. You can not unstake during this time. Adding tokens or extending lock is the only option.">
                              <span className="ms-2">
                                <Icon name="hint" color="gray" size="small" />
                              </span>
                            </Tippy>
                          </p>
                        </div>
                        <div className="col-6 col-md-8 d-md-flex align-items-center">
                          <p className="text-main">{timestampToDateTime(lockedUntil)}</p>
                        </div>
                      </div>

                      <div className="row mt-4">
                        <div className="col-6 col-md-4 d-flex align-items-center">
                          <p className="d-flex align-items-center">
                            <span className="text-secondary text-small">Remaining Lock time:</span>
                            <Tippy content="The Countdown of when your current lock ends.">
                              <span className="ms-2">
                                <Icon name="hint" color="gray" size="small" />
                              </span>
                            </Tippy>
                          </p>
                        </div>
                        <div className="col-6 col-md-8 d-md-flex align-items-center">
                          <div className="mt-3 d-flex justify-content-center">
                            <div className="text-center">
                              <p className="text-numeric text-main">
                                {formatTimeNumber(getCountdownReturnValues(countDown).days)}
                              </p>
                              <p className="text-micro text-secondary text-uppercase mt-2">days</p>
                            </div>
                            <div className="text-center ms-3">
                              <p className="text-numeric text-main">
                                {formatTimeNumber(getCountdownReturnValues(countDown).hours)}
                              </p>
                              <p className="text-micro text-secondary text-uppercase mt-2">hours</p>
                            </div>
                            <div className="text-center ms-3">
                              <p className="text-numeric text-main">
                                {formatTimeNumber(getCountdownReturnValues(countDown).minutes)}
                              </p>
                              <p className="text-micro text-secondary text-uppercase mt-2">
                                minutes
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="container-blue-neutral rounded p-4 p-lg-5 mt-4 mt-lg-5">
                  {hasUserStaked ? (
                    <>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center">
                          <p className="text-small text-bold">Lock rewards</p>
                          <Tippy
                            content={`The Rewards earned from locking. Only expired lock rewards are claimable. Rewards from active locks can only be redeemed once that lock expired.`}
                          >
                            <span className="ms-2">
                              <Icon name="hint" />
                            </span>
                          </Tippy>
                        </div>
                      </div>

                      <hr className="my-4" />

                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <p className="text-main d-flex justify-content-between align-items-center">
                          <span className="d-flex align-items-center">
                            <IconToken symbol={'HELI'} />
                            <span className="text-numeric ms-3">{sssData.totalRewards.inETH}</span>
                            <span className="ms-3 text-secondary">{'HELI'}</span>
                            <Tippy
                              content={`If you see a HELI reward amount, but the “Claim” button is greyed out, these rewards were earned by a currently active lock and can hence not be claimed yet. If the “Claim” button is usable - you are currently unlocked and the rewards were earned by previously expired locks.`}
                            >
                              <span className="ms-2">
                                <Icon color="gray" size="small" name="hint" />
                              </span>
                            </Tippy>
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
                    </>
                  ) : (
                    <div>
                      <p className="text-small text-bold text-center my-5">
                        Stake Your HELI Tokens and Earn Rewards
                      </p>
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
              timeLeft={Math.ceil(countDown / 1000)}
              setCountDown={setCountDown}
              setLockedUntil={setLockedUntil}
              setStakingStatus={setStakingStatus}
              stakingStatus={stakingStatus}
              updateVotingPower={updateVotingPower}
              setShouldRefresh={setShouldRefresh}
            />
          </div>
        )}

        <SSSFAQ />
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default SingleSidedStaking;
