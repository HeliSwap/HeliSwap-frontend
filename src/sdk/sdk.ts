import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  TransactionReceipt,
  TokenAssociateTransaction,
  Transaction,
} from '@hashgraph/sdk';
import Hashconnect from '../connectors/hashconnect';
import { ICreatePairData, TokenType } from '../interfaces/tokens';
import {
  addressToId,
  requestAddressFromId,
  idToAddress,
  requestIdFromAddress,
} from '../utils/tokenUtils';
import {
  getAmountWithSlippage,
  getExpirationTime,
  formatStringToBigNumberWei,
  formatStringToBigNumber,
} from '../utils/numberUtils';
import { TRANSACTION_MAX_FEES } from '../constants';

class SDK {
  async associateToken(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenId: string | ContractId,
  ) {
    const trans = await new TokenAssociateTransaction();

    trans.setTokenIds([tokenId]);
    trans.setAccountId(userId);

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async approveToken(
    hashconnectConnectorInstance: Hashconnect,
    amount: string,
    userId: string,
    tokenId: string | ContractId,
    isHTS: boolean,
    spender?: string,
  ) {
    const spenderAddress = spender ? spender : (process.env.REACT_APP_ROUTER_ADDRESS as string);

    const amountToApproveBN = formatStringToBigNumber(amount);
    const maxGas = isHTS ? TRANSACTION_MAX_FEES.APPROVE_HTS : TRANSACTION_MAX_FEES.APPROVE_ERC20;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(tokenId)
      //Set the gas for the contract call
      .setGas(maxGas)

      //Set the contract function to call
      .setFunction(
        'approve',
        new ContractFunctionParameters().addAddress(spenderAddress).addUint256(amountToApproveBN),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async addNativeLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    createPairData: ICreatePairData,
    slippage: number,
    expiresAfter: number,
    poolExists: boolean,
    typeType: TokenType,
  ) {
    const {
      tokenAAmount: tokenAAmountString,
      tokenBAmount: tokenBAmountString,
      tokenAId,
      tokenBId,
      tokenADecimals,
      tokenBDecimals,
    } = createPairData;
    const tokenId = tokenAId ? tokenAId : tokenBId;
    const tokenDecimals = tokenAId ? tokenADecimals : tokenBDecimals;
    const tokenAmountString = tokenAId ? tokenAAmountString : tokenBAmountString;
    const HBARAmountString = tokenAId ? tokenBAmountString : tokenAAmountString;
    const tokenAddress =
      typeType === TokenType.HTS ? idToAddress(tokenId) : await requestAddressFromId(tokenId);

    const HBARAmount = formatStringToBigNumberWei(HBARAmountString, 0);
    const tokenAmount = formatStringToBigNumberWei(tokenAmountString, tokenDecimals);
    const HBARAmountMin = getAmountWithSlippage(HBARAmountString, 8, slippage, true);
    const tokenAmountMin = getAmountWithSlippage(tokenAmountString, tokenDecimals, slippage, true);

    const userAddress = idToAddress(userId);
    const routerId = addressToId(process.env.REACT_APP_ROUTER_ADDRESS as string);
    const maxGas = poolExists
      ? TRANSACTION_MAX_FEES.PROVIDE_LIQUIDITY
      : TRANSACTION_MAX_FEES.CREATE_POOL;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(routerId)
      //Set the gas for the contract call
      .setGas(maxGas)
      //Amount of HBAR we want to provide
      .setPayableAmount(HBARAmount)
      .setFunction(
        'addLiquidityHBAR',
        new ContractFunctionParameters()
          .addAddress(tokenAddress)
          .addUint256(tokenAmount)
          .addUint256(tokenAmountMin)
          .addUint256(HBARAmountMin)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async addLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    createPairData: ICreatePairData,
    slippage: number,
    expiresAfter: number,
    poolExists: boolean,
    typeA: TokenType,
    typeB: TokenType,
  ) {
    const {
      tokenAAmount: tokenAAmountString,
      tokenAId,
      tokenBAmount: tokenBAmountString,
      tokenBId,
      tokenADecimals,
      tokenBDecimals,
    } = createPairData;
    const tokenAAddress =
      typeA === TokenType.HTS ? idToAddress(tokenAId) : await requestAddressFromId(tokenAId);
    const tokenBAddress =
      typeB === TokenType.HTS ? idToAddress(tokenBId) : await requestAddressFromId(tokenBId);

    const tokenAAmount = formatStringToBigNumberWei(tokenAAmountString, tokenADecimals);
    const tokenBAmount = formatStringToBigNumberWei(tokenBAmountString, tokenBDecimals);
    const tokenAAmountMin = getAmountWithSlippage(
      tokenAAmountString,
      tokenADecimals,
      slippage,
      true,
    );
    const tokenBAmountMin = getAmountWithSlippage(
      tokenBAmountString,
      tokenBDecimals,
      slippage,
      true,
    );

    const userAddress = idToAddress(userId);
    const routerId = addressToId(process.env.REACT_APP_ROUTER_ADDRESS as string);
    const maxGas = poolExists
      ? TRANSACTION_MAX_FEES.PROVIDE_LIQUIDITY
      : TRANSACTION_MAX_FEES.CREATE_POOL;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(routerId)
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction(
        'addLiquidity',
        new ContractFunctionParameters()
          .addAddress(tokenAAddress)
          .addAddress(tokenBAddress)
          .addUint256(tokenAAmount)
          .addUint256(tokenBAmount)
          .addUint256(tokenAAmountMin)
          .addUint256(tokenBAmountMin)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async removeNativeLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenAddress: string,
    tokensLpAmount: string,
    tokenAmount: string,
    HBARAmount: string,
    tokenDecimals: number,
    WHBARDecimal: number,
    slippage: number,
    expiresAfter: number,
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);

    const tokenAmountMin = getAmountWithSlippage(tokenAmount, tokenDecimals, slippage, true);
    const HBARAmountMin = getAmountWithSlippage(HBARAmount, WHBARDecimal, slippage, true);
    const tokensLpAmountBN = formatStringToBigNumberWei(tokensLpAmount, 18);
    const maxGas = TRANSACTION_MAX_FEES.REMOVE_NATIVE_LIQUIDITY;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction(
        'removeLiquidityHBAR',
        new ContractFunctionParameters()
          .addAddress(tokenAddress)
          .addUint256(tokensLpAmountBN)
          .addUint256(tokenAmountMin)
          .addUint256(HBARAmountMin)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async removeLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    tokensLpAmount: string,
    tokens0Amount: string,
    tokens1Amount: string,
    token0Decimals: number,
    token1ecimals: number,
    slippage: number,
    expiresAfter: number,
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);

    const tokensLpAmountBN = formatStringToBigNumberWei(tokensLpAmount, 18);

    const tokens0AmountMin = getAmountWithSlippage(tokens0Amount, token0Decimals, slippage, true);
    const tokens1AmountMin = getAmountWithSlippage(tokens1Amount, token1ecimals, slippage, true);
    const maxGas = TRANSACTION_MAX_FEES.REMOVE_LIQUIDITY;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction(
        'removeLiquidity',
        new ContractFunctionParameters()
          .addAddress(tokenInAddress)
          .addAddress(tokenOutAddress)
          .addUint256(tokensLpAmountBN)
          .addUint256(tokens0AmountMin)
          .addUint256(tokens1AmountMin)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async swap(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    amountIn: string,
    amountOut: string,
    decIn: number,
    decOut: number,
    slippage: number,
    expiresAfter: number,
    path: string[],
    tokenInIsNative: boolean,
    tokenOutIsNative: boolean,
    exactAmountIn: boolean,
  ) {
    const getTransactionName = () => {
      if (exactAmountIn) {
        return tokenInIsNative
          ? 'swapExactHBARForTokens'
          : tokenOutIsNative
          ? 'swapExactTokensForHBAR'
          : 'swapExactTokensForTokens';
      } else {
        return tokenInIsNative
          ? 'swapHBARForExactTokens'
          : tokenOutIsNative
          ? 'swapTokensForExactHBAR'
          : 'swapTokensForExactTokens';
      }
    };

    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);

    const tokenInAmount = exactAmountIn
      ? formatStringToBigNumberWei(amountIn, decIn)
      : getAmountWithSlippage(amountIn, decIn, slippage, false);

    const tokenOutAmount = exactAmountIn
      ? getAmountWithSlippage(amountOut, decOut, slippage, true)
      : formatStringToBigNumberWei(amountOut, decOut);

    const extraSwaps = path.length - 2;

    const baseFee =
      tokenInIsNative ||
      tokenOutIsNative ||
      path.includes(process.env.REACT_APP_WHBAR_ADDRESS as string)
        ? TRANSACTION_MAX_FEES.BASE_SWAP_NATIVE
        : TRANSACTION_MAX_FEES.BASE_SWAP;

    const exactOutGas = exactAmountIn
      ? 0
      : extraSwaps !== 0
      ? extraSwaps * TRANSACTION_MAX_FEES.TOKEN_OUT_EXACT_SWAP
      : TRANSACTION_MAX_FEES.TOKEN_OUT_EXACT_SWAP;

    const maxGas = baseFee + extraSwaps * TRANSACTION_MAX_FEES.EXTRA_SWAP + exactOutGas;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(maxGas);

    if (tokenInIsNative) {
      const HBARAmount = exactAmountIn
        ? formatStringToBigNumberWei(amountIn, 0)
        : getAmountWithSlippage(amountIn, 0, slippage, false, true);
      trans //Amount of HBAR we want to provide
        .setPayableAmount(HBARAmount)
        .setFunction(
          getTransactionName(),
          new ContractFunctionParameters()
            .addUint256(tokenOutAmount)
            .addAddressArray(path)
            .addAddress(userAddress)
            .addUint256(getExpirationTime(expiresAfter)),
        );
    } else {
      trans.setFunction(
        getTransactionName(),
        new ContractFunctionParameters()
          .addUint256(exactAmountIn ? tokenInAmount : tokenOutAmount)
          .addUint256(exactAmountIn ? tokenOutAmount : tokenInAmount)
          .addAddressArray(path)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );
    }

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async wrapHBAR(hashconnectConnectorInstance: Hashconnect, userId: string, HBARIn: string) {
    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS as string;
    const maxGas = TRANSACTION_MAX_FEES.WRAP_HBAR;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(WHBARAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Amount of HBAR we want to provide
      .setPayableAmount(HBARIn)
      //Set the contract function to call
      .setFunction('deposit', new ContractFunctionParameters());

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async unwrapHBAR(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenAmountIn: string,
  ) {
    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS as string;
    const tokenAmountInNum = formatStringToBigNumberWei(tokenAmountIn, 8);
    const maxGas = TRANSACTION_MAX_FEES.UNWRAP_WHBAR;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(WHBARAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction('withdraw', new ContractFunctionParameters().addUint256(tokenAmountInNum));

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async transferERC20(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenAddress: string,
    amount: string,
    to: string,
    decimals: number = 18,
  ) {
    const tokenAAmount = formatStringToBigNumberWei(amount, decimals);
    const tokenId = await requestIdFromAddress(tokenAddress);
    const maxGas = TRANSACTION_MAX_FEES.TRANSFER_ERC20;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(tokenId)
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction(
        'transfer',
        new ContractFunctionParameters().addAddress(to).addUint256(tokenAAmount),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async stakeLP(
    hashconnectConnectorInstance: Hashconnect,
    stakeAmount: string,
    campaignAddress: string,
    userId: string,
  ) {
    const tokensLpAmountBN = formatStringToBigNumberWei(stakeAmount, 18);
    const maxGas = TRANSACTION_MAX_FEES.STAKE_LP_TOKEN;
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(campaignAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction('stake', new ContractFunctionParameters().addUint256(tokensLpAmountBN));

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async collectRewards(
    hashconnectConnectorInstance: Hashconnect,
    campaignAddress: string,
    userId: string,
  ) {
    const maxGas = TRANSACTION_MAX_FEES.COLLECT_REWARDS;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(campaignAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction('getReward', new ContractFunctionParameters());

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async exit(hashconnectConnectorInstance: Hashconnect, campaignAddress: string, userId: string) {
    const maxGas = TRANSACTION_MAX_FEES.EXIT_CAMPAIGN;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(campaignAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction('exit', new ContractFunctionParameters());

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async depositHBAR(
    hashconnectConnectorInstance: Hashconnect,
    lockdropAddress: string,
    userId: string,
    HBARAmount: string,
  ) {
    const maxGas = TRANSACTION_MAX_FEES.STAKE_LP_TOKEN;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(lockdropAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Amount of HBAR we want to provide
      .setPayableAmount(HBARAmount)
      //Set the contract function to call
      .setFunction('deposit', new ContractFunctionParameters());

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async withdrawHBAR(
    hashconnectConnectorInstance: Hashconnect,
    lockdropAddress: string,
    userId: string,
    HBARAmount: string,
  ) {
    const maxGas = TRANSACTION_MAX_FEES.STAKE_LP_TOKEN;
    const HBARAmountBN = formatStringToBigNumberWei(HBARAmount, 8);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(lockdropAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Amount of HBAR we want to provide
      //Set the contract function to call
      .setFunction('withdraw', new ContractFunctionParameters().addUint256(HBARAmountBN));

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async claimLP(
    hashconnectConnectorInstance: Hashconnect,
    lockdropAddress: string,
    userId: string,
  ) {
    const maxGas = TRANSACTION_MAX_FEES.STAKE_LP_TOKEN;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(lockdropAddress))
      //Set the gas for the contract call
      .setGas(maxGas)
      //Amount of HBAR we want to provide
      //Set the contract function to call
      .setFunction('claim', new ContractFunctionParameters());

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  sendTransactionAndGetResponse = async (
    hashconnectConnectorInstance: Hashconnect,
    transaction: Transaction,
    userId: string,
  ) => {
    const transactionBytes: Uint8Array = await hashconnectConnectorInstance?.makeBytes(
      transaction,
      userId,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId,
      false,
    );

    const responseData: any = {
      response,
      receipt: null,
    };

    if (response?.success) {
      responseData.receipt = TransactionReceipt.fromBytes(response.receipt as Uint8Array);
    }
    return responseData;
  };
}

export default SDK;
