import React, { useState } from 'react';
import Icon from './Icon';
import Modal from './Modal';
import TransactionSettingsModalContent from './Modals/TransactionSettingsModalContent';

import {
  getTransactionSettings,
  handleSaveTransactionSettings,
  INITIAL_REMOVE_SLIPPAGE_TOLERANCE,
} from '../utils/transactionUtils';

const Settings = () => {
  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);

  return (
    <>
      <div
        className="d-flex justify-content-end align-items-center cursor-pointer"
        onClick={() => setShowModalTransactionSettings(true)}
      >
        <span className="text-small me-2">Settings</span>
        <Icon name="settings" />
      </div>
      {showModalTransactionSettings ? (
        <Modal show={showModalTransactionSettings}>
          <TransactionSettingsModalContent
            modalTitle="Transaction settings"
            closeModal={() => setShowModalTransactionSettings(false)}
            slippage={getTransactionSettings().removeSlippage}
            expiration={getTransactionSettings().transactionExpiration}
            saveChanges={handleSaveTransactionSettings}
            defaultSlippageValue={INITIAL_REMOVE_SLIPPAGE_TOLERANCE}
          />
        </Modal>
      ) : null}
    </>
  );
};

export default Settings;
