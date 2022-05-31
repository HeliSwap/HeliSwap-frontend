import { hethers, BigNumber } from '@hashgraph/hethers';
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  TransactionReceipt,
} from '@hashgraph/sdk';
import Hashconnect from '../connectors/hashconnect';
import { ICreatePairData } from '../interfaces/comon';
import { addressToId, idToAddress } from '../utils/tokenUtils';
import { formatStringToBigNumberEthersWei, formatStringToBigNumberWei } from '../utils/numberUtils';

import ERC20 from '../abi/ERC20';
import PairV2 from '../abi/PairV2';

class SDK {
  getSwapAmountOut(
    amountIn: string,
    amountInRes: string,
    amountOutRes: string,
    decIn: number,
    decOut: number,
  ) {
    //get values in hethers big number
    const amountInBNStrHethers = formatStringToBigNumberEthersWei(amountIn, decIn);
    const amountInResBNStrHethers = BigNumber.from(amountInRes);
    const amountOutResBNStrHethers = BigNumber.from(amountOutRes);

    //replicate contract calculations
    const amountInWithFee = amountInBNStrHethers.mul(997);
    const numerator = amountInWithFee.mul(amountOutResBNStrHethers);
    const denominator = amountInResBNStrHethers.mul(1000).add(amountInWithFee);
    const amountOut = numerator.div(denominator);

    return hethers.utils.formatUnits(amountOut, decOut).toString();
  }

  getSwapAmountIn(
    amountOut: string,
    amountInRes: string,
    amountOutRes: string,
    decIn: number,
    decOut: number,
  ) {
    //get values in hethers big number
    const amountOutBNStrHethers = formatStringToBigNumberEthersWei(amountOut, decOut);
    const amountInResBNStrHethers = BigNumber.from(amountInRes);
    const amountOutResBNStrHethers = BigNumber.from(amountOutRes);

    //replicate contract calculations
    const numerator = amountInResBNStrHethers.mul(amountOutBNStrHethers).mul(1000);
    const denominator = amountOutResBNStrHethers.sub(amountOutBNStrHethers).mul(997);
    const amountIn = numerator.div(denominator).add(1);

    return hethers.utils.formatUnits(amountIn, decIn).toString();
  }

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

  // Works only for erc20 tokens
  async approveToken(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenId: string | ContractId,
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

    const amountToApproveBN = formatStringToBigNumberWei('1000000000');

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

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
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
  }

  async addNativeLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    createPairData: ICreatePairData,
  ) {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
    const {
      tokenAAmount: tokenAAmountString,
      tokenBAmount: tokenBAmountString,
      tokenBId,
    } = createPairData;

    const tokenBAddress = idToAddress(tokenBId);

    const tokenHBARAmount = formatStringToBigNumberWei(tokenAAmountString, 0);
    const tokenBAmount = formatStringToBigNumberWei(tokenBAmountString);

    const userAddress = idToAddress(userId);
    const routerId = addressToId(process.env.REACT_APP_ROUTER_ADDRESS as string);
    const trans = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(routerId)

      //Set the gas for the contract call
      .setGas(3000000)
      //Amount of HBAR we want to provide
      .setPayableAmount(tokenHBARAmount)

      //Set the contract function to call
      .setFunction(
        'addLiquidityETH',
        new ContractFunctionParameters()
          .addAddress(tokenBAddress)
          .addUint256(tokenBAmount)
          .addUint256(tokenBAmount)
          .addUint256(tokenHBARAmount)
          .addAddress(userAddress)
          .addUint256(deadline),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
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
  }

  async addLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    createPairData: ICreatePairData,
  ) {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
    const {
      tokenAAmount: tokenAAmountString,
      tokenAId,
      tokenBAmount: tokenBAmountString,
      tokenBId,
    } = createPairData;

    const tokenAAddress = idToAddress(tokenAId);
    const tokenBAddress = idToAddress(tokenBId);

    const tokenAAmount = formatStringToBigNumberWei(tokenAAmountString);
    const tokenBAmount = formatStringToBigNumberWei(tokenBAmountString);

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
          .addUint256(tokenAAmount)
          .addUint256(tokenBAmount)
          .addAddress(userAddress)
          .addUint256(deadline),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
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
  }

  async removeLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    tokensLpAmount: string,
    tokens0Amount: string,
    tokens1Amount: string,
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;

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
          // @ts-ignore
          .addUint256(tokensLpAmount)
          // @ts-ignore
          .addUint256(tokens0Amount)
          // @ts-ignore
          .addUint256(tokens1Amount)
          .addAddress(userAddress)
          .addUint256(deadline),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
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
  }

  async swapTokens(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenInId: string,
    tokenOutId: string,
    amountIn: string,
    amountMinOut: any,
    decIn: number,
    decOut: number,
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const tokenInAddress = idToAddress(tokenInId);
    const tokenOutAddress = idToAddress(tokenOutId);
    const userAddress = idToAddress(userId);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;

    const tokenInAmount = formatStringToBigNumberWei(amountIn, decIn);
    const tokenOutMinAmount = formatStringToBigNumberWei(amountMinOut, decOut);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))

      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'swapExactTokensForTokens',
        new ContractFunctionParameters()
          .addUint256(tokenInAmount) //amountIn
          .addUint256(tokenOutMinAmount) //amountMinOut
          .addAddressArray([tokenInAddress, tokenOutAddress])
          .addAddress(userAddress)
          .addUint256(deadline),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
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
  }
}

export default SDK;
