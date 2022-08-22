import React, { useContext, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import { IFarmData, IReward } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Icon from './Icon';
import PageHeader from './PageHeader';
import Button from './Button';
import InputTokenSelector from './InputTokenSelector';
import ButtonSelector from './ButtonSelector';
import InputToken from './InputToken';
import { formatStringWeiToStringEther } from '../utils/numberUtils';
import getErrorMessage from '../content/errors';
import { MAX_UINT_ERC20 } from '../constants';
import { formatIcons } from '../utils/iconUtils';
import ToasterWrapper from './ToasterWrapper';

interface IFarmDataBlockProps {
  blockLabel: string;
  children: JSX.Element | JSX.Element[] | string;
  toolTipContent?: string;
}

const FarmDataBlock = ({ blockLabel, children, toolTipContent }: IFarmDataBlockProps) => {
  return (
    <div>
      <p className="d-flex align-items-center">
        <span className="text-secondary text-small">{blockLabel}</span>
        {toolTipContent && toolTipContent !== '' ? (
          <Tippy content={toolTipContent}>
            <span className="ms-3">
              <Icon name="hint" color="gray" />
            </span>
          </Tippy>
        ) : null}
      </p>
      {children}
    </div>
  );
};

interface IFarmDetailsProps {
  farmData: IFarmData;
  setShowFarmDetails: React.Dispatch<React.SetStateAction<boolean>>;
}

const FarmDetails = ({ farmData, setShowFarmDetails }: IFarmDetailsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [lpInputValue, setLpInputValue] = useState('0.0');
  const [loadingHarvest, setLoadingHarvest] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingExit, setLoadingExit] = useState(false);

  const [lpApproved, setLpApproved] = useState(false);

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLpInputValue(value);
  };

  const handleStakeClick = async () => {
    setLoadingStake(true);
    try {
      const receipt = await sdk.stakeLP(
        hashconnectConnectorInstance,
        lpInputValue,
        farmData.address,
        userId,
      );
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens are staked');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
      toast.error('Error on stake');
    } finally {
      setLoadingStake(false);
    }
  };

  const handleHarvestClick = async () => {
    setLoadingHarvest(true);
    try {
      const receipt = await sdk.collectRewards(
        hashconnectConnectorInstance,
        farmData.address,
        userId,
      );
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Rewards were harvested.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
      toast('Error on harvest');
    } finally {
      setLoadingHarvest(false);
    }
  };

  const handleExitButtonClick = async (campaignAddress: string) => {
    setLoadingExit(true);

    try {
      const receipt = await sdk.exit(hashconnectConnectorInstance, campaignAddress, userId);
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Exit was successful.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExit(false);
    }
  };

  const handleApproveButtonClick = async (campaignAddress: string, poolAddress: string) => {
    setLoadingApprove(true);
    const amount = MAX_UINT_ERC20.toString();
    try {
      const receipt = await sdk.approveTokenStake(
        hashconnectConnectorInstance,
        campaignAddress,
        amount,
        userId,
        poolAddress,
      );
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Token was approved.');
        setLpApproved(true);
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApprove(false);
    }
  };

  const totalRewardsUSD = useMemo(() => {
    const { rewardsData } = farmData;

    return rewardsData.reduce((acc: string, currentValue: IReward) => {
      const { totalAccumulatedUSD } = currentValue;
      return (Number(acc) + Number(totalAccumulatedUSD)).toString();
    }, '0');
  }, [farmData]);

  const userRewardsUSD = useMemo(() => {
    const { userStakingData } = farmData;

    return Object.keys(userStakingData?.rewardsAccumulatedUSD || {}).reduce(
      (acc: string, currentValue: string) => {
        return (
          Number(acc) + Number(userStakingData?.rewardsAccumulatedUSD[currentValue])
        ).toString();
      },
      '0',
    );
  }, [farmData]);

  const userShare = useMemo(() => {
    const { totalStaked, userStakingData } = farmData;

    return (Number(userStakingData?.stakedAmount) / Number(totalStaked)) * 100;
  }, [farmData]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <PageHeader
          slippage="remove"
          title="Manage Farm"
          handleBackClick={() => setShowFarmDetails(false)}
        />
        <div className="row">
          <div className="col-8">
            <div className="container-blue-neutral-800 rounded p-5">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                  {formatIcons(
                    [farmData.poolData.token0Symbol, farmData.poolData.token1Symbol],
                    'large',
                  )}
                  <p className="text-subheader text-light ms-4">
                    {farmData.poolData.token0Symbol} / {farmData.poolData.token1Symbol}
                  </p>
                </div>

                <div className="container-campaign-status d-flex align-items-center">
                  <span className="icon-campaign-status is-active me-2"></span>
                  <p className="text-micro">
                    Active till <span className="text-bold">15 Sep 2022 - to be determined</span>
                  </p>
                </div>
              </div>
              <div className="row mt-9">
                <div className="col-4">
                  <FarmDataBlock blockLabel="Total APR">
                    <p className="text-main text-numeric">{farmData.APR}</p>
                  </FarmDataBlock>
                </div>
                <div className="col-4">
                  <FarmDataBlock blockLabel="Liquidity">
                    <p className="text-main text-numeric">
                      {formatStringWeiToStringEther(farmData.totalStaked)}
                    </p>
                  </FarmDataBlock>
                </div>
              </div>

              <hr className="my-5" />

              <div className="row mt-9">
                <div className="col-4">
                  <FarmDataBlock blockLabel="Weekly Rewards">
                    <p className="text-main text-numeric">23.45% - last week rewards ?</p>
                  </FarmDataBlock>
                </div>
                <div className="col-4">
                  <FarmDataBlock blockLabel="Total Rewards">
                    <p className="text-main text-numeric">{farmData.totalRewardsUSD}</p>
                  </FarmDataBlock>
                </div>
              </div>

              <hr className="my-5" />

              <div className="row">
                <div className="col-4">
                  <FarmDataBlock blockLabel="Staked LP Tokens">
                    <>
                      <p className="text-title text-numeric">
                        {formatStringWeiToStringEther(
                          farmData.userStakingData?.stakedAmount || '0',
                        )}
                      </p>
                      <p className="text-main text-numeric">
                        ${farmData.userStakingData?.userStakedUSD}
                      </p>
                    </>
                  </FarmDataBlock>
                </div>
                <div className="col-4">
                  <FarmDataBlock blockLabel="Your share">
                    <p className="text-title text-numeric">{userShare}%</p>
                  </FarmDataBlock>
                </div>
              </div>

              <div className="container-blue-neutral rounded p-5 mt-5">
                <div className="d-flex justify-content-between align-items-start">
                  <p className="text-small text-bold">Pending rewards</p>
                  <div className="d-flex justify-content-end">
                    <Button
                      loading={loadingHarvest}
                      onClick={handleHarvestClick}
                      size="small"
                      type="primary"
                    >
                      Harvest
                    </Button>
                    <Button
                      className="ms-3"
                      size="small"
                      loading={loadingExit}
                      onClick={() => handleExitButtonClick(farmData.address)}
                    >
                      Exit
                    </Button>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-subheader text-success text-numeric">
                    ${farmData.userStakingData?.userStakedUSD}
                  </p>
                  <p className="text-subheader text-success text-numeric">
                    ${farmData.userStakingData?.userStakedUSD}
                  </p>
                  <p className="text-main text-numeric mt-3">${userRewardsUSD}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="container-blue-neutral-900 rounded p-5 heigth-100 d-flex flex-column justify-content-between">
              <div>
                <p className="text-small text-bold">Enter LP Token Amount</p>
                <InputTokenSelector
                  className="mt-4"
                  inputTokenComponent={
                    <InputToken
                      value={lpInputValue}
                      onChange={hanleLpInputChange}
                      isCompact={true}
                      name="amountIn"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector disabled selectedToken="LP" selectorText="Select a token" />
                  }
                />
              </div>

              <div className="d-grid">
                {lpApproved ? (
                  <Button loading={loadingStake} onClick={handleStakeClick}>
                    Stake
                  </Button>
                ) : (
                  <Button
                    loading={loadingApprove}
                    onClick={() =>
                      handleApproveButtonClick(farmData.address, farmData.poolData.pairAddress)
                    }
                  >
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default FarmDetails;
