import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

import toast from 'react-hot-toast';

import { IReward, ITokenData, TokenType } from '../interfaces/tokens';
import SDK from '../sdk/sdk';

import Button from './Button';
import InputToken from './InputToken';
import ButtonSelector from './ButtonSelector';
import InputTokenSelector from './InputTokenSelector';
import WalletBalance from './WalletBalance';

import { stripStringToFixedDecimals } from '../utils/numberUtils';
import {
  addressToId,
  checkAllowanceERC20,
  getAmountToApprove,
  getTokenBalance,
  getTokenBalanceERC20,
} from '../utils/tokenUtils';

import getErrorMessage from '../content/errors';

interface IManageRewardProps {
  token: IReward;
  userId: string;
  farmAddress: string;
  sdk: SDK;
  connectorInstance: any;
  selectedDuration: number;
}

const ManageReward = ({
  token,
  userId,
  farmAddress,
  sdk,
  connectorInstance,
  selectedDuration,
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

  const isTokenWHBAR = token.address === process.env.REACT_APP_WHBAR_ADDRESS;

  const getBalance = useCallback(async () => {
    const balanceNoDecimals = await getTokenBalanceERC20(token.address, userId);
    const balance = ethers.utils.formatUnits(balanceNoDecimals, token.decimals);
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
        true,
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

  // TODO: here selectedDuration could not be correct, a check is needed to get the current duration. This logic needs to be added in Manage Farm Details component.
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
        getBalance();
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
        getBalance();
        toast.success('Success! Tokens were unwrapped.');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingUnwrap(false);
    }
  };

  // TODO: use IToken data instead of IReward in order to get the token type and using getTokenBalance function which requires token type. This is needed to not use the relay every time. Same for checking the allowance.
  useEffect(() => {
    getBalance();
  }, [token, userId, getBalance]);

  useEffect(() => {
    isTokenWHBAR && getHBARBalance();
  }, [token, userId, isTokenWHBAR, getHBARBalance]);

  useEffect(() => {
    setInputValue(tokenBalance);
  }, [tokenBalance]);

  useEffect(() => {
    const getApproved = async () => {
      setLoadingCheckApprove(true);
      const approved = await checkAllowanceERC20(token.address, userId, farmAddress, inputValue);
      setLoadingCheckApprove(false);
      setApproved(approved);
    };

    getApproved();
  }, [token, inputValue, userId, farmAddress]);

  return (
    <div>
      {isTokenWHBAR ? (
        <>
          <InputTokenSelector
            className="mt-4"
            inputTokenComponent={
              <InputToken
                value={inputHBARValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { value } = e.target;
                  const strippedValue = stripStringToFixedDecimals(value, token.decimals);
                  setInputHBARValue(strippedValue);
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
                // insufficientBallance={getInsufficientTokenBalance()}
                walletBalance={HBARBalance}
                onMaxButtonClick={(maxValue: string) => {
                  setInputHBARValue(maxValue);
                }}
              />
            }
          />
          <div className="d-flex align-items-center mt-4">
            <Button loading={loadingWrap} onClick={handleWrapClick}>
              Wrap HBAR
            </Button>
          </div>
        </>
      ) : null}
      <InputTokenSelector
        className="mt-4"
        inputTokenComponent={
          <InputToken
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              const strippedValue = stripStringToFixedDecimals(value, token.decimals);
              setInputValue(strippedValue);
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
            // insufficientBallance={getInsufficientTokenBalance()}
            walletBalance={tokenBalance}
            onMaxButtonClick={(maxValue: string) => {
              setInputValue(maxValue);
            }}
          />
        }
      />
      <div className="d-flex align-items-center mt-4">
        {isTokenWHBAR ? (
          <Button loading={loadingUnwrap} onClick={handleUnwrapClick} className="ws-no-wrap me-3">
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
        <Button loading={loadingSend} onClick={handleSendClick} disabled={!approved}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ManageReward;
