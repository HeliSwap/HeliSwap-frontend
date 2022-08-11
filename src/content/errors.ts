import { IStringToString } from '../interfaces/common';

const errorMessages: IStringToString = {
  DEFAULT_ERROR_MESSAGE: 'Something went wrong!',
  USER_REJECT: 'User rejected transaction',
  INSUFFICIENT_GAS: 'Insufficient gas',
  TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT: 'Token already associated to account',
  INVALID_TOKEN_ID: 'Invalid token ID',
  INVALID_ETHEREUM_TRANSACTION: 'Invalid transaction',
  CONTRACT_REVERT_EXECUTED: 'Contract reverted',
};

const getErrorMessage = (errorCode: string) => {
  return errorMessages[errorCode]
    ? errorMessages[errorCode]
    : errorMessages['DEFAULT_ERROR_MESSAGE'];
};

export default getErrorMessage;
