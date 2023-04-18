import React, { useState, useCallback, useContext, useEffect } from 'react';

import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import { ISSSData, ITokenData } from '../interfaces/tokens';

import Button from './Button';
import ButtonSelector from './ButtonSelector';
import InputToken from './InputToken';
import InputTokenSelector from './InputTokenSelector';
import WalletBalance from './WalletBalance';
import Icon from './Icon';
import Modal from './Modal';
import Confirmation from './Confirmation';
import ConfirmTransactionModalContent from './Modals/ConfirmTransactionModalContent';
import IconToken from './IconToken';
import InputSlider from './InputSlider';

import { formatStringWeiToStringEther, stripStringToFixedDecimals } from '../utils/numberUtils';

import getErrorMessage from '../content/errors';

import { MAX_UINT_ERC20, SLIDER_INITIAL_VALUE } from '../constants';
import {
  calculatePercentageByShare,
  calculateShareByPercentage,
  checkAllowanceERC20,
  invalidInputTokensData,
  requestIdFromAddress,
} from '../utils/tokenUtils';

interface IFarmActionsProps {
  sssData: ISSSData;
  hasUserStaked: boolean;
  campaignEnded: boolean;
  hasUserProvided: boolean;
  stakingTokenBalance: number;
  tokensToAssociate: ITokenData[];
  loadingAssociate: boolean;
  handleAssociateClick: (token: ITokenData) => void;
}

enum TabStates {
  STAKE,
  UNSTAKE,
}

