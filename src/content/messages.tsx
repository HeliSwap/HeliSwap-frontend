import { IStringToHTMLElement } from '../interfaces/common';

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
      <span className="text-bold">Pause Key</span> - The key which can sign to freeze or unfreeze an
      account for token transactions. If empty, freezing is not possible.
    </span>
  ),
  supplyKey: (
    <span>
      <span className="text-bold">Supply Key</span> - A Supply key is set and the supply operator
      has special privileges that may result in Manipulating the Pair reserves, thus changing the
      exchange rate and disrupting the Pool. Liquidity providers may suffer from great impermanent
      loss.
    </span>
  ),
  wipeKey: (
    <span>
      <span className="text-bold">Wipe Key</span> - The key which can wipe the token balance of an
      account. If empty, wipe is not possible Problem Wipe key can perform TokenWipe transactions.
      If a user has balance of HTS token and TokenWipe is executed, his token balance will be burned
      by the amount specified in the wipe operation without requesting permissions from the user.
    </span>
  ),

  hasFees: (
    <span>
      <span className="text-bold">Custom fees</span>
    </span>
  ),
};
