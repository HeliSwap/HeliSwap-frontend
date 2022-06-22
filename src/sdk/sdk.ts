import { hethers } from '@hashgraph/hethers';
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  TransactionReceipt,
  TokenAssociateTransaction,
  Transaction,
} from '@hashgraph/sdk';
import Hashconnect from '../connectors/hashconnect';
import { ICreatePairData } from '../interfaces/tokens';
import { addressToId, idToAddress } from '../utils/tokenUtils';
import {
  getAmountWithSlippage,
  getExpirationTime,
  formatStringToBigNumberWei,
  formatStringToBigNumber,
} from '../utils/numberUtils';

import ERC20 from '../abi/ERC20';
import PairV2 from '../abi/PairV2';

class SDK {
  /* Hethers contract calls - To be removed! */
  async checkAllowance(
    tokenAddress: string,
    userAddress: string,
    spenderAddress: string,
    connectedWallet: any,
  ) {
    const erc20 = hethers.ContractFactory.getContract(tokenAddress, ERC20.abi, connectedWallet);

    const allowance = await erc20.allowance(userAddress, spenderAddress, {
      gasLimit: 3000000,
    });

    return allowance;
  }

  async checkBalance(tokenAddress: string, userAddress: string, connectedWallet: any) {
    const erc20 = hethers.ContractFactory.getContract(tokenAddress, ERC20.abi, connectedWallet);

    const balance = await erc20.balanceOf(userAddress, {
      gasLimit: 3000000,
    });

    return balance;
  }

  async getReserves(poolAddess: string, connectedWallet: any) {
    const pairV2 = hethers.ContractFactory.getContract(poolAddess, PairV2.abi, connectedWallet);

    const reserves = await pairV2.getReserves({
      gasLimit: 3000000,
    });

    return reserves;
  }

  async getTotalSupply(poolAddess: string, connectedWallet: any) {
    const pairV2 = hethers.ContractFactory.getContract(poolAddess, PairV2.abi, connectedWallet);

    const totalSupply = await pairV2.totalSupply({
      gasLimit: 3000000,
    });

    return totalSupply;
  }
  /* Hethers contract calls - To be removed! */

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
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

    const amountToApproveBN = formatStringToBigNumber(amount);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(tokenId)
      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'approve',
        new ContractFunctionParameters()
          .addAddress(routerContractAddress)
          .addUint256(amountToApproveBN),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async addNativeLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    createPairData: ICreatePairData,
    slippage: number,
    expiresAfter: number,
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
    const tokenAddress = idToAddress(tokenId);

    const HBARAmount = formatStringToBigNumberWei(HBARAmountString, 0);
    const tokenAmount = formatStringToBigNumberWei(tokenAmountString, tokenDecimals);
    const HBARAmountMin = getAmountWithSlippage(HBARAmountString, 8, slippage, true);
    const tokenAmountMin = getAmountWithSlippage(tokenAmountString, tokenDecimals, slippage, true);