const FarmActions = ({
  sssData,
  hasUserStaked,
  campaignEnded,
  hasUserProvided,
  stakingTokenBalance,
  tokensToAssociate,
  loadingAssociate,
  handleAssociateClick,
}: IFarmActionsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, connectorInstance } = connection;

  const maxHELIInputValue = formatStringWeiToStringEther(stakingTokenBalance.toString(), 8);

  const [lpInputValue, setLpInputValue] = useState(maxHELIInputValue);
  const [sliderValue, setSliderValue] = useState(SLIDER_INITIAL_VALUE);

  const [loadingStake, setLoadingStake] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(true);
  const [loadingExit, setLoadingExit] = useState(false);

  const [tabState, setTabState] = useState(TabStates.STAKE);

  const [lpApproved, setLpApproved] = useState(false);

  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const getInsufficientTokenBalance = useCallback(() => {
    return new BigNumber(lpInputValue as string).gt(
      new BigNumber(formatStringWeiToStringEther(stakingTokenBalance.toString() || '0', 8)),
    );
  }, [stakingTokenBalance, lpInputValue]);

  // Handlers
  const handleTabButtonClick = (value: TabStates) => {
    setTabState(value);
  };

  const handleLpInputChange = (value: string) => {
    if (invalidInputTokensData(value, maxHELIInputValue, 18)) {
      setLpInputValue(formatStringWeiToStringEther(stakingTokenBalance.toString(), 8));
      setSliderValue(SLIDER_INITIAL_VALUE);
      return;
    }

    const percentage = calculatePercentageByShare(maxHELIInputValue, value);
    setSliderValue(percentage);

    setLpInputValue(value);
  };

  const handleStakeConfirm = async () => {
    setLoadingStake(true);
    try {
      const receipt = await sdk.stakeLP(
        connectorInstance,
        lpInputValue as string,
        sssData.address,
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
      setShowStakeModal(false);
      setSliderValue(SLIDER_INITIAL_VALUE);
    }
  };

  const handleExitConfirm = async () => {
    setLoadingExit(true);

    try {
      const receipt = await sdk.exit(connectorInstance, sssData.address, userId);
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Exit was successful.');
        setTabState(TabStates.STAKE);
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExit(false);
      setShowExitModal(false);
      setSliderValue(SLIDER_INITIAL_VALUE);
    }
  };

  const handleApproveButtonClick = async (campaignAddress: string, poolAddress: string) => {
    setLoadingApprove(true);
    const amount = MAX_UINT_ERC20.toString();
    const lpTokenId = await requestIdFromAddress(poolAddress);

    try {
      const receipt = await sdk.approveToken(
        connectorInstance,
        amount,
        userId,
        lpTokenId,
        false,
        campaignAddress,
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxHELIInputValue, value);
    setLpInputValue(calculatedShare);
  };

  const handleButtonClick = (value: string) => {
    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxHELIInputValue, value);
    setLpInputValue(calculatedShare);
  };

  useEffect(() => {
    setLpInputValue(maxHELIInputValue);
  }, [sssData.poolData?.lpShares, maxHELIInputValue]);

  useEffect(() => {
    const getLPAllowanceData = async () => {
      try {
        const canSpend = await checkAllowanceERC20(
          sssData.stakingTokenAddress,
          userId,
          sssData.address,
          lpInputValue,
        );
        setLpApproved(canSpend);
      } catch (e) {
        setLpApproved(false);
      } finally {
        setLoadingApprove(false);
      }
    };

    getLPAllowanceData();

    return () => {
      setLpApproved(false);
    };
  }, [sssData.stakingTokenAddress, sssData.address, userId, lpInputValue]);

  // Helper methods
  const getStakeButtonLabel = () => {
    if (getInsufficientTokenBalance()) return `Insufficient HELI balance`;
    return 'Stake';
  };

  return (
    <div className="col-md-5 mt-4 mt-md-0">
      <div className="container-blue-neutral-900 rounded p-4 p-lg-5 height-100 d-flex flex-column">
        <div>
          <span
            onClick={() => handleTabButtonClick(TabStates.STAKE)}
            className={`text-small text-bold text-uppercase link-tab me-5 ${
              tabState === TabStates.STAKE ? 'is-active' : ''
            }`}
          >
            Stake
          </span>
          {hasUserStaked ? (
            <span
              onClick={() => handleTabButtonClick(TabStates.UNSTAKE)}
              className={`text-small text-bold text-uppercase link-tab me-5 ${
                tabState === TabStates.UNSTAKE ? 'is-active' : ''
              }`}
            >
              Unstake
            </span>
          ) : null}
        </div>

        <div className="d-flex flex-column justify-content-between flex-1 mt-5">
          {tabState === TabStates.STAKE ? (
            <>
              <div>
                {!campaignEnded && hasUserProvided ? (
                  <InputSlider
                    handleSliderChange={handleSliderChange}
                    handleButtonClick={handleButtonClick}
                    sliderValue={sliderValue}
                  />
                ) : null}

                <p className="text-small text-bold">Enter HELI Token Amount</p>
                <InputTokenSelector
                  className="mt-4"
                  readonly={campaignEnded || !hasUserProvided}
                  inputTokenComponent={
                    <InputToken
                      disabled={campaignEnded || !hasUserProvided}
                      value={lpInputValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const { value } = e.target;
                        const strippedValue = stripStringToFixedDecimals(value, 18);
                        handleLpInputChange(strippedValue);
                      }}
                      isCompact={true}
                      name="amountIn"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector disabled selectedToken="HELI" selectorText="Select a token" />
                  }
                  walletBalanceComponent={
                    !campaignEnded ? (
                      <WalletBalance
                        insufficientBallance={getInsufficientTokenBalance()}
                        walletBalance={formatStringWeiToStringEther(
                          stakingTokenBalance.toString() || '0',
                          8,
                        )}
                        onMaxButtonClick={(maxValue: string) => {
                          handleLpInputChange(maxValue);
                        }}
                      />
                    ) : null
                  }
                />
              </div>

              {!campaignEnded ? (
                hasUserProvided ? (
                  <div className="d-grid">
                    {!lpApproved ? (
                      <Button
                        className="mb-3"
                        loading={loadingApprove}
                        onClick={() =>
                          handleApproveButtonClick(sssData.address, sssData.poolData?.pairAddress)
                        }
                      >
                        <>
                          Approve LP
                          <Tippy
                            content={`You must give the HeliSwap smart contracts permission to use your LP tokens.`}
                          >
                            <span className="ms-2">
                              <Icon name="hint" />
                            </span>
                          </Tippy>
                        </>
                      </Button>
                    ) : null}
                    <Button
                      disabled={getInsufficientTokenBalance() || !lpApproved}
                      loading={loadingStake}
                      onClick={() => setShowStakeModal(true)}
                    >
                      <>{getStakeButtonLabel()}</>
                    </Button>
                  </div>
                ) : null
              ) : null}
            </>
          ) : (
            <>
              <div>
                <p className="text-small text-bold">HELI Token Amount to unstake</p>
                <InputTokenSelector
                  className="mt-4"
                  readonly={true}
                  inputTokenComponent={
                    <InputToken
                      value={formatStringWeiToStringEther(
                        sssData.userStakingData?.stakedAmount as string,
                        8,
                      )}
                      disabled={true}
                      isCompact={true}
                      name="amountIn"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector disabled selectedToken="HELI" selectorText="Select a token" />
                  }
                />
              </div>

              <div className="d-grid mt-4">
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
                  <Button loading={loadingExit} onClick={() => setShowExitModal(true)}>
                    Unstake
                  </Button>
                )}
              </div>
            </>
          )}
          {showStakeModal ? (
            <Modal show={showStakeModal} closeModal={() => setShowStakeModal(false)}>
              <ConfirmTransactionModalContent
                modalTitle="Stake Your LP Tokens"
                closeModal={() => setShowStakeModal(false)}
                confirmTansaction={handleStakeConfirm}
                confirmButtonLabel="Confirm"
                isLoading={loadingStake}
              >
                {loadingStake ? (
                  <Confirmation confirmationText={`Staking ${lpInputValue || '0'} LP tokens`} />
                ) : (
                  <>
                    <div className="text-small">HELI token count</div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="d-flex align-items-center">
                        <IconToken symbol="HELI" />

                        <span className="text-main ms-3">HELI Token</span>
                      </div>

                      <div className="text-main text-numeric">{lpInputValue || '0'}</div>
                    </div>
                  </>
                )}
              </ConfirmTransactionModalContent>
            </Modal>
          ) : null}

          {showExitModal ? (
            <Modal show={showExitModal} closeModal={() => setShowExitModal(false)}>
              <ConfirmTransactionModalContent
                modalTitle="Unstake Your LP Tokens"
                closeModal={() => setShowExitModal(false)}
                confirmTansaction={handleExitConfirm}
                confirmButtonLabel="Confirm"
                isLoading={loadingExit}
              >
                {loadingExit ? (
                  <Confirmation
                    confirmationText={`Unstaking ${formatStringWeiToStringEther(
                      sssData.userStakingData?.stakedAmount as string,
                      8,
                    )} HELI tokens`}
                  />
                ) : (
                  <>
                    <div className="text-small">HELI token count</div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="d-flex align-items-center">
                        <IconToken symbol="HELI" />

                        <span className="text-main ms-3">HELI Token</span>
                      </div>

                      <div className="text-main text-numeric">
                        {formatStringWeiToStringEther(
                          sssData.userStakingData?.stakedAmount as string,
                          8,
                        )}
                      </div>
                    </div>
                  </>
                )}
              </ConfirmTransactionModalContent>
            </Modal>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FarmActions;
