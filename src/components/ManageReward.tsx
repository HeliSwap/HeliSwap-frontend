import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

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

interface IManageRewardProps {
  token: IReward;
  userId: string;
  farmAddress: string;
  sdk: SDK;
  connectorInstance: any;
}

const ManageReward = ({
  token,
  userId,
  farmAddress,
  sdk,
  connectorInstance,
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
        response: { success },
      } = receipt;

      if (!success) {
        // toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        setApproved(true);
        // toast.success('Success! Token was approved.');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleSendClick = async () => {};

  const handleWrapClick = async () => {
    setLoadingWrap(true);

    try {
      const receipt = await sdk.wrapHBAR(connectorInstance, userId, inputHBARValue);
      const {
        response: { success },
      } = receipt;

      if (!success) {
        // toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        getHBARBalance();
        getBalance();
        // toast.success('Success! Token was approved.');
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
        response: { success },
      } = receipt;

      if (!success) {
        // toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        getHBARBalance();
        getBalance();
        // toast.success('Success! Token was approved.');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingUnwrap(false);
    }
  };

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
        <Button onClick={handleSendClick} disabled={!approved}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ManageReward;
