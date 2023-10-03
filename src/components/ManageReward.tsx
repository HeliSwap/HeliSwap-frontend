import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import toast from 'react-hot-toast';

import { IReward, ITokenData, TokenType } from '../interfaces/tokens';
import SDK from '../sdk/sdk';

import Button from './Button';
import InputToken from './InputToken';
import ButtonSelector from './ButtonSelector';
import InputTokenSelector from './InputTokenSelector';
import WalletBalance from './WalletBalance';

import {
  formatBigNumberToStringETH,
  formatStringToBigNumberEthersWei,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import {
  addressToId,
  checkAllowanceERC20,
  checkAllowanceHTS,
  getAmountToApprove,
  getTokenBalance,
  invalidInputTokensData,
} from '../utils/tokenUtils';

import getErrorMessage from '../content/errors';
import { MONTH_IN_SECONDS } from '../utils/timeUtils';
import IconToken from './IconToken';

interface IManageRewardProps {
  token: IReward;
  userId: string;
  farmAddress: string;
  sdk: SDK;
  connectorInstance: any;
  selectedDuration: number;
  campaignEnd: number;
}

const ManageReward = ({
  token,
  userId,
  farmAddress,
  sdk,
  connectorInstance,
  selectedDuration,
  campaignEnd,
}: IManageRewardProps) => {
  const [approved, setApproved] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [HBARBalance, setHBARBalance] = useState('0');
  const [inputValue, setInputValue] = useState('0');
  const [inputHBARValue, setInputHBARValue] = useState('0');
  const [loadingCheckApprove, setLoadingCheckApprove] = useState(true);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingWrap, setLoadingWrap] = useState(false);
  const [loadingUnwrap, setLoadingUnwrap] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [rewardRate, setRewardRate] = useState('0');
  const [actualReward, setActualReward] = useState('0');

  const isTokenWHBAR = token.address === process.env.REACT_APP_WHBAR_ADDRESS;
  const secondsLeftTillEnd =
    campaignEnd > Date.now()
      ? Math.floor((campaignEnd - Date.now()) / 1000)
      : selectedDuration * MONTH_IN_SECONDS;

  const updateWHBARBalance = (balance: string, action: string) => {
    setTokenBalance(prev => {
      let newStaked;
      if (action === 'add') {
        newStaked = ethers.utils.parseUnits(prev, 8).add(ethers.utils.parseUnits(balance, 8));
      } else {
        newStaked = ethers.utils.parseUnits(prev, 8).sub(ethers.utils.parseUnits(balance, 8));
      }
      return formatBigNumberToStringETH(newStaked);
    });
  };

  const getInsufficientTokenBalance = useCallback(() => {
    return new BigNumber(inputValue as string).gt(new BigNumber(tokenBalance));
  }, [tokenBalance, inputValue]);

  const getInsufficientHBARBalance = useCallback(() => {
    return new BigNumber(inputHBARValue as string).gt(new BigNumber(HBARBalance));
  }, [HBARBalance, inputHBARValue]);

  const getBalance = useCallback(async () => {
    const tokenData = {
      type: token.isHts ? TokenType.HTS : TokenType.ERC20,
      // TODO: check if newly deployed tokens are EVM or long zero address
      hederaId: addressToId(token.address),
      decimals: token.decimals,
      address: token.address,
    } as ITokenData;
    const balance = (await getTokenBalance(userId, tokenData)) || '0';
    setTokenBalance(balance);
  }, [token, userId]);

  const getHBARBalance = useCallback(async () => {
    const balance =
      (await getTokenBalance(userId, {
        type: TokenType.HBAR,
      } as ITokenData)) || '0';
    setHBARBalance(balance);
  }, [userId]);

  const handleApproveClick = async () => {
    setLoadingApprove(true);

    const hederaId = addressToId(token.address);
    const amount = await getAmountToApprove(hederaId, true);

    try {
      const receipt = await sdk.approveToken(
        connectorInstance,
        amount,
        userId,
        hederaId,
        token.isHts,
        farmAddress,
      );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        setApproved(true);
        toast.success('Success! Token was approved.');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleSendClick = async () => {
    setLoadingSend(true);

    try {
      const receipt = await sdk.sendReward(
        connectorInstance,
        farmAddress,
        token.address,
        inputValue,
        token.decimals,
        selectedDuration,
        userId,
      );

      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        toast.success('Success! Rewards are sent.');
        setInputValue('0');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingSend(false);
    }
  };

  const handleWrapClick = async () => {
    setLoadingWrap(true);

    try {
      const receipt = await sdk.wrapHBAR(connectorInstance, userId, inputHBARValue);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        getHBARBalance();
        updateWHBARBalance(inputHBARValue, 'add');
        setInputHBARValue('0');
        toast.success('Success! Tokens were wrapped.');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingWrap(false);
    }
  };

  const handleUnwrapClick = async () => {
    setLoadingUnwrap(true);

    try {
      const receipt = await sdk.unwrapHBAR(connectorInstance, userId, inputValue);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        getHBARBalance();
        updateWHBARBalance(inputValue, 'remove');
        toast.success('Success! Tokens were unwrapped.');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingUnwrap(false);
    }
  };

  useEffect(() => {
    getBalance();
    setInputValue('0');
  }, [token, userId, getBalance]);

  useEffect(() => {
    isTokenWHBAR && getHBARBalance();
  }, [token, userId, isTokenWHBAR, getHBARBalance]);

  useEffect(() => {
    const getApproved = async () => {
      setLoadingCheckApprove(true);

      const approved = token.isHts
        ? await checkAllowanceHTS(
            userId,
            {
              hederaId: addressToId(token.address),
              decimals: token.decimals,
            } as ITokenData,
            inputValue,
            farmAddress,
          )
        : await checkAllowanceERC20(token.address, userId, farmAddress, inputValue, token.decimals);
      setLoadingCheckApprove(false);
      setApproved(approved);
    };

    getApproved();
  }, [token, inputValue, userId, farmAddress]);

  useEffect(() => {
    if (secondsLeftTillEnd > 0) {
      const rateBN = formatStringToBigNumberEthersWei(inputValue, token.decimals)
        .div(secondsLeftTillEnd)
        .toString();

      const actualAmount = secondsLeftTillEnd * Number(rateBN);
      setRewardRate(rateBN);
      setActualReward(formatStringWeiToStringEther(actualAmount.toString(), token.decimals));
    }
  }, [token, secondsLeftTillEnd, inputValue]);

  const canSend = approved && !getInsufficientTokenBalance() && Number(inputValue) > 0;
  const canWrap = !getInsufficientHBARBalance() && Number(inputHBARValue) > 0;
  const canUnwrap = !getInsufficientTokenBalance() && Number(inputValue) > 0;

  return (
    <div>
      {isTokenWHBAR ? (
        <>
          <InputTokenSelector
            className="mt-4"
            isInvalid={getInsufficientHBARBalance()}
            inputTokenComponent={
              <InputToken
                value={inputHBARValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { value } = e.target;
                  const strippedValue = stripStringToFixedDecimals(value, token.decimals);

                  if (!invalidInputTokensData(strippedValue)) {
                    setInputHBARValue(strippedValue);
                  }
                }}
                isCompact={true}
                name="amountIn"
              />
            }
            buttonSelectorComponent={
              <ButtonSelector disabled selectedToken={'HBAR'} selectorText="Select a token" />
            }
            walletBalanceComponent={
              <WalletBalance
                insufficientBallance={getInsufficientHBARBalance()}
                walletBalance={HBARBalance}
                onMaxButtonClick={(maxValue: string) => {
                  setInputHBARValue(maxValue);
                }}
              />
            }
          />
          <div className="d-flex align-items-center mt-4">
            <Button disabled={!canWrap} loading={loadingWrap} onClick={handleWrapClick}>
              Wrap HBAR
            </Button>
          </div>
        </>
      ) : null}
      <InputTokenSelector
        className="mt-4"
        isInvalid={getInsufficientTokenBalance()}
        inputTokenComponent={
          <InputToken
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              const strippedValue = stripStringToFixedDecimals(value, token.decimals);

              if (!invalidInputTokensData(strippedValue)) {
                setInputValue(strippedValue);
              }
            }}
            isCompact={true}
            name="amountIn"
          />
        }
        buttonSelectorComponent={
          <ButtonSelector disabled selectedToken={token.symbol} selectorText="Select a token" />
        }
        walletBalanceComponent={
          <WalletBalance
            insufficientBallance={getInsufficientTokenBalance()}
            walletBalance={tokenBalance}
            onMaxButtonClick={(maxValue: string) => {
              setInputValue(maxValue);
            }}
          />
        }
      />

      <div className="mt-4">
        <p className="text-small">
          <span className="text-bold me-3">Reward rate:</span>{' '}
          <span className="text-numeric">
            {formatStringWeiToStringEther(rewardRate, token.decimals)}
          </span>
          <IconToken className="mx-2" symbol={token.symbol} />
          {token.symbol} per second
        </p>
        <p className="text-small mt-3">
          <span className="text-bold me-3">Reward to be send:</span> {/* Add fee! */}
          <span className="text-numeric">{actualReward}</span>
          <IconToken className="mx-2" symbol={token.symbol} />
          {token.symbol}
        </p>
      </div>

      <div className="d-flex align-items-center mt-4">
        {isTokenWHBAR ? (
          <Button
            disabled={!canUnwrap}
            loading={loadingUnwrap}
            onClick={handleUnwrapClick}
            className="ws-no-wrap me-3"
          >
            Unwrap WHBAR
          </Button>
        ) : null}
        {!approved ? (
          <Button
            loading={loadingApprove || loadingCheckApprove}
            onClick={handleApproveClick}
            className="me-3"
          >
            Approve
          </Button>
        ) : null}
        <Button loading={loadingSend} onClick={handleSendClick} disabled={!canSend}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ManageReward;
