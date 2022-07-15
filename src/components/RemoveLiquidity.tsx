import React, { useEffect, useState, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { IPairData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from './Button';
import IconToken from './IconToken';
import InputTokenSelector from './InputTokenSelector';
import InputToken from './InputToken';
import ButtonSelector from './ButtonSelector';
import InputSlider from './InputSlider';
import PageHeader from './PageHeader';
import TransactionSettingsModalContent from './Modals/TransactionSettingsModalContent';
import ConfirmTransactionModalContent from '../components/Modals/ConfirmTransactionModalContent';
import Modal from './Modal';

import { MAX_UINT_ERC20 } from '../constants';

import {
  formatStringWeiToStringEther,
  formatStringToStringWei,
  formatStringToBigNumberWei,
  formatStringETHtoPriceFormatted,
} from '../utils/numberUtils';
import {
  calculateReserves,
  addressToContractId,
  calculateShareByPercentage,
  calculatePercentageByShare,
} from '../utils/tokenUtils';
import {
  getTransactionSettings,
  handleSaveTransactionSettings,
  INITIAL_SWAP_SLIPPAGE_TOLERANCE,
} from '../utils/transactionUtils';
import { formatIcons } from '../utils/iconUtils';

interface IRemoveLiquidityProps {
  pairData: IPairData;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
}

const RemoveLiquidity = ({ pairData, setShowRemoveContainer }: IRemoveLiquidityProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const initialLpInputValue: string = formatStringWeiToStringEther(pairData.lpShares as string);

  const [loadingRemove, setLoadingRemove] = useState(false);
  const [errorRemove, setErrorRemove] = useState(false);

  const [lpApproved, setLpApproved] = useState(false);
  const [lpInputValue, setLpInputValue] = useState(initialLpInputValue);
  const [sliderValue, setSliderValue] = useState('100');

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

  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);
  const [showModalConfirmRemove, setShowModalConfirmRemove] = useState(false);

  const [loadingApprove, setLoadingApprove] = useState(false);

  const hanleLpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const initialLpInputValueBNWei = formatStringToBigNumberWei(initialLpInputValue, 18);
    const valueBNWei = formatStringToBigNumberWei(value, 18);
    const inputGtInitialValue = valueBNWei.gt(initialLpInputValueBNWei);

    // TODO make this common for every token input
    // TODO make validation for more than 18 decs!!
    const invalidInputTokensData = !value || isNaN(Number(value)) || inputGtInitialValue;

    if (invalidInputTokensData) {
      setLpInputValue(formatStringWeiToStringEther(pairData.lpShares as string));

      return;
    }

    const percentage = calculatePercentageByShare(initialLpInputValue, value);
    setSliderValue(percentage);

    setLpInputValue(value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
    setLpInputValue(calculateShareByPercentage(initialLpInputValue, value));
  };

  const handleButtonClick = (value: string) => {
    setSliderValue(value);
    setLpInputValue(calculateShareByPercentage(initialLpInputValue, value));
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

    setLoadingApprove(true);

    try {
      const contractId = addressToContractId(pairData.pairAddress);
      await sdk.approveToken(hashconnectConnectorInstance, amount, userId, contractId);
      setLpApproved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApprove(false);
    }
  };

  useEffect(() => {
    if (pairData && pairData.pairAddress) {
      setHasWrappedHBAR(
        pairData.token0 === process.env.REACT_APP_WHBAR_ADDRESS ||
          pairData.token1 === process.env.REACT_APP_WHBAR_ADDRESS,
      );
    }
  }, [pairData, removeLpData, sdk, userId]);

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
      <PageHeader
        slippage="remove"
        title="Remove Liquidity"
        handleBackClick={() => setShowRemoveContainer(false)}
      />

      {showModalTransactionSettings ? (
        <Modal show={showModalTransactionSettings}>
          <TransactionSettingsModalContent
            modalTitle="Transaction settings"
            closeModal={() => setShowModalTransactionSettings(false)}
            slippage={getTransactionSettings().swapSlippage}
            expiration={getTransactionSettings().transactionExpiration}
            saveChanges={handleSaveTransactionSettings}
            defaultSlippageValue={INITIAL_SWAP_SLIPPAGE_TOLERANCE}
          />
        </Modal>
      ) : null}

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

        <InputSlider
          handleSliderChange={handleSliderChange}
          handleButtonClick={handleButtonClick}
          sliderValue={sliderValue}
        />

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
                <span className="text-small text-numeric me-3">
                  {formatStringETHtoPriceFormatted(removeLpData.tokens0Amount)}
                </span>
                <IconToken symbol={pairData.token0Symbol} />
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <p className="text-small">Pooled {pairData.token1Symbol}:</p>
              <p className="d-flex justify-content-end align-items-center">
                <span className="text-small text-numeric me-3">
                  {formatStringETHtoPriceFormatted(removeLpData.tokens1Amount)}
                </span>
                <IconToken symbol={pairData.token1Symbol} />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="d-grid mt-4">
            {!lpApproved ? (
              <Button loading={loadingApprove} className="mb-3" onClick={hanleApproveLPClick}>
                Approve
              </Button>
            ) : null}

            <Button
              loading={loadingRemove}
              disabled={!canRemove}
              onClick={() => setShowModalConfirmRemove(true)}
            >
              Remove
            </Button>
          </div>
        </div>

        {showModalConfirmRemove ? (
          <Modal show={showModalConfirmRemove}>
            <ConfirmTransactionModalContent
              modalTitle="Remove liquidity"
              closeModal={() => setShowModalConfirmRemove(false)}
              confirmTansaction={handleRemoveLPButtonClick}
              confirmButtonLabel="Remove"
            >
              <div className="d-flex justify-content-between align-items-center px-3">
                <div className="d-flex align-items-center">
                  <IconToken symbol="LP" />
                  <span className="text-main ms-3">LP Token</span>
                </div>

                <div className="text-main text-numeric">{lpInputValue}</div>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center px-3">
                <div className="d-flex align-items-center">
                  <IconToken symbol={pairData.token0Symbol} />
                  <span className="text-main ms-3">{pairData.token0Symbol}</span>
                </div>

                <div className="text-main text-numeric">
                  {formatStringETHtoPriceFormatted(removeLpData.tokens0Amount)}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center px-3 mt-4">
                <div className="d-flex align-items-center">
                  <IconToken symbol={pairData.token1Symbol} />
                  <span className="text-main ms-3">{pairData.token1Symbol}</span>
                </div>

                <div className="text-main text-numeric">
                  {formatStringETHtoPriceFormatted(removeLpData.tokens1Amount)}
                </div>
              </div>

              <hr />

              <p className="text-micro mb-5 px-3">
                You will also collect fees earned from this position.
              </p>
            </ConfirmTransactionModalContent>
          </Modal>
        ) : null}
      </div>
    </div>
  );
};

export default RemoveLiquidity;
