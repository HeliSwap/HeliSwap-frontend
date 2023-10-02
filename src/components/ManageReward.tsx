import { useState, useEffect, useCallback } from 'react';

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
  checkAllowanceHTS,
  getAmountToApprove,
  getTokenBalance,
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
        : await checkAllowanceERC20(token.address, userId, farmAddress, inputValue);
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
