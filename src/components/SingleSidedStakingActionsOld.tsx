import React, { useState, useCallback, useContext, useEffect } from 'react';

import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import { ITokenData, TokenType, ISSSData } from '../interfaces/tokens';

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
  checkAllowanceHTS,
  idToAddress,
  invalidInputTokensData,
} from '../utils/tokenUtils';

interface IFarmActionsProps {
  sssData: ISSSData;
  hasUserStaked: boolean;
  campaignEnded: boolean;
  hasUserProvided: boolean;
  stakingTokenBalance: string;
  tokensToAssociate: ITokenData[];
  loadingAssociate: boolean;
  getStakingTokenBalance: (userId: string, tokenId: string) => void;
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
  getStakingTokenBalance,
  handleAssociateClick,
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

  const [tabState, setTabState] = useState(TabStates.STAKE);

  const [lpApproved, setLpApproved] = useState(false);

  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  const getInsufficientTokenBalance = useCallback(() => {
    return new BigNumber(lpInputValue as string).gt(new BigNumber(stakingTokenBalance));
  }, [stakingTokenBalance, lpInputValue]);

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

  const handleDepositClick = async () => {
    setLoadingDeposit(true);
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      const tx = await sdk.deposit(connectorInstance, lpInputValue, kernelAddress, userId);

      setLpInputValue('0');
      // getHeliStaked();
      // getHeliBalance();
      // getUserRewardsBalance();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingDeposit(false);
    }
  };

  const handleExitConfirm = async () => {
    // setLoadingExit(true);
    // try {
    //   const receipt = await sdk.exit(connectorInstance, sssData.address, userId);
    //   const {
    //     response: { success, error },
    //   } = receipt;
    //   if (success) {
    //     toast.success('Success! Exit was successful.');
    //     setTabState(TabStates.STAKE);
    //   } else {
    //     toast.error(getErrorMessage(error.status ? error.status : error));
    //   }
    // } catch (err) {
    //   console.error(err);
    // } finally {
    //   setLoadingExit(false);
    //   setShowExitModal(false);
    //   setSliderValue(SLIDER_INITIAL_VALUE);
    // }
  };

  const handleApproveClick = async () => {
    setLoadingApprove(true);
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      const tx = await sdk.approveToken(
        connectorInstance,
        MAX_UINT_HTS.toString(),
        userId,
        addressToId(process.env.REACT_APP_HELI_TOKEN_ADDRESS as string),
        true,
        kernelAddress,
      );
      await tx.wait();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingApprove(false);
      getHeliAllowance();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxHELIInputValue, value, 8);
    setLpInputValue(calculatedShare);
  };

  const handleButtonClick = (value: string) => {
    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxHELIInputValue, value, 8);
    setLpInputValue(calculatedShare);
  };

  useEffect(() => {
    setLpInputValue(maxHELIInputValue);
  }, [maxHELIInputValue]);

  const getHeliAllowance = useCallback(async () => {
    try {
      const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS as string;
      const allowance = await tokenContract.allowance(idToAddress(userId), kernelAddress, {
        gasLimit: 300000,
      });
      setLpApproved(Number(allowance.toString()) > Number(lpInputValue));
    } catch (error) {
      console.error(error);
    }
  }, [lpInputValue, tokenContract, userId]);

  useEffect(() => {
    userId && Object.keys(tokenContract).length && getHeliAllowance();
  }, [tokenContract, userId, lpInputValue, getHeliAllowance]);

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
                {userId && !campaignEnded && hasUserProvided ? (
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
                        walletBalance={stakingTokenBalance}
                        onMaxButtonClick={(maxValue: string) => {
                          handleLpInputChange(maxValue);
                        }}
                      />
                    ) : null
                  }
                />
              </div>

              {userId ? (
                !campaignEnded ? (
                  hasUserProvided ? (
                    <div className="d-grid">
                      {!lpApproved ? (
                        <Button
                          className="mb-3"
                          loading={loadingApprove}
                          onClick={handleApproveClick}
                        >
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
                        onClick={() => setShowStakeModal(true)}
                      >
                        <>{getStakeButtonLabel()}</>
                      </Button>
                    </div>
                  ) : null
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
                        sssData.position.amount.inETH as string,
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
                modalTitle="Stake Your HELI Tokens"
                closeModal={() => setShowStakeModal(false)}
                confirmTansaction={handleDepositClick}
                confirmButtonLabel="Confirm"
                isLoading={loadingStake}
              >
                {loadingStake ? (
                  <Confirmation confirmationText={`Staking ${lpInputValue || '0'} HELI tokens`} />
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

                      <div className="text-main text-numeric">
                        {formatStringWeiToStringEther(sssData.position.amount.inWEI as string, 8)}
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
