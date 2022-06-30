import React, { useEffect, useState, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { IPairData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from './Button';
import Icon from './Icon';
import IconToken from './IconToken';
import InputTokenSelector from './InputTokenSelector';
import InputToken from './InputToken';
import ButtonSelector from './ButtonSelector';

import { MAX_UINT_ERC20 } from '../constants';
import { getConnectedWallet } from '../pages/Helpers';

import {
  formatStringWeiToStringEther,
  formatStringToStringWei,
  formatStringToBigNumber,
  formatStringToBigNumberWei,
} from '../utils/numberUtils';
import { calculateReserves, addressToContractId, idToAddress } from '../utils/tokenUtils';
import { getTransactionSettings } from '../utils/transactionUtils';

interface IRemoveLiquidityProps {
  pairData: IPairData;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
}

const RemoveLiquidity = ({ pairData, setShowRemoveContainer }: IRemoveLiquidityProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const connectedWallet = getConnectedWallet();

  const [loadingRemove, setLoadingRemove] = useState(false);
  const [errorRemove, setErrorRemove] = useState(false);

  const [lpApproved, setLpApproved] = useState(false);
  const [lpInputValue, setLpInputValue] = useState(
    formatStringWeiToStringEther(pairData.lpShares as string),
  );

  const [removeLpData, setRemoveLpData] = useState({
    tokenInAddress: '',
    tokenOutAddress: '',
    tokensLpAmount: '',
    tokens0Amount: '0.0',
    tokens1Amount: '0.0',
    token0Decimals: 0,
    token1Decimals: 0,
  });

  const [removeNative, setRemoveNative] = useState(false);
  const [hasWrappedHBAR, setHasWrappedHBAR] = useState(false);

  // TODO To be moved into helpers/utils folder
  const formatIcons = (icons: string[]) =>
    icons &&
    icons.length > 0 &&
    icons.map((item, index) => (
      <IconToken key={index} className={index === 1 ? 'ms-n2' : ''} symbol={item} />
    ));

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setLpInputValue(value);
  };

  const handleRemoveLPButtonClick = async () => {
    setLoadingRemove(true);
    setErrorRemove(false);

    try {
      let responseData;
      const { removeSlippage, transactionExpiration } = getTransactionSettings();

      if (hasWrappedHBAR && removeNative) {
        const isFirstTokenWHBAR = pairData.token0 === process.env.REACT_APP_WHBAR_ADDRESS;

        const WHBARAmount = isFirstTokenWHBAR
          ? removeLpData.tokens0Amount
          : removeLpData.tokens1Amount;

        const WHBARDecimals = isFirstTokenWHBAR
          ? removeLpData.token0Decimals
          : removeLpData.token1Decimals;

        const tokenAmount = isFirstTokenWHBAR
          ? removeLpData.tokens1Amount
          : removeLpData.tokens0Amount;

        const tokenDecimals = isFirstTokenWHBAR
          ? removeLpData.token1Decimals
          : removeLpData.token0Decimals;

        const tokenAddress = isFirstTokenWHBAR
          ? removeLpData.tokenOutAddress
          : removeLpData.tokenInAddress;

        responseData = await sdk.removeNativeLiquidity(
          hashconnectConnectorInstance,
          userId,
          tokenAddress,
          removeLpData.tokensLpAmount,
          tokenAmount,
          WHBARAmount,
          tokenDecimals,
          WHBARDecimals,
          removeSlippage,
          transactionExpiration,
        );
      } else {
        responseData = await sdk.removeLiquidity(
          hashconnectConnectorInstance,
          userId,
          removeLpData.tokenInAddress,
          removeLpData.tokenOutAddress,
          removeLpData.tokensLpAmount,
          removeLpData.tokens0Amount,
          removeLpData.tokens1Amount,
          removeLpData.token0Decimals,
          removeLpData.token1Decimals,
          removeSlippage,
          transactionExpiration,
        );
      }

      const { response } = responseData;
      const { success } = response;

      if (success) {
        setRemoveLpData({
          tokenInAddress: '',
          tokenOutAddress: '',
          tokensLpAmount: '',
          tokens0Amount: '0.0',
          tokens1Amount: '0.0',
          token0Decimals: 0,
          token1Decimals: 0,
        });
        setShowRemoveContainer(false);
      } else {
        setErrorRemove(true);
      }
    } catch (e) {
      console.error(e);
      setErrorRemove(true);
    } finally {
      setLoadingRemove(false);
    }
  };

  const hanleApproveLPClick = async () => {
    const amount = MAX_UINT_ERC20.toString();

    try {
      const contractId = addressToContractId(pairData.pairAddress);
      await sdk.approveToken(hashconnectConnectorInstance, amount, userId, contractId);
      setLpApproved(true);
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  useEffect(() => {
    const getApproved = async () => {
      if (connectedWallet) {
        const resultBN = await sdk.checkAllowance(
          pairData.pairAddress,
          idToAddress(userId),
          process.env.REACT_APP_ROUTER_ADDRESS as string,
          connectedWallet,
        );

        const currentAllowanceBN = formatStringToBigNumber(resultBN.toString());
        const amountToSpend = removeLpData.tokensLpAmount;
        const amountToSpendBN = formatStringToBigNumberWei(amountToSpend);

        const canSpend = amountToSpendBN.lte(currentAllowanceBN);

        setLpApproved(canSpend);
      }
    };

    pairData && pairData.pairAddress && userId && getApproved();

    if (pairData && pairData.pairAddress) {
      setHasWrappedHBAR(
        pairData.token0 === process.env.REACT_APP_WHBAR_ADDRESS ||
          pairData.token1 === process.env.REACT_APP_WHBAR_ADDRESS,
      );
    }
  }, [pairData, connectedWallet, removeLpData, sdk, userId]);

  useEffect(() => {
    const {
      pairSupply,
      token0Amount,
      token1Amount,
      token0: tokenInAddress,
      token1: tokenOutAddress,
      token0Decimals,
      token1Decimals,
    } = pairData;

    const tokensLPToRemove = formatStringToStringWei(lpInputValue);

    const { reserve0ShareStr: tokens0Amount, reserve1ShareStr: tokens1Amount } = calculateReserves(
      tokensLPToRemove,
      pairSupply,
      token0Amount,
      token1Amount,
      token0Decimals,
      token1Decimals,
    );

    const tokensLpAmount = hethers.utils.formatUnits(tokensLPToRemove, 18).toString();

    setRemoveLpData({
      tokenInAddress,
      tokenOutAddress,
      tokensLpAmount,
      tokens0Amount,
      tokens1Amount,
      token0Decimals,
      token1Decimals,
    });
  }, [lpInputValue, pairData]);

  const canRemove = lpApproved && removeLpData.tokenInAddress !== '';

  return (
    <div className="container-action">
      <div className="d-flex justify-content-between aling-items-center mb-6">
        <span className="cursor-pointer" onClick={() => setShowRemoveContainer(false)}>
          <Icon name="arrow-left" />
        </span>

        <h2 className="text-subheader text-light">Remove Liquidity</h2>

        <div
          className="d-flex justify-content-end align-items-center cursor-pointer"
          // onClick={() => setShowModalTransactionSettings(true)}
        >
          <span className="text-small me-2">Settings</span>
          <Icon name="settings" />
        </div>
      </div>

      <div className="container-dark">
        {errorRemove ? (
          <div className="alert alert-danger mb-4" role="alert">
            <strong>Something went wrong!</strong>
          </div>
        ) : null}

        <div className="d-flex align-items-center mb-5">
          {formatIcons([pairData.token0Symbol, pairData.token1Symbol])}
          <p className="text-small ms-3">
            {pairData.token0Symbol}/{pairData.token1Symbol}
          </p>
        </div>

        <p className="text-small text-bold mb-4">Enter LP Token Amount</p>

        <InputTokenSelector
          inputTokenComponent={
            <InputToken value={lpInputValue} onChange={hanleLpInputChange} name="amountIn" />
          }
          buttonSelectorComponent={
            <ButtonSelector disabled selectedToken="LP" selectorText="Select a token" />
          }
        />

        <div className="mt-4">
          {hasWrappedHBAR ? (
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={removeNative}
                  onChange={() => setRemoveNative(!removeNative)}
                />
                <span className="ms-2">Receive HBAR</span>
              </label>
            </div>
          ) : null}

          <div className="mt-4 p-4 rounded border border-secondary">
            <div className="d-flex justify-content-between align-items-center">
              <p className="text-small">Pooled {pairData.token0Symbol}:</p>
              <p className="d-flex justify-content-end align-items-center">
                <span className="text-small text-numeric me-3">{removeLpData.tokens0Amount}</span>
                <IconToken symbol={pairData.token0Symbol} />
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <p className="text-small">Pooled {pairData.token1Symbol}:</p>
              <p className="d-flex justify-content-end align-items-center">
                <span className="text-small text-numeric me-3">{removeLpData.tokens1Amount}</span>
                <IconToken symbol={pairData.token1Symbol} />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="d-grid mt-4">
            {!lpApproved ? (
              <Button className="mb-3" onClick={hanleApproveLPClick}>
                Approve
              </Button>
            ) : null}

            <Button
              loading={loadingRemove}
              disabled={!canRemove}
              onClick={handleRemoveLPButtonClick}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveLiquidity;
