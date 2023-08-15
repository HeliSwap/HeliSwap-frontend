import React, { useState, useCallback, useContext, useEffect } from 'react';

import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import { ITokenData } from '../interfaces/tokens';
import { ISSSData } from '../interfaces/dao';

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

import useHELITokenContract from '../hooks/useHELITokenContract';

import getErrorMessage from '../content/errors';

import { MAX_UINT_HTS, SLIDER_INITIAL_VALUE } from '../constants';
import {
  addressToId,
  calculatePercentageByShare,
  calculateShareByPercentage,
  idToAddress,
  invalidInputTokensData,
} from '../utils/tokenUtils';

interface IFarmActionsProps {
  sssData: ISSSData;
  hasUserStaked: boolean;
  stakingTokenBalance: string;
  heliStaked: string;
  amountToLock: string;
  tokensToAssociate: ITokenData[];
  loadingAssociate: boolean;
  hasUserLockedTokens: boolean;
  timeLeft: number;
  getStakingTokenBalance: (id: string) => void;
  handleAssociateClick: (token: ITokenData) => void;
  updateStakedHeli: (newValue: string, action: string) => void;
  updateLockedHeli: (newValue: string, action: string) => void;
  updateTotalStakedHeli: (newValue: string, action: string) => void;
  setCountDown: (newValue: number) => void;
  setLockedUntil: (newValue: number) => void;
}

enum TabStates {
  STAKE,
  LOCK,
  UNSTAKE,
}

