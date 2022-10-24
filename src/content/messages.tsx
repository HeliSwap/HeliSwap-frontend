import { IStringToHTMLElement } from '../interfaces/common';
import { ITokenData } from '../interfaces/tokens';

export const tokenPropsMessages: IStringToHTMLElement = {
  adminKey: (
    <span>
      <span className="text-bold">Admin Key</span> - The key can perform update/delete operations on
      the token. If empty, the token can be perceived as immutable (not being able to be
      updated/deleted)
    </span>
  ),
  feeScheduleKey: (
    <span>
      <span className="text-bold">Custom fees</span> - The selected token has a Fee schedule Key set
      by the token creator. Providing liquidity places your funds at risk! The token creator has the
      ability to acquire all tokens provided as liquidity in the pool!
    </span>
  ),
  freezeKey: (
    <span>
      <span className="text-bold">Freeze Key</span> - The key which can sign to freeze or unfreeze
      an account for token transactions. If empty, freezing is not possible.
    </span>
  ),
  kycKey: (
    <span>
      <span className="text-bold">KYC Key</span> - KYC key can perform TokenGrantKYC or
      TokenRevokeKYC transactions. If a KYC has been granted, the user that got KYC granted is
      allowed to transfer, however revoking KYC makes the revoked account not being able to receive
      or transfer tokens.
    </span>
  ),
  pauseKey: (
    <span>
      <span className="text-bold">Pause Key</span> - The key that has the authority to pause or
      unpause a token. Pausing a token prevents the token from participating in all transactions.
    </span>
  ),
  supplyKey: (
    <span>
      <span className="text-bold">Supply Key</span> - A Supply key is set and the supply operator
      has special privileges that may result in manipulating the Pair reserves, thus changing the
      exchange rate and disrupting the Pool. Liquidity providers may suffer from great impermanent
      loss.
    </span>
  ),
  wipeKey: (
    <span>
      <span className="text-bold">Wipe Key</span> - The key which can wipe the token balance of an
      account. If empty, wipe is not possible. Wipe key could perform TokenWipe transactions. If a
      user has balance of HTS token and TokenWipe is executed, his token balance will be burned by
      the amount specified in the wipe operation without requesting permissions from the user.
    </span>
  ),

  hasFees: (
    <span>
      <span className="text-bold">Custom fees</span> - The token is created with custom fees. It can
      charge extra fees to an account, additional to protocol fees or transaction costs. A token
      which has such fees can, upon transfer from one address to another, charge users additionally
      without asking their permission, causing the transaction to fail or resulting in losses. If a
      `feeScheduleKey` is also present, these fees could be updated.
    </span>
  ),
};

export const generalFeesAndKeysWarning =
  'Be careful, оne or both tokens in this pool have custom token keys. By the HTS standard, this means issuers still have certain control over the token and can trigger events with its key, depending on key type. Only lock funds in pools you trust.';

export const concatWarningMessage = (token: ITokenData) => {
  const { keys: tokenKeys, hasFees } = token;
  const messageList: JSX.Element[] = [];

  const keyIndexes = Object.keys(tokenKeys || {});

  keyIndexes.forEach(key => {
    if (tokenKeys && tokenKeys[key] && key !== '__typename') {
      messageList.push(tokenPropsMessages[key]);
    }
  });

  if (hasFees) {
    messageList.push(tokenPropsMessages['hasFees']);
  }

  return messageList;
};
