import React, { useContext, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import { IFarmData, IReward } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Icon from './Icon';
import IconToken from './IconToken';
import PageHeader from './PageHeader';
import Button from './Button';
import InputTokenSelector from './InputTokenSelector';
import ButtonSelector from './ButtonSelector';
import InputToken from './InputToken';
import { formatStringWeiToStringEther } from '../utils/numberUtils';
import getErrorMessage from '../content/errors';

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

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLpInputValue(value);
  };

  const handleStakeClick = async () => {
    setLoadingStake(true);
    try {
      const receipt = await sdk.stakeLP(hashconnectConnectorInstance, farmData.address, userId);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
      toast('Error on stake');
    } finally {
      setLoadingStake(true);
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

      if (!success) {
        toast(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
      toast('Error on harvest');
    } finally {
      setLoadingHarvest(true);
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
                  <IconToken size="large" symbol={farmData.poolData.token0Symbol} />
                  <IconToken size="large" symbol={farmData.poolData.token1Symbol} />
                  <p className="text-subheader text-light ms-4">
                    {farmData.poolData.token0Symbol} / {farmData.poolData.token1Symbol}
                  </p>
                </div>

                <div>
                  <p className="text-micro">
                    Active till <span className="text-bold">15 Sep 2022 - to be determined</span>
                  </p>
                </div>
              </div>
              <div className="row mt-9">
                <div className="col-4">
                  <FarmDataBlock blockLabel="Total APR">
                    <p className="text-main text-numeric">23.45% - to be calculated</p>
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
                    <p className="text-main text-numeric">{totalRewardsUSD}</p>
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
                  <Button onClick={handleHarvestClick} size="small" type="primary">
                    Harvest
                  </Button>
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
                      name="amountIn"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector disabled selectedToken="LP" selectorText="Select a token" />
                  }
                />
              </div>
              <div className="d-grid">
                <Button onClick={handleStakeClick}>Stake</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetails;