const FarmActions = ({
  sssData,
  hasUserStaked,
  stakingTokenBalance,
  tokensToAssociate,
  loadingAssociate,
  getStakingTokenBalance,
  handleAssociateClick,
  updateStakedHeli,
  updateLockedHeli,
  updateTotalStakedHeli,
  amountToLock,
  heliStaked,
  hasUserLockedTokens,
  timeLeft,
  setCountDown,
  setLockedUntil,
}: IFarmActionsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, connectorInstance } = connection;

  const tokenContract = useHELITokenContract();

  const maxHELIInputValue = stakingTokenBalance;

  const [lpInputValue, setLpInputValue] = useState(maxHELIInputValue);
  const [sliderValue, setSliderValue] = useState(SLIDER_INITIAL_VALUE);

  const [loadingStake, setLoadingStake] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(true);
  const [loadingExit, setLoadingExit] = useState(false);
  const [loadingLock, setLoadingLock] = useState(false);

  const [tabState, setTabState] = useState(TabStates.STAKE);
  const [lpApproved, setLpApproved] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  const [selectedButton, setSelectedButton] = useState(0);
  const [lockTimestampValue, setLockTimestampValue] = useState(0);
  const [availableToLock, setAvailableToLock] = useState('0');

  // Handlers
  const handleTabButtonClick = (value: TabStates) => {
    setTabState(value);
  };

  const handleLpInputChange = (value: string) => {
    if (invalidInputTokensData(value, maxHELIInputValue, 18)) {
      setLpInputValue(stakingTokenBalance);
      setSliderValue(SLIDER_INITIAL_VALUE);
      return;
    }

    const percentage = calculatePercentageByShare(maxHELIInputValue, value);
    setSliderValue(percentage);

    setLpInputValue(value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxHELIInputValue, value, 8);
    setLpInputValue(calculatedShare);
  };

  const handleApproveClick = async () => {
    setLoadingApprove(true);
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      await sdk.approveToken(
        connectorInstance,
        MAX_UINT_HTS.toString(),
        userId,
        addressToId(process.env.REACT_APP_HELI_TOKEN_ADDRESS as string),
        true,
        kernelAddress,
      );
      setLpApproved(true);
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingApprove(false);
      getHeliAllowance();
    }
  };

  const handleDepositClick = async () => {
    setLoadingStake(true);
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      const receipt = await sdk.deposit(connectorInstance, lpInputValue, kernelAddress, userId);

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        getStakingTokenBalance(userId);
        updateStakedHeli(lpInputValue, 'add');
        updateTotalStakedHeli(lpInputValue, 'add');

        toast.success('Success! Tokens were deposited.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingStake(false);
    }
  };

  const handleLockConfirm = async () => {
    setLoadingLock(true);
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      const receipt = await sdk.lock(connectorInstance, lockTimestampValue, kernelAddress, userId);

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens were locked.');

        setTabState(TabStates.STAKE);
        setSelectedButton(0);
        setAvailableToLock('0');
        updateLockedHeli(amountToLock, 'add');
        setShowLockModal(false);
        setCountDown(selectedButton * 1000);
        setLockedUntil(Date.now() + selectedButton * 1000);
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }

      setLockTimestampValue(0);
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingLock(false);
    }
  };

  const handleExitConfirm = async () => {
    setLoadingExit(true);
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      const receipt = await sdk.withdraw(connectorInstance, heliStaked, kernelAddress, userId);

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        setTabState(TabStates.STAKE);
        getStakingTokenBalance(userId);
        updateStakedHeli(heliStaked, 'remove');
        updateTotalStakedHeli(heliStaked, 'remove');
        setShowExitModal(false);

        toast.success('Success! Tokens were withdrawn.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingExit(false);
    }
  };

  const handleLockDurationButtonClick = (seconds: number) => {
    setSelectedButton(seconds);
    const nowSeconds = Math.floor(Date.now() / 1000);
    setLockTimestampValue(nowSeconds + seconds);
  };

  const handleButtonClick = (value: string) => {
    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxHELIInputValue, value, 8);
    setLpInputValue(calculatedShare);
  };

  const getInsufficientTokenBalance = useCallback(() => {
    return new BigNumber(lpInputValue as string).gt(new BigNumber(stakingTokenBalance));
  }, [stakingTokenBalance, lpInputValue]);

  const getHeliAllowance = useCallback(async () => {
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      const allowance = await tokenContract.allowance(idToAddress(userId), kernelAddress, {
        gasLimit: 300000,
      });
      setLpApproved(Number(allowance.toString()) > Number(lpInputValue));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingApprove(false);
    }
  }, [lpInputValue, tokenContract, userId]);

  useEffect(() => {
    setLpInputValue(maxHELIInputValue);
  }, [maxHELIInputValue]);

  useEffect(() => {
    userId && Object.keys(tokenContract).length && getHeliAllowance();
  }, [tokenContract, userId, lpInputValue, getHeliAllowance]);

  useEffect(() => {
    if (hasUserLockedTokens) {
      const availableToLockNum = Number(heliStaked) - Number(sssData.position.amount.inETH);
      setAvailableToLock(availableToLockNum.toString());
    } else {
      setAvailableToLock(heliStaked);
    }
  }, [sssData, hasUserLockedTokens, heliStaked]);

  // Helper methods
  const getStakeButtonLabel = () => {
    if (getInsufficientTokenBalance()) return `Insufficient HELI balance`;
    return 'Stake';
  };

  const canUserWithdraw = sssData.position.expiration.inMilliSeconds < Date.now();
  const canUserLock = Number(availableToLock) > 0;

  const buttons = [
    {
      seconds: 60,
      label: '1 Minute',
    },
    {
      seconds: 60 * 5,
      label: '5 Minutes',
    },
    {
      seconds: 3600,
      label: '1 Hour',
    },
    {
      seconds: 3600 * 24,
      label: '1 Day',
    },
    {
      seconds: 15768000,
      label: '6 Months',
    },
    {
      seconds: 31536000,
      label: '12 Months',
    },
  ];

  if (!canUserWithdraw) {
    buttons.push({
      seconds: timeLeft + 60,
      label: 'The rest of the current locking period',
    });
  }

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
              onClick={() => handleTabButtonClick(TabStates.LOCK)}
              className={`text-small text-bold text-uppercase link-tab me-5 ${
                tabState === TabStates.LOCK ? 'is-active' : ''
              }`}
            >
              Lock
            </span>
          ) : null}

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
                {userId ? (
                  <InputSlider
                    handleSliderChange={handleSliderChange}
                    handleButtonClick={handleButtonClick}
                    sliderValue={sliderValue}
                  />
                ) : null}

                <p className="text-small text-bold">Enter HELI Token Amount</p>
                <InputTokenSelector
                  className="mt-4"
                  inputTokenComponent={
                    <InputToken
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
                    <WalletBalance
                      insufficientBallance={getInsufficientTokenBalance()}
                      walletBalance={stakingTokenBalance}
                      onMaxButtonClick={(maxValue: string) => {
                        handleLpInputChange(maxValue);
                      }}
                    />
                  }
                />
              </div>

              {userId ? (
                <div className="d-grid">
                  {!lpApproved ? (
                    <Button className="mb-3" loading={loadingApprove} onClick={handleApproveClick}>
                      <>
                        Approve HELI
                        <Tippy
                          content={`You must give the HeliSwap smart contracts permission to use your HELI tokens.`}
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
                    onClick={handleDepositClick}
                  >
                    <>{getStakeButtonLabel()}</>
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}

          {tabState === TabStates.LOCK ? (
            <>
              <div>
                <p className="text-small text-bold">HELI Token Amount to lock</p>
                <InputTokenSelector
                  className="mt-4"
                  readonly={true}
                  inputTokenComponent={
                    <InputToken
                      value={availableToLock}
                      disabled={true}
                      isCompact={true}
                      name="amountIn"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector disabled selectedToken="HELI" selectorText="Select a token" />
                  }
                />

                <p className="text-secondary text-small text-bold mt-5">Lock for:</p>

                <div className="d-flex flex-wrap align-items-center mt-2">
                  {buttons.map((item, index) => (
                    <Button
                      key={index}
                      onClick={() => handleLockDurationButtonClick(item.seconds)}
                      className={`${selectedButton === item.seconds ? 'active' : ''} ${
                        index !== 0 ? 'ms-3' : ''
                      } mb-3`}
                      size="small"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="d-grid mt-4">
                <Button
                  disabled={lockTimestampValue === 0 || !canUserLock}
                  loading={loadingLock}
                  onClick={() => setShowLockModal(true)}
                >
                  Lock
                </Button>
              </div>
            </>
          ) : null}

          {tabState === TabStates.UNSTAKE ? (
            <>
              <div>
                <p className="text-small text-bold">HELI Token Amount to unstake</p>
                <InputTokenSelector
                  className="mt-4"
                  readonly={true}
                  inputTokenComponent={
                    <InputToken
                      value={heliStaked}
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
                  <Button
                    disabled={!canUserWithdraw}
                    loading={loadingExit}
                    onClick={() => setShowExitModal(true)}
                  >
                    Unstake
                  </Button>
                )}
              </div>
            </>
          ) : null}

          {showExitModal ? (
            <Modal show={showExitModal} closeModal={() => setShowExitModal(false)}>
              <ConfirmTransactionModalContent
                modalTitle="Unstake Your HELI Tokens"
                closeModal={() => setShowExitModal(false)}
                confirmTansaction={handleExitConfirm}
                confirmButtonLabel="Confirm"
                isLoading={loadingExit}
              >
                {loadingExit ? (
                  <Confirmation
                    confirmationText={`Unstaking ${formatStringWeiToStringEther(
                      sssData.position.amount.inWEI as string,
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

                      <div className="text-main text-numeric">{heliStaked}</div>
                    </div>
                  </>
                )}
              </ConfirmTransactionModalContent>
            </Modal>
          ) : null}

          {showLockModal ? (
            <Modal show={showLockModal} closeModal={() => setShowLockModal(false)}>
              <ConfirmTransactionModalContent
                modalTitle="Lock Your HELI Tokens"
                closeModal={() => setShowLockModal(false)}
                confirmTansaction={handleLockConfirm}
                confirmButtonLabel="Confirm"
                isLoading={loadingLock}
              >
                {loadingLock ? (
                  <Confirmation confirmationText={`Locking ${availableToLock} HELI tokens`} />
                ) : (
                  <>
                    <div className="text-main text-warning">
                      You are going to lock {availableToLock} HELI tokens for{' '}
                      {buttons.find(i => i.seconds === selectedButton)?.label}.
                    </div>

                    <div className="text-small mt-4">HELI token count</div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="d-flex align-items-center">
                        <IconToken symbol="HELI" />

                        <span className="text-main ms-3">HELI Token</span>
                      </div>

                      <div className="text-main text-numeric">{availableToLock}</div>
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
