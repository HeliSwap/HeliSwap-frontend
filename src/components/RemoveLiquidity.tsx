import React, { useEffect, useState, useContext } from 'react';

import toast from 'react-hot-toast';
import Tippy from '@tippyjs/react';

import { hethers } from '@hashgraph/hethers';

import { GlobalContext } from '../providers/Global';

import { IPoolData } from '../interfaces/tokens';

import Button from './Button';
import IconToken from './IconToken';
import InputTokenSelector from './InputTokenSelector';
import InputToken from './InputToken';
import ButtonSelector from './ButtonSelector';
import Icon from './Icon';
import InputSlider from './InputSlider';
import PageHeader from './PageHeader';
import TransactionSettingsModalContent from './Modals/TransactionSettingsModalContent';
import ConfirmTransactionModalContent from '../components/Modals/ConfirmTransactionModalContent';
import Modal from './Modal';
import Confirmation from './Confirmation';
import ToasterWrapper from './ToasterWrapper';

import {
  formatStringWeiToStringEther,
  formatStringToStringWei,
  formatStringETHtoPriceFormatted,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import {
  calculateReserves,
  addressToContractId,
  calculateShareByPercentage,
  calculatePercentageByShare,
  invalidInputTokensData,
} from '../utils/tokenUtils';
import {
  getTransactionSettings,
  handleSaveTransactionSettings,
  INITIAL_SWAP_SLIPPAGE_TOLERANCE,
} from '../utils/transactionUtils';
import { formatIcons } from '../utils/iconUtils';

import getErrorMessage from '../content/errors';

import { MAX_UINT_ERC20, SLIDER_INITIAL_VALUE } from '../constants';

interface IRemoveLiquidityProps {
  pairData: IPoolData;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
}

const RemoveLiquidity = ({ pairData, setShowRemoveContainer }: IRemoveLiquidityProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const maxLpInputValue: string = formatStringWeiToStringEther(pairData?.lpShares as string);

  const [loadingRemove, setLoadingRemove] = useState(false);

  const [lpApproved, setLpApproved] = useState(false);
  const [lpInputValue, setLpInputValue] = useState(maxLpInputValue);
  const [sliderValue, setSliderValue] = useState(SLIDER_INITIAL_VALUE);

  const [removeLpData, setRemoveLpData] = useState({
    tokenInAddress: '',
    tokenOutAddress: '',
    tokensLpAmount: '',
    tokens0Amount: '0.0',
    tokens1Amount: '0.0',
    token0Decimals: 0,
    token1Decimals: 0,
  });

  const [removeNative, setRemoveNative] = useState(true);
  const [hasWrappedHBAR, setHasWrappedHBAR] = useState(false);

  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);
  const [showModalConfirmRemove, setShowModalConfirmRemove] = useState(false);

  const [loadingApprove, setLoadingApprove] = useState(false);

  // Handlers
  const handleLpInputChange = (value: string) => {
    if (invalidInputTokensData(value, maxLpInputValue, 18)) {
      setLpInputValue(formatStringWeiToStringEther(pairData.lpShares as string));
      setSliderValue(SLIDER_INITIAL_VALUE);
      recalculateReserves(formatStringWeiToStringEther(pairData.lpShares as string));
      return;
    }

    const percentage = calculatePercentageByShare(maxLpInputValue, value);
    setSliderValue(percentage);

    setLpInputValue(value);
    recalculateReserves(value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxLpInputValue, value);
    setLpInputValue(calculatedShare);
    recalculateReserves(calculatedShare);
  };

  const handleButtonClick = (value: string) => {
    setSliderValue(value);
    const calculatedShare = calculateShareByPercentage(maxLpInputValue, value);
    setLpInputValue(calculatedShare);
    recalculateReserves(calculatedShare);
  };

  const recalculateReserves = (newInputValue: string) => {
    const {
      pairSupply,
      token0Amount,
      token1Amount,
      token0: tokenInAddress,
      token1: tokenOutAddress,
      token0Decimals,
      token1Decimals,
    } = pairData;

    const newInputValueWei = formatStringToStringWei(newInputValue);
    const { reserve0ShareStr: tokens0Amount, reserve1ShareStr: tokens1Amount } = calculateReserves(
      newInputValueWei,
      pairSupply,
      token0Amount,
      token1Amount,
      token0Decimals,
      token1Decimals,
    );
    const tokensLpAmount = hethers.utils.formatUnits(newInputValueWei, 18).toString();
    setRemoveLpData({
      tokenInAddress,
      tokenOutAddress,
      tokensLpAmount,
      tokens0Amount,
      tokens1Amount,
      token0Decimals,
      token1Decimals,
    });
  };

  const handleRemoveLPButtonClick = async () => {
    setLoadingRemove(true);

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
      const { success, error } = response;

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
        toast.success('Success! Liquidity was removed.');
        setShowRemoveContainer(false);
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (e) {
      toast.error('Remove Liquidity transaction resulted in an error. ');
    } finally {
      setLoadingRemove(false);
      setShowModalConfirmRemove(false);
    }
  };

  const hanleApproveLPClick = async () => {
    const amount = MAX_UINT_ERC20.toString();

    setLoadingApprove(true);

    try {
      const contractId = addressToContractId(pairData.pairAddress);

      const receipt = await sdk.approveToken(
        hashconnectConnectorInstance,
        amount,
        userId,
        contractId,
        false,
      );

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        setLpApproved(true);
        toast.success('Success! Token was approved.');
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (e) {
      toast.error('Approve Token transaction resulted in an error.');
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
      lpShares,
    } = pairData;

    const newInputValue = calculateShareByPercentage(
      formatStringWeiToStringEther(lpShares as string, 18),
      SLIDER_INITIAL_VALUE,
    );
    setSliderValue(SLIDER_INITIAL_VALUE);

    setLpInputValue(newInputValue);

    const newInputValueWei = formatStringToStringWei(newInputValue);

    const { reserve0ShareStr: tokens0Amount, reserve1ShareStr: tokens1Amount } = calculateReserves(
      newInputValueWei,
      pairSupply,
      token0Amount,
      token1Amount,
      token0Decimals,
      token1Decimals,
    );

    const tokensLpAmount = hethers.utils.formatUnits(newInputValueWei, 18).toString();

    setRemoveLpData({
      tokenInAddress,
      tokenOutAddress,
      tokensLpAmount,
      tokens0Amount,
      tokens1Amount,
      token0Decimals,
      token1Decimals,
    });
  }, [pairData]);

  const canRemove = lpApproved && removeLpData.tokenInAddress !== '';

  const confirmationText = `Removing ${formatStringETHtoPriceFormatted(
    removeLpData.tokensLpAmount,
  )} LP tokens for ${formatStringETHtoPriceFormatted(removeLpData.tokens0Amount)} ${
    pairData.token0Symbol
  } and ${formatStringETHtoPriceFormatted(removeLpData.tokens1Amount)} ${pairData.token1Symbol}`;

  return (
    <div className="container-action">
      <PageHeader
        slippage="remove"
        title="Remove Liquidity"
        handleBackClick={() => setShowRemoveContainer(false)}
      />

      {showModalTransactionSettings ? (
        <Modal
          show={showModalTransactionSettings}
          closeModal={() => setShowModalTransactionSettings(false)}
        >
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
            <InputToken
              value={lpInputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value } = e.target;
                const strippedValue = stripStringToFixedDecimals(value, 18);
                handleLpInputChange(strippedValue);
              }}
              name="amountIn"
            />
          }
          buttonSelectorComponent={
            <ButtonSelector disabled selectedToken="LP" selectorText="Select a token" />
          }
        />

        <div className="mt-4">
          {hasWrappedHBAR ? (
            <div className="d-none">
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
              <Button
                className="d-flex justify-content-center align-items-center mb-3"
                loading={loadingApprove}
                onClick={hanleApproveLPClick}
              >
                <span>Approve LP</span>
                <Tippy
                  content={`You must give the HeliSwap smart contracts permission to use your LP tokens.`}
                >
                  <span className="ms-2">
                    <Icon name="hint" />
                  </span>
                </Tippy>
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
          <Modal show={showModalConfirmRemove} closeModal={() => setShowModalConfirmRemove(false)}>
            <ConfirmTransactionModalContent
              isLoading={loadingRemove}
              modalTitle="Remove liquidity"
              closeModal={() => setShowModalConfirmRemove(false)}
              confirmTansaction={handleRemoveLPButtonClick}
              confirmButtonLabel="Confirm"
            >
              {loadingRemove ? (
                <Confirmation confirmationText={confirmationText} />
              ) : (
                <>
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
                </>
              )}
            </ConfirmTransactionModalContent>
          </Modal>
        ) : null}
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default RemoveLiquidity;
