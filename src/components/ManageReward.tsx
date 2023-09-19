import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { IReward, ITokenData } from '../interfaces/tokens';
import SDK from '../sdk/sdk';

import Button from './Button';
import InputToken from './InputToken';
import ButtonSelector from './ButtonSelector';
import InputTokenSelector from './InputTokenSelector';
import WalletBalance from './WalletBalance';

import { stripStringToFixedDecimals } from '../utils/numberUtils';
import {
  addressToId,
  checkAllowanceHTS,
  getAmountToApprove,
  getHTSTokenWalletBalance,
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
  const [inputValue, setInputValue] = useState('0');
  const [loadingApprove, setLoadingApprove] = useState(false);

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

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputValue(e.target.value);
  // };

  useEffect(() => {
    const getBalance = async () => {
      const balanceNoDecimals = await getHTSTokenWalletBalance(userId, addressToId(token.address));
      const balance = ethers.utils.formatUnits(balanceNoDecimals, token.decimals);
      setTokenBalance(balance);
    };

    getBalance();
  }, [token, userId]);

  useEffect(() => {
    setInputValue(tokenBalance);
  }, [tokenBalance]);

  useEffect(() => {
    const getApproved = async () => {
      const approved = await checkAllowanceHTS(
        userId,
        {
          address: token.address,
          decimals: token.decimals,
          symbol: token.symbol,
          hederaId: addressToId(token.address),
        } as ITokenData,
        inputValue,
        farmAddress,
      );
      setApproved(approved);
    };

    getApproved();
  }, [token, inputValue, userId, farmAddress]);

  return (
    <div>
      {/* <InputToken onChange={handleInputChange} value={inputValue} /> */}
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
        {!approved ? (
          <Button loading={loadingApprove} onClick={handleApproveClick} className="me-3">
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