    const userAddress = idToAddress(userId);
    const routerId = addressToId(process.env.REACT_APP_ROUTER_ADDRESS as string);
    const trans = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(routerId)
      //Set the gas for the contract call
      .setGas(3000000)
      //Amount of HBAR we want to provide
      .setPayableAmount(HBARAmount)
      .setFunction(
        'addLiquidityETH',
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
  ) {
    const {
      tokenAAmount: tokenAAmountString,
      tokenAId,
      tokenBAmount: tokenBAmountString,
      tokenBId,
      tokenADecimals,
      tokenBDecimals,
    } = createPairData;

    const tokenAAddress = idToAddress(tokenAId);
    const tokenBAddress = idToAddress(tokenBId);

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
    const trans = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(routerId)
      //Set the gas for the contract call
      .setGas(3000000)
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

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Set the contract function to call
      .setFunction(
        'removeLiquidityETH',
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

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
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

  async swapExactTokensForTokens(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    amountIn: string,
    amountMinOut: any,
    decIn: number,
    decOut: number,
    slippage: number,
    expiresAfter: number,
    path: string[],
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);

    const tokenInAmount = formatStringToBigNumberWei(amountIn, decIn);
    const tokenOutMinAmount = getAmountWithSlippage(amountMinOut, decOut, slippage, true);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Set the contract function to call
      .setFunction(
        'swapExactTokensForTokens',
        new ContractFunctionParameters()
          .addUint256(tokenInAmount)
          .addUint256(tokenOutMinAmount)
          .addAddressArray(path)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async swapExactHBARForTokens(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    amountIn: string,
    amountMinOut: string,
    decOut: number,
    slippage: number,
    expiresAfter: number,
    path: string[],
  ) {
    const HBARAmount = formatStringToBigNumberWei(amountIn, 0);
    const tokenMinOutAmount = getAmountWithSlippage(amountMinOut, decOut, slippage, true);

    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

    const userAddress = idToAddress(userId);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Amount of HBAR we want to provide
      .setPayableAmount(HBARAmount)
      //Set the contract function to call
      .setFunction(
        'swapExactETHForTokens',
        new ContractFunctionParameters()
          .addUint256(tokenMinOutAmount)
          .addAddressArray(path)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async swapExactTokensForHBAR(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    amountIn: string,
    amountMinHBAROut: string,
    decIn: number,
    WHBARDec: number,
    slippage: number,
    expiresAfter: number,
    path: string[],
  ) {
    const tokenInAmount = formatStringToBigNumberWei(amountIn, decIn);
    const HBARAmountMinOut = getAmountWithSlippage(amountMinHBAROut, WHBARDec, slippage, true);

    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

    const userAddress = idToAddress(userId);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Set the contract function to call
      .setFunction(
        'swapExactTokensForETH',
        new ContractFunctionParameters()
          .addUint256(tokenInAmount)
          .addUint256(HBARAmountMinOut)
          .addAddressArray(path)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async swapTokensForExactTokens(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    amountMaxIn: string,
    amountOut: string,
    decIn: number,
    decOut: number,
    slippage: number,
    expiresAfter: number,
    path: string[],
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);

    const tokenOutAmount = formatStringToBigNumberWei(amountOut, decOut);
    const tokenInMaxAmount = getAmountWithSlippage(amountMaxIn, decIn, slippage, false);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Set the contract function to call
      .setFunction(
        'swapTokensForExactTokens',
        new ContractFunctionParameters()
          .addUint256(tokenOutAmount)
          .addUint256(tokenInMaxAmount) //amountIn
          .addAddressArray(path)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async swapTokensForExactHBAR(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    amountMaxIn: string,
    amountHBAROut: string,
    decIn: number,
    HBARDec: number,
    slippage: number,
    expiresAfter: number,
    path: string[],
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);

    const tokenMaxInAmount = getAmountWithSlippage(amountMaxIn, decIn, slippage, false);
    const HBAROutAmount = formatStringToBigNumberWei(amountHBAROut, HBARDec);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Set the contract function to call
      .setFunction(
        'swapTokensForExactETH',
        new ContractFunctionParameters()
          .addUint256(HBAROutAmount)
          .addUint256(tokenMaxInAmount)
          .addAddressArray(path)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async swapHBARForExactTokens(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    HBARMaxIn: string,
    amountOut: string,
    decOut: number,
    slippage: number,
    expiresAfter: number,
    path: string[],
  ) {
    const tokenAmountString = amountOut;
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

    const HBARMaxInAmount = getAmountWithSlippage(HBARMaxIn, 0, slippage, false, true);
    const tokenAmountOut = formatStringToBigNumberWei(tokenAmountString, decOut);

    const userAddress = idToAddress(userId);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Amount of HBAR we want to provide
      .setPayableAmount(HBARMaxInAmount)
      //Set the contract function to call
      .setFunction(
        'swapETHForExactTokens',
        new ContractFunctionParameters()
          .addUint256(tokenAmountOut)
          .addAddressArray(path)
          .addAddress(userAddress)
          .addUint256(getExpirationTime(expiresAfter)),
      );

    return this.sendTransactionAndGetResponse(hashconnectConnectorInstance, trans, userId);
  }

  async wrapHBAR(hashconnectConnectorInstance: Hashconnect, userId: string, HBARIn: string) {
    const WHBARAddress = process.env.REACT_APP_WHBAR_ADDRESS as string;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(WHBARAddress))
      //Set the gas for the contract call
      .setGas(3000000)
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

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(WHBARAddress))
      //Set the gas for the contract call
      .setGas(3000000)
      //Set the contract function to call
      .setFunction('withdraw', new ContractFunctionParameters().addUint256(tokenAmountInNum));

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
