import React, { useState, useContext } from 'react';

import { GlobalContext } from '../providers/Global';

import ButtonSelector from '../components/ButtonSelector';
import InputToken from '../components/InputToken';
import InputTokenSelector from '../components/InputTokenSelector';
import Button from '../components/Button';

import { stripStringToFixedDecimals } from '../utils/numberUtils';

import getErrorMessage from '../content/errors';

interface ILockdropEmergencyFormProps {
  getContractData: () => void;
  toast: any;
}

const LockdropEmergencyForm = ({ getContractData, toast }: ILockdropEmergencyFormProps) => {
  const lockDropContractAddress = process.env.REACT_APP_LOCKDROP_ADDRESS;
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { hashconnectConnectorInstance } = connection;
  const { userId, connected, setShowConnectModal, isHashpackLoading } = connection;

  const [withdrawValue, setWithdrawValue] = useState('0');

  const [loadingButton, setLoadingButton] = useState(false);

  const handleWithdrawInputChange = (rawValue: string) => {
    setWithdrawValue(rawValue);
  };

  const handleWithdrawButtonClick = async () => {
    setLoadingButton(true);

    try {
      const receipt = await sdk.withdrawHBAR(
        hashconnectConnectorInstance,
        lockDropContractAddress as string,
        userId,
        withdrawValue,
      );

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens were withdrawn.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }

      await getContractData();
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingButton(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center py-5">
      <div className="container-action">
        <div className="container-dark">
          <p className="text-small text-bold mb-3">Enter Amount to Withdraw</p>

          <InputTokenSelector
            inputTokenComponent={
              <InputToken
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { value } = e.target;
                  const strippedValue = stripStringToFixedDecimals(value, 8);

                  handleWithdrawInputChange(isNaN(Number(strippedValue)) ? '0' : strippedValue);
                }}
                value={withdrawValue}
                name="amountOut"
              />
            }
            buttonSelectorComponent={
              <ButtonSelector disabled selectedToken={'HBAR'} selectorText="Select token" />
            }
          />

          {connected && !isHashpackLoading ? (
            <div className="d-grid mt-5">
              <Button loading={loadingButton} onClick={handleWithdrawButtonClick}>
                WITHDRAW HBAR
              </Button>
            </div>
          ) : (
            <div className="d-grid mt-4">
              <Button disabled={isHashpackLoading} onClick={() => setShowConnectModal(true)}>
                Connect wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockdropEmergencyForm;
